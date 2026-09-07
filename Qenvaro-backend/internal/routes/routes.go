// Package routes wires together all URL paths with their handlers and middleware.
// Think of this file as the "table of contents" for your API —
// you can see all available endpoints at a glance.
package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"qenvaro-backend/internal/handlers"
	"qenvaro-backend/internal/middleware"
	"qenvaro-backend/internal/services"
)

// Setup registers all routes on the Gin engine.
// It receives the handlers and auth service it needs.
func Setup(
	router *gin.Engine,
	authHandler *handlers.AuthHandler,
	productHandler *handlers.ProductHandler,
	orderHandler *handlers.OrderHandler,
	authService *services.AuthService,
) {
	// ─── CORS Configuration ──────────────────────────────────────────────────
	//
	// What is CORS?
	// CORS (Cross-Origin Resource Sharing) is a browser security feature.
	// An "origin" is the combination of protocol + domain + port.
	// Our React frontend runs at:  http://localhost:5173
	// Our Go backend runs at:      http://localhost:8080
	// These are DIFFERENT origins. By default, browsers BLOCK requests
	// between different origins (for security).
	// We configure CORS to explicitly allow our frontend to talk to the backend.
	//
	// In production you would change AllowOrigins to your real domain.
	corsConfig := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}
	router.Use(cors.New(corsConfig))

	// ─── API Route Group ──────────────────────────────────────────────────────
	// All routes are prefixed with /api
	// e.g. /api/health, /api/products, /api/auth/login
	api := router.Group("/api")

	// ─── Public Routes (no authentication required) ───────────────────────────

	// Health check
	api.GET("/health", handlers.HealthHandler)

	// Authentication
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Products — reading is public, writing is admin-only (see below)
	api.GET("/products", productHandler.GetAll)
	api.GET("/products/:id", productHandler.GetOne)

	// ─── Protected Routes (require valid JWT) ─────────────────────────────────
	// The RequireAuth middleware runs first for every route in this group.
	// If the token is missing or invalid, the request is rejected with 401.
	protected := api.Group("")
	protected.Use(middleware.RequireAuth(authService))
	{
		// ─── Admin-only Product Routes ─────────────────────────────────────
		// RequireAdmin middleware runs after RequireAuth.
		// If the user is authenticated but not an admin, they get a 403.
		adminProducts := protected.Group("/products")
		adminProducts.Use(middleware.RequireAdmin())
		{
			adminProducts.POST("", productHandler.Create)
			adminProducts.PUT("/:id", productHandler.Update)
			adminProducts.DELETE("/:id", productHandler.Delete)
		}

		// ─── Order Routes (authenticated users) ───────────────────────────
		// All authenticated users (customers and admins) can access these.
		// The handlers themselves check roles where needed (e.g. GET all orders).
		orders := protected.Group("/orders")
		{
			orders.POST("", orderHandler.Create)
			orders.GET("", orderHandler.GetAll)
			orders.GET("/:id", orderHandler.GetOne)
		}

		// ─── Admin-only Order Routes ───────────────────────────────────────
		adminOrders := protected.Group("/orders")
		adminOrders.Use(middleware.RequireAdmin())
		{
			adminOrders.PUT("/:id/status", orderHandler.UpdateStatus)
		}
	}
}
