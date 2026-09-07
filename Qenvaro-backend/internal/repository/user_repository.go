// Package repository contains all the direct database queries.
// The repository layer is the ONLY place in the app that talks to PostgreSQL.
// Handlers and services never write SQL — they call repository functions instead.
// This separation makes the code easier to read, test, and maintain.
package repository

import (
	"database/sql"
	"fmt"
	"qenvaro-backend/internal/models"
)

// UserRepository holds the database connection and provides methods
// to create and retrieve users from the "users" table.
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new UserRepository with a database connection.
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create inserts a new user into the "users" table.
// It receives the user struct (with the password already hashed by the service).
// It returns the created user with the database-assigned ID and timestamps.
func (r *UserRepository) Create(user *models.User) (*models.User, error) {
	// We use a parameterized query ($1, $2, ...) to prevent SQL injection.
	// SQL injection is a common attack where malicious input can manipulate your database query.
	// Parameterized queries make this impossible because the values are sent separately from the SQL.
	query := `
		INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, name, email, password_hash, role, created_at, updated_at
	`

	created := &models.User{}
	err := r.db.QueryRow(query,
		user.Name,
		user.Email,
		user.PasswordHash,
		user.Role,
	).Scan(
		&created.ID,
		&created.Name,
		&created.Email,
		&created.PasswordHash,
		&created.Role,
		&created.CreatedAt,
		&created.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}

	return created, nil
}

// FindByEmail looks up a user by their email address.
// This is used during login to find who is trying to log in.
// Returns sql.ErrNoRows if no user with that email exists.
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	query := `
		SELECT id, name, email, password_hash, role, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &models.User{}
	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err // caller checks for sql.ErrNoRows
	}

	return user, nil
}

// FindByID looks up a user by their numeric ID.
// Used when we need to load the full user from the JWT claims.
func (r *UserRepository) FindByID(id int64) (*models.User, error) {
	query := `
		SELECT id, name, email, password_hash, role, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &models.User{}
	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}
