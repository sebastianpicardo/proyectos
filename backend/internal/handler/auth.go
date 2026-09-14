package handler

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/sebastianpicardo/proyectos/backend/internal/models"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	const validEmail = "admin@test.com"
	const validPassword = "123456"

	if req.Email != validEmail || req.Password != validPassword {
		http.Error(w, "Credenciales inválidas", http.StatusUnauthorized)
		return
	}

	user := models.User{
		Email: req.Email,
		Name:  "Administrador",
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "dev-secret-change-in-production"
	}

	token, err := models.GenerateToken(user, secret)
	if err != nil {
		http.Error(w, "Error generando token", http.StatusInternalServerError)
		return
	}

	resp := models.LoginResponse{
		Token: token,
		User:  user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}