package repository

import (
	"database/sql"
	"fmt"
	"qenvaro-backend/internal/models"
)

// ProductRepository provides methods to interact with the "products" table.
type ProductRepository struct {
	db *sql.DB
}

// NewProductRepository creates a new ProductRepository.
func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// Create inserts a new product and returns the saved product (with ID and timestamps).
func (r *ProductRepository) Create(p *models.Product) (*models.Product, error) {
	query := `
		INSERT INTO products (name, description, price, image, category, stock, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		RETURNING id, name, description, price, image, category, stock, created_at, updated_at
	`

	created := &models.Product{}
	err := r.db.QueryRow(query,
		p.Name, p.Description, p.Price, p.Image, p.Category, p.Stock,
	).Scan(
		&created.ID, &created.Name, &created.Description,
		&created.Price, &created.Image, &created.Category,
		&created.Stock, &created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create product: %w", err)
	}

	return created, nil
}

// FindAll returns every product in the database.
// In a larger app you would add pagination, but for learning this is clear and simple.
func (r *ProductRepository) FindAll() ([]models.Product, error) {
	query := `
		SELECT id, name, description, price, image, category, stock, created_at, updated_at
		FROM products
		ORDER BY created_at DESC
	`

	// db.Query returns multiple rows (unlike QueryRow which returns one)
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("find all products: %w", err)
	}
	defer rows.Close() // Always close rows when done to free up the database connection

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(
			&p.ID, &p.Name, &p.Description,
			&p.Price, &p.Image, &p.Category,
			&p.Stock, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan product: %w", err)
		}
		products = append(products, p)
	}

	// rows.Err() catches any error that happened during iteration
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return products, nil
}

// FindByID returns a single product by its ID.
// Returns sql.ErrNoRows if no product with that ID exists.
func (r *ProductRepository) FindByID(id int64) (*models.Product, error) {
	query := `
		SELECT id, name, description, price, image, category, stock, created_at, updated_at
		FROM products
		WHERE id = $1
	`

	p := &models.Product{}
	err := r.db.QueryRow(query, id).Scan(
		&p.ID, &p.Name, &p.Description,
		&p.Price, &p.Image, &p.Category,
		&p.Stock, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return p, nil
}

// Update modifies an existing product. It only updates the fields that were provided.
// updated_at is always set to NOW() so we know when it was last changed.
func (r *ProductRepository) Update(p *models.Product) (*models.Product, error) {
	query := `
		UPDATE products
		SET name=$1, description=$2, price=$3, image=$4, category=$5, stock=$6, updated_at=NOW()
		WHERE id=$7
		RETURNING id, name, description, price, image, category, stock, created_at, updated_at
	`

	updated := &models.Product{}
	err := r.db.QueryRow(query,
		p.Name, p.Description, p.Price, p.Image, p.Category, p.Stock, p.ID,
	).Scan(
		&updated.ID, &updated.Name, &updated.Description,
		&updated.Price, &updated.Image, &updated.Category,
		&updated.Stock, &updated.CreatedAt, &updated.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("update product: %w", err)
	}

	return updated, nil
}

// Delete removes a product by ID.
// Returns the number of rows affected so we know if the product existed.
func (r *ProductRepository) Delete(id int64) error {
	query := `DELETE FROM products WHERE id = $1`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("delete product: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows // product did not exist
	}

	return nil
}

// DeductStock reduces a product's stock by a given quantity.
// This is called inside a transaction when creating an order.
// The tx parameter is a database transaction — explained more in the order repository.
func (r *ProductRepository) DeductStock(tx *sql.Tx, productID int64, quantity int) error {
	query := `
		UPDATE products
		SET stock = stock - $1, updated_at = NOW()
		WHERE id = $2 AND stock >= $1
	`

	// "AND stock >= $1" ensures we never set stock below 0.
	// If stock is insufficient, 0 rows are affected and we return an error.
	result, err := tx.Exec(query, quantity, productID)
	if err != nil {
		return fmt.Errorf("deduct stock: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("insufficient stock for product %d", productID)
	}

	return nil
}
