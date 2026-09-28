package database

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"

	"conciliador/internal/models"
)

type JSONStore struct {
	mu         sync.RWMutex
	dataPath   string
	users      map[string]*models.User
	profiles   map[string]*models.Profile
	plans      map[string]*models.Plan
	sessions   map[string]*models.Session
	captcha    []models.CaptchaAttempt
}

var Store *JSONStore

func InitDB() error {
	dbPath := getDBPath()
	
	// Ensure directory exists
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create db directory: %w", err)
	}

	store := &JSONStore{
		dataPath: dbPath,
		users:    make(map[string]*models.User),
		profiles: make(map[string]*models.Profile),
		plans:    make(map[string]*models.Plan),
		sessions: make(map[string]*models.Session),
		captcha:  []models.CaptchaAttempt{},
	}

	// Load from file if exists
	if err := store.load(); err != nil {
		log.Printf("Warning: failed to load database: %v", err)
	}

	// Seed super admin if not exists
	if err := store.seedSuperAdmin(); err != nil {
		return fmt.Errorf("failed to seed super admin: %w", err)
	}

	// Seed dummy plans
	store.seedPlans()

	Store = store
	log.Println("JSON database initialized successfully")
	return nil
}

func getDBPath() string {
	if path := os.Getenv("DATABASE_PATH"); path != "" {
		return path
	}
	return "./data/conciliador.json"
}

func (s *JSONStore) load() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := os.ReadFile(s.dataPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil // File doesn't exist yet, that's OK
		}
		return err
	}

	var dump struct {
		Users    map[string]*models.User    `json:"users"`
		Profiles map[string]*models.Profile `json:"profiles"`
		Plans    map[string]*models.Plan    `json:"plans"`
		Sessions map[string]*models.Session `json:"sessions"`
		Captcha  []models.CaptchaAttempt    `json:"captcha"`
	}

	if err := json.Unmarshal(data, &dump); err != nil {
		return err
	}

	s.users = dump.Users
	s.profiles = dump.Profiles
	s.plans = dump.Plans
	s.sessions = dump.Sessions
	s.captcha = dump.Captcha

	// Clean up expired sessions
	now := time.Now()
	for id, sess := range s.sessions {
		if now.After(sess.ExpiresAt) {
			delete(s.sessions, id)
		}
	}

	return nil
}

func (s *JSONStore) save() error {
	s.mu.RLock()
	defer s.mu.RUnlock()

	dump := struct {
		Users    map[string]*models.User    `json:"users"`
		Profiles map[string]*models.Profile `json:"profiles"`
		Plans    map[string]*models.Plan    `json:"plans"`
		Sessions map[string]*models.Session `json:"sessions"`
		Captcha  []models.CaptchaAttempt    `json:"captcha"`
	}{
		Users:    s.users,
		Profiles: s.profiles,
		Plans:    s.plans,
		Sessions: s.sessions,
		Captcha:  s.captcha,
	}

	data, err := json.MarshalIndent(dump, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.dataPath, data, 0644)
}

func (s *JSONStore) seedSuperAdmin() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.users["super-admin-001"]; exists {
		// Update to ensure super admin status
		if u, ok := s.users["super-admin-001"]; ok {
			u.IsSuperAdmin = true
			u.IsActive = true
			u.Email = "sebastian.picardo@gmail.com"
		}
		return nil
	}

	s.users["super-admin-001"] = &models.User{
		ID:           "super-admin-001",
		Email:        "sebastian.picardo@gmail.com",
		Name:         "Sebastián Picardo",
		IsSuperAdmin: true,
		IsActive:     true,
		Provider:     "email",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	return s.save()
}

func (s *JSONStore) seedPlans() {
	s.mu.Lock()
	defer s.mu.Unlock()

	plans := models.GetDummyPlans()
	for _, plan := range plans {
		s.plans[plan.ID] = &plan
	}
	s.save()
}

// User operations
func (s *JSONStore) GetUserByEmail(email string) (*models.User, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, u := range s.users {
		if u.Email == email {
			return u, true
		}
	}
	return nil, false
}

func (s *JSONStore) GetUserByID(id string) (*models.User, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	u, ok := s.users[id]
	return u, ok
}

func (s *JSONStore) GetUserByGoogleID(googleID string) (*models.User, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, u := range s.users {
		if u.GoogleID == googleID {
			return u, true
		}
	}
	return nil, false
}

func (s *JSONStore) CreateUser(user *models.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.users[user.ID] = user
	return s.save()
}

