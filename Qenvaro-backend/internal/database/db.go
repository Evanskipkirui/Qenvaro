// Package database handles the PostgreSQL connection.
// It creates a single shared database connection pool that the whole app uses.
package database

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq" // This is the PostgreSQL driver for Go's database/sql package.
	// The underscore import means we don't use it directly — it registers itself
	// as a driver behind the scenes. This is a common Go pattern.
)

// Connect opens a connection to PostgreSQL using the provided DSN (connection string).
// It also verifies the connection is alive with Ping().
// Returns the *sql.DB pool that repositories will use to run queries.
func Connect(dsn string) (*sql.DB, error) {
	// sql.Open does NOT actually connect yet — it just validates the DSN format.
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// db.Ping() actually tries to connect and confirms the database is reachable.
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Connection pool settings:
	// These control how many database connections can be open at once.
	// For a beginner project, these defaults are fine.
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	return db, nil
}
