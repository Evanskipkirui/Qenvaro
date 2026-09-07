package models

import "time"

// Product represents a row in the "products" table.
// These are the electronics items sold in the Qenvaro marketplace.
type Product struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Image       string    `json:"image"`
	Category    string    `json:"category"`
	Stock       int       `json:"stock"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CreateProductRequest is the JSON body expected when creating a new product.
// Only admins can do this. Gin validates these fields automatically.
type CreateProductRequest struct {
	Name        string  `json:"name"        binding:"required,min=2,max=255"`
	Description string  `json:"description" binding:"required"`
	Price       float64 `json:"price"       binding:"required,gt=0"`       // gt=0 means "greater than 0"
	Image       string  `json:"image"       binding:"required,url"`
	Category    string  `json:"category"    binding:"required"`
	Stock       int     `json:"stock"       binding:"min=0"`               // min=0 means stock can be 0 (out of stock)
}

// UpdateProductRequest is the JSON body expected when updating a product.
// All fields are optional — you only send what you want to change.
// We use pointers (*string, *float64) so we can tell the difference between
// "field not sent" and "field sent as empty/zero".
type UpdateProductRequest struct {
	Name        *string  `json:"name"`
	Description *string  `json:"description"`
	Price       *float64 `json:"price"       binding:"omitempty,gt=0"`
	Image       *string  `json:"image"       binding:"omitempty,url"`
	Category    *string  `json:"category"`
	Stock       *int     `json:"stock"       binding:"omitempty,min=0"`
}
