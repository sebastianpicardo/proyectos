package handlers

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gorilla/sessions"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"conciliador/internal/database"
	"conciliador/internal/models"
)

var (
	store = sessions.NewCookieStore([]byte(getSessionSecret()))

	googleOAuthConfig = &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}

	hcaptchaSecret  = os.Getenv("HCAPTCHA_SECRET")
	hcaptchaSiteKey = os.Getenv("HCAPTCHA_SITE_KEY")
)

func getSessionSecret() string {
	if secret := os.Getenv("SESSION_SECRET"); secret != "" {
		return secret
	}
	return "dev-session-secret-change-in-production"
}

func generateID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}

func generateSessionToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func generateState() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// AuthMiddleware checks for valid session
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := store.Get(r, "session")
		userID, ok := session.Values["user_id"].(string)
		if !ok || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var expiresAt time.Time
		err := database.DB.QueryRow(
			"SELECT expires_at FROM sessions WHERE user_id = ? AND token_hash = ?",
			userID, hashToken(session.Values["token"].(string)),
		).Scan(&expiresAt)

		if err != nil || time.Now().After(expiresAt) {
			database.DB.Exec("DELETE FROM sessions WHERE user_id = ?", userID)
			session.Values["user_id"] = ""
			session.Save(r, w)
			http.Error(w, "Session expired", http.StatusUnauthorized)
			return
		}

		r = r.WithContext(r.Context())
		next(w, r)
	}
}

func RequireSuperAdmin(next http.HandlerFunc) http.HandlerFunc {
	return AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		session, _ := store.Get(r, "session")
		userID := session.Values["user_id"].(string)

		var isSuperAdmin bool
		err := database.DB.QueryRow("SELECT is_super_admin FROM users WHERE id = ?", userID).Scan(&isSuperAdmin)
		if err != nil || !isSuperAdmin {
			http.Error(w, "Forbidden: Super admin required", http.StatusForbidden)
			return
		}
		next(w, r)
	})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email         string `json:"email"`
		Password      string `json:"password"`
		HCaptchaToken string `json:"hcaptcha_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if hcaptchaSecret != "" && req.HCaptchaToken != "" {
		if !verifyHCaptcha(req.HCaptchaToken, r.RemoteAddr) {
			http.Error(w, "CAPTCHA verification failed", http.StatusBadRequest)
			return
		}
	} else if hcaptchaSecret != "" {
		http.Error(w, "CAPTCHA required", http.StatusBadRequest)
		return
	}

	var user models.User
	err := database.DB.QueryRow(
		"SELECT id, email, password_hash, name, avatar, provider, google_id, is_super_admin, is_active FROM users WHERE email = ?",
		req.Email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.Avatar, &user.Provider, &user.GoogleID, &user.IsSuperAdmin, &user.IsActive)

	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if !user.IsActive {
		http.Error(w, "Account deactivated", http.StatusForbidden)
		return
	}

	if user.Provider == "email" {
		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}
	} else {
		http.Error(w, "Please login with Google", http.StatusBadRequest)
		return
	}

	token := generateSessionToken()
	tokenHash := hashToken(token)
	expiresAt := time.Now().Add(24 * time.Hour)

	sessionID := generateID()
	_, err = database.DB.Exec(
		"INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
		sessionID, user.ID, tokenHash, expiresAt,
	)
	if err != nil {
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	session, _ := store.Get(r, "session")
	session.Values["user_id"] = user.ID
	session.Values["token"] = token
	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400,
		HttpOnly: true,
		Secure:   os.Getenv("NODE_ENV") == "production",
		SameSite: http.SameSiteLaxMode,
	}
	session.Save(r, w)

	user.PasswordHash = ""
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":  user,
		"token": token,
	})
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Name          string `json:"name"`
		Email         string `json:"email"`
		Password      string `json:"password"`
		HCaptchaToken string `json:"hcaptcha_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if hcaptchaSecret != "" && req.HCaptchaToken != "" {
		if !verifyHCaptcha(req.HCaptchaToken, r.RemoteAddr) {
			http.Error(w, "CAPTCHA verification failed", http.StatusBadRequest)
			return
		}
	} else if hcaptchaSecret != "" {
		http.Error(w, "CAPTCHA required", http.StatusBadRequest)
		return
	}

	var count int
	err := database.DB.QueryRow("SELECT COUNT(*) FROM users WHERE email = ?", req.Email).Scan(&count)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if count > 0 {
		http.Error(w, "Email already registered", http.StatusConflict)
		return
	}

	// Only allow super admin email
	if req.Email != "sebastian.picardo@gmail.com" {
		http.Error(w, "Registration restricted. Contact administrator.", http.StatusForbidden)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	userID := generateID()
	_, err = database.DB.Exec(
		`INSERT INTO users (id, email, password_hash, name, provider, is_super_admin, is_active)
		VALUES (?, ?, ?, ?, 'email', TRUE, TRUE)`,
		userID, req.Email, string(hashedPassword), req.Name,
	)
	if err != nil {
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	token := generateSessionToken()
	tokenHash := hashToken(token)
	expiresAt := time.Now().Add(24 * time.Hour)

	sessionID := generateID()
	_, err = database.DB.Exec(
		"INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
		sessionID, userID, tokenHash, expiresAt,
	)
	if err != nil {
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	session, _ := store.Get(r, "session")
	session.Values["user_id"] = userID
	session.Values["token"] = token
	session.Save(r, w)

	user := models.User{
		ID:           userID,
		Email:        req.Email,
		Name:         req.Name,
		IsSuperAdmin: true,
		IsActive:     true,
		Provider:     "email",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":  user,
		"token": token,
	})
}

func GoogleAuthHandler(w http.ResponseWriter, r *http.Request) {
	state := generateState()
	session, _ := store.Get(r, "session")
	session.Values["oauth_state"] = state
	session.Save(r, w)

	url := googleOAuthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusFound)
}

