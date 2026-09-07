// Package services contains the business logic of the application.
// A service sits between the handler (HTTP layer) and the repository (database layer).
// It makes decisions: e.g., "should this user be allowed to do this?", "is this data valid?"
// Services do NOT know about HTTP — they work with plain Go structs.
package services

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"qenvaro-backend/internal/models"
	"qenvaro-backend/internal/repository"
)

// AuthService handles user registration and login.
type AuthService struct {
	userRepo  *repository.UserRepository
	jwtSecret string
}

// NewAuthService creates a new AuthService.
func NewAuthService(userRepo *repository.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

// Register creates a new user account.
// It validates the input, checks email uniqueness, hashes the password, and saves the user.
func (s *AuthService) Register(req *models.RegisterRequest) (*models.AuthResponse, error) {
	// Check if email is already taken
	_, err := s.userRepo.FindByEmail(req.Email)
	if err == nil {
		// FindByEmail succeeded, meaning a user with this email already exists
		return nil, errors.New("email already registered")
	}
	if !errors.Is(err, sql.ErrNoRows) {
		// Some unexpected database error
		return nil, fmt.Errorf("check email: %w", err)
	}

	// Hash the password using bcrypt.
	//
	// What is password hashing?
	// Instead of storing "password123" in the database, bcrypt converts it into
	// a scrambled string like "$2a$10$xyz...". This is a one-way process —
	// you cannot reverse it to get "password123" back.
	// When someone logs in, we hash their attempt and compare the two hashes.
	// The cost factor (14) controls how slow the hashing is — slower = harder to crack.
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 14)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	// Build the user struct to save
	user := &models.User{
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hash),
		Role:         models.RoleCustomer, // ALL new users are customers by default
	}

	// Save to database
	saved, err := s.userRepo.Create(user)
	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}

	// Generate a JWT token for the newly registered user so they are logged in immediately
	token, err := s.generateToken(saved)
	if err != nil {
		return nil, fmt.Errorf("generate token: %w", err)
	}

	return &models.AuthResponse{
		Token: token,
		User:  *saved,
	}, nil
}

// Login authenticates a user and returns a JWT token.
func (s *AuthService) Login(req *models.LoginRequest) (*models.AuthResponse, error) {
	// Find the user by email
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// We say "invalid credentials" rather than "email not found"
			// to avoid telling attackers which emails are registered.
			return nil, errors.New("invalid credentials")
		}
		return nil, fmt.Errorf("find user: %w", err)
	}

	// Compare the provided password against the stored hash.
	// bcrypt.CompareHashAndPassword handles the comparison safely.
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Generate JWT token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, fmt.Errorf("generate token: %w", err)
	}

	return &models.AuthResponse{
		Token: token,
		User:  *user,
	}, nil
}

// Claims defines what information we store inside the JWT token.
// When a user sends us the token, we can read these values from it.
type Claims struct {
	UserID int64       `json:"user_id"`
	Role   models.Role `json:"role"`
	jwt.RegisteredClaims
}

// generateToken creates a signed JWT token containing the user's ID and role.
//
// What is a JWT?
// JWT (JSON Web Token) is a string that looks like "xxxxx.yyyyy.zzzzz".
// It has three parts:
//   - Header: algorithm used to sign it
//   - Payload: the data we stored (user ID, role, expiry)
//   - Signature: proves the token was issued by our server (using JWT_SECRET)
//
// The frontend stores this token and sends it with every request that needs auth.
// Our server verifies the signature to make sure the token is real and unmodified.
func (s *AuthService) generateToken(user *models.User) (string, error) {
	claims := &Claims{
		UserID: user.ID,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // token expires in 24 hours
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// Create the token with HS256 signing method (HMAC-SHA256)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with our secret key
	return token.SignedString([]byte(s.jwtSecret))
}

// ValidateToken parses and validates a JWT string.
// Returns the claims (user ID, role) if the token is valid.
// This is used by the auth middleware to protect routes.
func (s *AuthService) ValidateToken(tokenStr string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		// Verify the signing method is what we expect
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	return claims, nil
}
