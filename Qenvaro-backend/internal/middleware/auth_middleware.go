// Package middleware contains Gin middleware functions.
// Middleware runs BEFORE your handler function — it can check authentication,
// log requests, or add headers. If middleware rejects a request, the handler never runs.
package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"qenvaro-backend/internal/models"
	"qenvaro-backend/internal/services"
)

// Context keys for storing values in Gin's request context.
// We use typed constants to avoid typos when reading/writing context values.
const (
	ContextUserID   = "userID"
	ContextUserRole = "userRole"
)

// RequireAuth is a Gin middleware that validates the JWT token on protected routes.
//
// How it works:
// 1. The client sends the token in the Authorization header: "Bearer <token>"
// 2. We extract the token string
// 3. We validate it using AuthService
// 4. If valid, we store the user ID and role in Gin's context for the handler to use
// 5. If invalid, we return 401 Unauthorized and stop processing
func RequireAuth(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Read the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
			c.Abort() // Stop processing — don't call the handler
			return
		}

		// The header format is "Bearer <token>"
		// We split by space and take the second part
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization header format must be: Bearer <token>"})
			c.Abort()
			return
		}

		tokenStr := parts[1]

		// Validate the token
		claims, err := authService.ValidateToken(tokenStr)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			c.Abort()
			return
		}

		// Store user info in Gin context so handlers can access it
		c.Set(ContextUserID, claims.UserID)
		c.Set(ContextUserRole, claims.Role)

		// c.Next() passes control to the next handler or middleware in the chain
		c.Next()
	}
}

// RequireAdmin is a Gin middleware that ensures the authenticated user is an admin.
// Must be used AFTER RequireAuth (which sets the role in context).
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get(ContextUserRole)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		// Type assertion: convert the interface{} from context back to models.Role
		userRole, ok := role.(models.Role)
		if !ok || userRole != models.RoleAdmin {
			// 403 Forbidden means "authenticated but not allowed"
			// (401 Unauthorized means "not authenticated at all")
			c.JSON(http.StatusForbidden, gin.H{"error": "admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// GetUserID is a helper to read the authenticated user's ID from Gin context.
// Call this in handlers after RequireAuth middleware has run.
func GetUserID(c *gin.Context) int64 {
	id, _ := c.Get(ContextUserID)
	userID, _ := id.(int64)
	return userID
}

// GetUserRole is a helper to read the authenticated user's role from Gin context.
func GetUserRole(c *gin.Context) models.Role {
	role, _ := c.Get(ContextUserRole)
	userRole, _ := role.(models.Role)
	return userRole
}
