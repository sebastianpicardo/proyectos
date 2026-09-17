package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","message":"Backend en Go corriendo exitosamente"}`))
	})

	fmt.Printf("Servidor corriendo en el puerto %s...\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Error iniciando servidor: %v", err)
	}
}	x