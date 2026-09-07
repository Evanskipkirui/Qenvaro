package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"qenvaro-backend/internal/models"
	"qenvaro-backend/internal/services"
)

// AuthHandler handles registration and login requests.
type AuthHandler struct {
	authService *services.AuthService
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Register handles POST /api/auth/register
// It reads the request body, validates it, and creates a new user.
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest

	// c.ShouldBindJSON reads the JSON body and validates it using the "binding" struct tags.
	// If the JSON is malformed or a required field is missing, it returns an error.
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Call the service to do the actual work
	response, err := h.authService.Register(&req)
	if err != nil {
		// "email already registered" is a 409 Conflict — resource already exists
		if err.Error() == "email already registered" {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "registration failed"})
		return
	}

	// 201 Created is the correct status code when a new resource is created
	c.JSON(http.StatusCreated, response)
}

// Login handles POST /api/auth/login
// It validates credentials and returns a JWT token.
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.authService.Login(&req)
	if err != nil {
		// "invalid credentials" — always 401 for auth failures
		// We use the same message whether email or password is wrong,
		// so attackers can't tell which one they got right.
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	c.JSON(http.StatusOK, response)
}
