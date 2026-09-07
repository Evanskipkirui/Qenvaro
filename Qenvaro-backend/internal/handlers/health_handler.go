// Package handlers contains the HTTP handler functions.
// A handler receives an HTTP request, calls the appropriate service, and writes the HTTP response.
// Handlers know about HTTP (status codes, JSON, headers). Services do NOT.
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// HealthHandler handles the GET /api/health endpoint.
// This is a simple endpoint to confirm the server is running.
// It requires no authentication — useful for monitoring and quick testing.
func HealthHandler(c *gin.Context) {
	// c.JSON writes a JSON response with the given HTTP status code.
	// gin.H is a shortcut for map[string]interface{} — a simple way to build JSON.
	c.JSON(http.StatusOK, gin.H{
		"message": "Qenvaro API is running",
	})
}
