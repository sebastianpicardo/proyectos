package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"conciliador/internal/database"
	"conciliador/internal/handlers"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	godotenv.Load()

	// Initialize database
	if err := database.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer database.CloseDB()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := mux.NewRouter()

	// CORS
	corsMiddleware := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:3000", "https://*.vercel.app"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
		handlers.AllowCredentials(),
	)

	// Public routes
	r.HandleFunc("/ping", pingHandler).Methods("GET")
	r.HandleFunc("/api/auth/login", handlers.LoginHandler).Methods("POST")
	r.HandleFunc("/api/auth/register", handlers.RegisterHandler).Methods("POST")
	r.HandleFunc("/api/auth/google", handlers.GoogleAuthHandler).Methods("GET")
	r.HandleFunc("/api/auth/google/callback", handlers.GoogleCallbackHandler).Methods("GET")
	r.HandleFunc("/api/auth/logout", handlers.LogoutHandler).Methods("POST")
	r.HandleFunc("/api/auth/hcaptcha/verify", handlers.HCaptchaVerifyHandler).Methods("POST")
	r.HandleFunc("/api/plans", handlers.PlansHandler).Methods("GET")

	// Protected routes
	protected := r.PathPrefix("/api").Subrouter()
	protected.Use(handlers.AuthMiddleware)
	protected.HandleFunc("/auth/me", handlers.MeHandler).Methods("GET")
	protected.HandleFunc("/auth/logout", handlers.LogoutHandler).Methods("POST")
	protected.HandleFunc("/profile", handlers.ProfileHandler).Methods("GET", "POST", "PUT")

	// Admin routes
	admin := r.PathPrefix("/api/admin").Subrouter()
	admin.Use(handlers.RequireSuperAdmin)
	admin.HandleFunc("/plans/seed", handlers.SeedPlansHandler).Methods("POST")

	// Health check
	r.HandleFunc("/health", healthHandler).Methods("GET")

	// Apply CORS to all routes
	loggedRouter := corsMiddleware(r)

	fmt.Printf("Servidor corriendo en el puerto %s...\n", port)
	if err := http.ListenAndServe(":"+port, loggedRouter); err != nil {
		log.Fatalf("Error iniciando servidor: %v", err)
	}
}

func pingHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok","message":"Backend en Go corriendo exitosamente"}`))
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"healthy","database":"connected"}`))
}