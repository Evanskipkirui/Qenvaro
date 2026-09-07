// main.go is the entry point of the Qenvaro backend.
// It is the first file Go runs when you start the server.
// Its job is to:
//   1. Load configuration from environment variables
//   2. Connect to PostgreSQL
//   3. Wire up all the layers (repository → service → handler)
//   4. Register all routes
//   5. Start the HTTP server
//
// This pattern of wiring everything together in main.go is called
// "manual dependency injection" and is common in Go.
package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"qenvaro-backend/config"
	"qenvaro-backend/internal/database"
	"qenvaro-backend/internal/handlers"
	"qenvaro-backend/internal/repository"
	"qenvaro-backend/internal/routes"
	"qenvaro-backend/internal/services"
)

func main() {
	// ─── Step 1: Load .env file ───────────────────────────────────────────────
	// godotenv reads the .env file and sets all key=value pairs as environment variables.
	// If .env doesn't exist (e.g., in production where env vars are set directly),
	// we just log a warning and continue — it's not a fatal error.
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found — using environment variables directly")
	}

	// ─── Step 2: Load configuration ───────────────────────────────────────────
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Configuration error: %v", err)
	}

	// ─── Step 3: Connect to PostgreSQL ────────────────────────────────────────
	db, err := database.Connect(cfg.DSN())
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer db.Close() // Close the connection when main() exits
	log.Println("Connected to PostgreSQL successfully")

	// ─── Step 4: Create repositories ─────────────────────────────────────────
	// Repositories get the database connection.
	// They are the ONLY things that run SQL queries.
	userRepo := repository.NewUserRepository(db)
	productRepo := repository.NewProductRepository(db)
	orderRepo := repository.NewOrderRepository(db)

	// ─── Step 5: Create services ──────────────────────────────────────────────
	// Services get repositories. They contain business logic.
	authService := services.NewAuthService(userRepo, cfg.JWTSecret)
	productService := services.NewProductService(productRepo)
	orderService := services.NewOrderService(orderRepo, productRepo)

	// ─── Step 6: Create handlers ──────────────────────────────────────────────
	// Handlers get services. They deal with HTTP requests and responses.
	authHandler := handlers.NewAuthHandler(authService)
	productHandler := handlers.NewProductHandler(productService)
	orderHandler := handlers.NewOrderHandler(orderService)

	// ─── Step 7: Set up Gin router ────────────────────────────────────────────
	// gin.Default() creates a router with two built-in middleware:
	//   - Logger: prints each request to the console
	//   - Recovery: catches any panics and returns 500 instead of crashing
	router := gin.Default()

	// ─── Step 8: Register routes ──────────────────────────────────────────────
	routes.Setup(router, authHandler, productHandler, orderHandler, authService)

	// ─── Step 9: Start the HTTP server ────────────────────────────────────────
	addr := ":" + cfg.Port
	log.Printf("Qenvaro API starting on http://localhost%s", addr)

	// router.Run() blocks until the server is stopped (Ctrl+C)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