func (s *JSONStore) UpdateUser(user *models.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	user.UpdatedAt = time.Now()
	s.users[user.ID] = user
	return s.save()
}

// Profile operations
func (s *JSONStore) GetProfile(userID string) (*models.Profile, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, p := range s.profiles {
		if p.UserID == userID {
			return p, true
		}
	}
	return nil, false
}

func (s *JSONStore) UpsertProfile(profile *models.Profile) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	profile.UpdatedAt = time.Now()
	s.profiles[profile.ID] = profile
	return s.save()
}

// Session operations
func (s *JSONStore) CreateSession(session *models.Session) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[session.ID] = session
	return s.save()
}

func (s *JSONStore) GetSession(userID, tokenHash string) (*models.Session, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, s := range s.sessions {
		if s.UserID == userID && s.TokenHash == tokenHash {
			return s, true
		}
	}
	return nil, false
}

func (s *JSONStore) DeleteSession(userID, tokenHash string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for id, s := range s.sessions {
		if s.UserID == userID && s.TokenHash == tokenHash {
			delete(s.sessions, id)
			break
		}
	}
	return s.save()
}

func (s *JSONStore) CleanExpiredSessions() {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	for id, sess := range s.sessions {
		if now.After(sess.ExpiresAt) {
			delete(s.sessions, id)
		}
	}
	s.save()
}

// Plan operations
func (s *JSONStore) GetPlans() []*models.Plan {
	s.mu.RLock()
	defer s.mu.RUnlock()
	plans := make([]*models.Plan, 0, len(s.plans))
	for _, p := range s.plans {
		if p.IsActive {
			plans = append(plans, p)
		}
	}
	return plans
}

func (s *JSONStore) GetPlan(id string) (*models.Plan, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	p, ok := s.plans[id]
	return p, ok
}

// Captcha operations
func (s *JSONStore) LogCaptchaAttempt(attempt models.CaptchaAttempt) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.captcha = append(s.captcha, attempt)
	return s.save()
}

// Global accessor functions
func GetUserByEmail(email string) (*models.User, bool) {
	if Store == nil {
		return nil, false
	}
	return Store.GetUserByEmail(email)
}

func GetUserByID(id string) (*models.User, bool) {
	if Store == nil {
		return nil, false
	}
	return Store.GetUserByID(id)
}

func GetUserByGoogleID(googleID string) (*models.User, bool) {
	if Store == nil {
		return nil, false
	}
	return Store.GetUserByGoogleID(googleID)
}

func CreateUser(user *models.User) error {
	if Store == nil {
		return fmt.Errorf("store not initialized")
	}
	return Store.CreateUser(user)
}

func UpdateUser(user *models.User) error {
	if Store == nil {
		return fmt.Errorf("store not initialized")
	}
	return Store.UpdateUser(user)
}

func GetProfile(userID string) (*models.Profile, bool) {
	if Store == nil {
		return nil, false
	}
	return Store.GetProfile(userID)
}

func UpsertProfile(profile *models.Profile) error {
	if Store == nil {
		return fmt.Errorf("store not initialized")
	}
	return Store.UpsertProfile(profile)
}

func CreateSession(session *models.Session) error {
	if Store == nil {
		return fmt.Errorf("store not initialized")
	}
	return Store.CreateSession(session)
}

func GetSession(userID, tokenHash string) (*models.Session, bool) {
	if Store == nil {
		return nil, false
	}
	return Store.GetSession(userID, tokenHash)
}

func DeleteSession(userID, tokenHash string) error {
	if Store == nil {
		return fmt.Errorf("store not initialized")
	}
	return Store.DeleteSession(userID, tokenHash)
}

func GetPlans() []*models.Plan {
	if Store == nil {
		return nil
	}
	return Store.GetPlans()
}

func GetPlan(id string) (*models.Plan, bool) {
	if Store == nil {
		return nil, false
	}
	return Store.GetPlan(id)
}

func LogCaptchaAttempt(attempt models.CaptchaAttempt) error {
	if Store == nil {
		return fmt.Errorf("store not initialized")
	}
	return Store.LogCaptchaAttempt(attempt)
}

func InitDB() error {
	return nil // Already initialized via InitDB() call
}

func CloseDB() {
	if Store != nil {
		Store.save()
	}
}

func getDBPath() string {
	if path := os.Getenv("DATABASE_PATH"); path != "" {
		return path
	}
	return "./data/conciliador.json"
}