package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/rs/cors"
	"github.com/sebastianpicardo/proyectos/backend/internal/handler"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","message":"Backend en Go corriendo exitosamente"}`))
	})

	mux.HandleFunc("/api/login", handler.LoginHandler)

	allowedOrigins := []string{"http://localhost:3000", "http://localhost:3001"}
	if corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS"); corsOrigins != "" {
		allowedOrigins = strings.Split(corsOrigins, ",")
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handlerWithCORS := c.Handler(mux)

	fmt.Printf("Servidor corriendo en el puerto %s...\n", port)
	if err := http.ListenAndServe(":"+port, handlerWithCORS); err != nil {
		log.Fatalf("Error iniciando servidor: %v", err)
	}
}