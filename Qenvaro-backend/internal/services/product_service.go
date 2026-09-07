package services

import (
	"database/sql"
	"errors"
	"fmt"
	"qenvaro-backend/internal/models"
	"qenvaro-backend/internal/repository"
)

// ProductService contains the business logic for product operations.
// It calls the ProductRepository to read/write data.
type ProductService struct {
	productRepo *repository.ProductRepository
}

// NewProductService creates a new ProductService.
func NewProductService(productRepo *repository.ProductRepository) *ProductService {
	return &ProductService{productRepo: productRepo}
}

// Create creates a new product from the validated request.
func (s *ProductService) Create(req *models.CreateProductRequest) (*models.Product, error) {
	p := &models.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Image:       req.Image,
		Category:    req.Category,
		Stock:       req.Stock,
	}

	return s.productRepo.Create(p)
}

// GetAll returns every product.
func (s *ProductService) GetAll() ([]models.Product, error) {
	return s.productRepo.FindAll()
}

// GetByID returns a single product or an error if not found.
func (s *ProductService) GetByID(id int64) (*models.Product, error) {
	p, err := s.productRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("product not found")
		}
		return nil, fmt.Errorf("get product: %w", err)
	}
	return p, nil
}

// Update applies partial updates to a product.
// Only the fields present in the request are changed; others keep their current value.
func (s *ProductService) Update(id int64, req *models.UpdateProductRequest) (*models.Product, error) {
	// First fetch the existing product
	existing, err := s.productRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("product not found")
		}
		return nil, fmt.Errorf("find product: %w", err)
	}

	// Apply only the fields that were provided (non-nil pointers)
	if req.Name != nil {
		existing.Name = *req.Name
	}
	if req.Description != nil {
		existing.Description = *req.Description
	}
	if req.Price != nil {
		existing.Price = *req.Price
	}
	if req.Image != nil {
		existing.Image = *req.Image
	}
	if req.Category != nil {
		existing.Category = *req.Category
	}
	if req.Stock != nil {
		existing.Stock = *req.Stock
	}

	return s.productRepo.Update(existing)
}

// Delete removes a product by ID.
func (s *ProductService) Delete(id int64) error {
	err := s.productRepo.Delete(id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("product not found")
		}
		return fmt.Errorf("delete product: %w", err)
	}
	return nil
}
