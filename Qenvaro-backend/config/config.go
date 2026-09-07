// Package config loads and holds all application configuration.
// It reads values from environment variables (set in your .env file).
// This keeps secrets like database passwords out of the source code.
package config

import (
	"fmt"
	"os"
)

// Config holds all configuration values the application needs to run.
// Think of this as a settings object that the rest of the app can use.
type Config struct {
	// Database connection settings
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	// The port the HTTP server will listen on (e.g. "8080")
	Port string

	// Secret key used to sign JWT tokens - must stay private
	JWTSecret string
}

// Load reads configuration from environment variables and returns a Config.
// Call this once at startup (in main.go) and pass the result around.
func Load() (*Config, error) {
	cfg := &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "qenvaro"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),
		Port:       getEnv("PORT", "8080"),
		JWTSecret:  getEnv("JWT_SECRET", ""),
	}

	// Validate that required secrets are actually set.
	// We don't want the app to start with empty critical values.
	if cfg.DBPassword == "" {
		return nil, fmt.Errorf("DB_PASSWORD environment variable is required")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET environment variable is required")
	}

	return cfg, nil
}

// DSN (Data Source Name) returns the PostgreSQL connection string.
// Gin uses this string to know HOW to connect to the database.
// Example: "host=localhost port=5432 user=postgres password=... dbname=qenvaro sslmode=disable"
func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName, c.DBSSLMode,
	)
}

// getEnv reads an environment variable by key.
// If it is not set, it returns the fallback default value.
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