func GoogleCallbackHandler(w http.ResponseWriter, r *http.Request) {
	// Verify hCaptcha from JSON body (sent by frontend with credential)
	if hcaptchaSecret != "" {
		var req struct {
			Credential    string `json:"credential"`
			HCaptchaToken string `json:"hcaptcha_token"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		if req.HCaptchaToken == "" || !verifyHCaptcha(req.HCaptchaToken, r.RemoteAddr) {
			http.Error(w, "CAPTCHA verification failed", http.StatusBadRequest)
			return
		}
		// Re-use the credential from parsed body
		credential := req.Credential

		session, _ := store.Get(r, "session")
		savedState, _ := session.Values["oauth_state"].(string)
		queryState := r.URL.Query().Get("state")

		if savedState != "" && savedState != r.URL.Query().Get("state") {
			http.Error(w, "Invalid OAuth state", http.StatusBadRequest)
			return
		}

		// Use credential from parsed body instead of URL query
		if credential == "" {
			http.Error(w, "Missing credential", http.StatusBadRequest)
			return
		}

		ctx := context.Background()
		// Use credential as ID token to get user info
		client := googleOAuthConfig.Client(context.Background(), &oauth2.Token{IDToken: credential})
		resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
		if err != nil {
			http.Error(w, "Failed to get user info", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(resp.Body)
		var googleUser struct {
			ID            string `json:"id"`
			Email         string `json:"email"`
			Name          string `json:"name"`
			Picture       string `json:"picture"`
			VerifiedEmail bool   `json:"verified_email"`
		}
		json.Unmarshal(body, &googleUser)

	if !googleUser.VerifiedEmail {
		http.Error(w, "Email not verified", http.StatusBadRequest)
		return
	}

	var existingUser models.User
	err := database.DB.QueryRow(
		"SELECT id, email, name, avatar, provider, google_id, is_super_admin, is_active FROM users WHERE google_id = ? OR email = ?",
		googleUser.ID, googleUser.Email,
	).Scan(&existingUser.ID, &existingUser.Email, &existingUser.Name, &existingUser.Avatar, &existingUser.Provider, &existingUser.GoogleID, &existingUser.IsSuperAdmin, &existingUser.IsActive)

	if err != nil {
		if googleUser.Email != "sebastian.picardo@gmail.com" {
			http.Error(w, "Registration restricted. Contact administrator.", http.StatusForbidden)
			return
		}

		userID := generateID()
		_, err = database.DB.Exec(
			`INSERT INTO users (id, email, name, avatar, provider, google_id, is_super_admin, is_active)
			VALUES (?, ?, ?, ?, 'google', ?, TRUE, TRUE)`,
			userID, googleUser.Email, googleUser.Name, googleUser.Picture, googleUser.ID,
		)
		if err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}
		existingUser = models.User{
			ID:           userID,
			Email:        googleUser.Email,
			Name:         googleUser.Name,
			Avatar:       googleUser.Picture,
			Provider:     "google",
			GoogleID:     googleUser.ID,
			IsSuperAdmin: true,
			IsActive:     true,
		}
	} else {
		_, err = database.DB.Exec(
			"UPDATE users SET name = ?, avatar = ?, google_id = ? WHERE id = ?",
			googleUser.Name, googleUser.Picture, googleUser.ID, existingUser.ID,
		)
		if err != nil {
			http.Error(w, "Failed to update user", http.StatusInternalServerError)
			return
		}
		existingUser.Name = googleUser.Name
		existingUser.Avatar = googleUser.Picture
		existingUser.GoogleID = googleUser.ID
	}

	if !existingUser.IsActive {
		http.Error(w, "Account deactivated", http.StatusForbidden)
		return
	}

	token := generateSessionToken()
	tokenHash := hashToken(token)
	expiresAt := time.Now().Add(24 * time.Hour)

	sessionID := generateID()
	_, err = database.DB.Exec(
		"INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
		sessionID, existingUser.ID, tokenHash, expiresAt,
	)
	if err != nil {
		http.Error(w, "Failed to create session", http.StatusInternalServerError)
		return
	}

	session, _ := store.Get(r, "session")
	session.Values["user_id"] = existingUser.ID
	session.Values["token"] = token
	session.Save(r, w)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	http.Redirect(w, r, frontendURL+"/conciliacion", http.StatusFound)
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session")
	userID, ok := session.Values["user_id"].(string)
	if ok {
		token, _ := session.Values["token"].(string)
		database.DB.Exec("DELETE FROM sessions WHERE user_id = ? AND token_hash = ?", userID, hashToken(token))
	}

	session.Values["user_id"] = ""
	session.Options.MaxAge = -1
	session.Save(r, w)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

func MeHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session")
	userID, ok := session.Values["user_id"].(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var user models.User
	err := database.DB.QueryRow(
		"SELECT id, email, name, avatar, provider, google_id, is_super_admin, is_active, created_at FROM users WHERE id = ?",
		userID,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Avatar, &user.Provider, &user.GoogleID, &user.IsSuperAdmin, &user.IsActive, &user.CreatedAt)

	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	var profileExists bool
	database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = ?)", userID).Scan(&profileExists)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":           user,
		"has_profile":    profileExists,
		"is_super_admin": user.IsSuperAdmin,
	})
}

func ProfileHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session")
	userID, ok := session.Values["user_id"].(string)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	switch r.Method {
	case http.MethodGet:
		var profile models.Profile
		err := database.DB.QueryRow(
			`SELECT id, user_id, company_name, rut, address, phone, plan_id, plan_status, onboarding_completed, created_at, updated_at
			FROM profiles WHERE user_id = ?`,
			userID,
		).Scan(&profile.ID, &profile.UserID, &profile.CompanyName, &profile.RUT, &profile.Address, &profile.Phone, &profile.PlanID, &profile.PlanStatus, &profile.OnboardingCompleted, &profile.CreatedAt, &profile.UpdatedAt)

		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{"profile": nil})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"profile": profile})

	case http.MethodPost, http.MethodPut:
		var req struct {
			CompanyName string `json:"company_name"`
			RUT         string `json:"rut"`
			Address     string `json:"address"`
			Phone       string `json:"phone"`
		}
		json.NewDecoder(r.Body).Decode(&req)

		_, err := database.DB.Exec(`
			INSERT INTO profiles (id, user_id, company_name, rut, address, phone, plan_status, onboarding_completed)
			VALUES (?, ?, ?, ?, ?, ?, 'none', FALSE)
			ON CONFLICT(user_id) DO UPDATE SET
				company_name = excluded.company_name,
				rut = excluded.rut,
				address = excluded.address,
				phone = excluded.phone,
				updated_at = CURRENT_TIMESTAMP
		`, generateID(), userID, req.CompanyName, req.RUT, req.Address, req.Phone)

		if err != nil {
			http.Error(w, "Failed to save profile", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Profile saved"})

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func PlansHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	plans := models.GetDummyPlans()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"plans":        plans,
		"hcaptcha_key": hcaptchaSiteKey,
	})
}

func HCaptchaVerifyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Token string `json:"token"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	success := verifyHCaptcha(req.Token, r.RemoteAddr)

	database.DB.Exec(
		"INSERT INTO captcha_attempts (id, ip_address, success) VALUES (?, ?, ?)",
		generateID(), r.RemoteAddr, success,
	)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": success})
}

func verifyHCaptcha(token, ip string) bool {
	if hcaptchaSecret == "" || token == "" {
		return true
	}

	form := url.Values{}
	form.Set("secret", hcaptchaSecret)
	form.Set("response", token)
	form.Set("remoteip", ip)

	resp, err := http.PostForm("https://hcaptcha.com/siteverify", form)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	var result struct {
		Success bool `json:"success"`
	}
	json.NewDecoder(resp.Body).Decode(&result)
	return result.Success
}

func SeedPlansHandler(w http.ResponseWriter, r *http.Request) {
	plans := models.GetDummyPlans()
	for _, plan := range plans {
		featuresJSON, _ := json.Marshal(plan.Features)
		limitsJSON, _ := json.Marshal(plan.Limits)

		_, err := database.DB.Exec(`
			INSERT INTO plans (id, name, description, price_monthly, price_yearly, features, limits, is_active, sort_order)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				name = excluded.name,
				description = excluded.description,
				price_monthly = excluded.price_monthly,
				price_yearly = excluded.price_yearly,
				features = excluded.features,
				limits = excluded.limits,
				is_active = excluded.is_active,
				sort_order = excluded.sort_order
		`, plan.ID, plan.Name, plan.Description, plan.PriceMonthly, plan.PriceYearly,
			string(featuresJSON), string(limitsJSON), plan.IsActive, plan.SortOrder)
		if err != nil {
			http.Error(w, "Failed to seed plans: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Plans seeded successfully"})
}