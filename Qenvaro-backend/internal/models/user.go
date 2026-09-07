// Package models defines the data structures (structs) that represent
// database tables. Each struct maps directly to a table in PostgreSQL.
package models

import "time"

// Role represents what kind of user this is.
// "customer" can browse and order. "admin" can manage products and orders.
type Role string

const (
	RoleCustomer Role = "customer"
	RoleAdmin    Role = "admin"
)

// User represents a row in the "users" table.
// A user can register, log in, and place orders.
type User struct {
	ID           int64     `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`          // json:"-" means this field is NEVER included in JSON responses
	Role         Role      `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// RegisterRequest is the JSON body we expect when someone registers.
// "binding" tags are used by Gin to validate the request automatically.
type RegisterRequest struct {
	Name     string `json:"name"     binding:"required,min=2,max=100"`
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginRequest is the JSON body we expect when someone logs in.
type LoginRequest struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse is what we send back after a successful login or registration.
// It contains the JWT token the frontend will store and send with future requests.
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
