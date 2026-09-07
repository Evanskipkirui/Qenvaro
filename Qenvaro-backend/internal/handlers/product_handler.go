package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"qenvaro-backend/internal/models"
	"qenvaro-backend/internal/services"
)

// ProductHandler handles all product-related HTTP requests.
type ProductHandler struct {
	productService *services.ProductService
}

// NewProductHandler creates a new ProductHandler.
func NewProductHandler(productService *services.ProductService) *ProductHandler {
	return &ProductHandler{productService: productService}
}

// Create handles POST /api/products (admin only)
// Creates a new product in the database.
func (h *ProductHandler) Create(c *gin.Context) {
	var req models.CreateProductRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product, err := h.productService.Create(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, product)
}

// GetAll handles GET /api/products (public)
// Returns all products.
func (h *ProductHandler) GetAll(c *gin.Context) {
	products, err := h.productService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve products"})
		return
	}

	// If there are no products yet, return an empty array instead of null.
	// The React frontend expects an array and would crash on null.
	if products == nil {
		products = []models.Product{}
	}

	c.JSON(http.StatusOK, products)
}

// GetOne handles GET /api/products/:id (public)
// Returns a single product by its ID.
func (h *ProductHandler) GetOne(c *gin.Context) {
	// c.Param reads the :id from the URL path
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product ID"})
		return
	}

	product, err := h.productService.GetByID(id)
	if err != nil {
		if err.Error() == "product not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve product"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// Update handles PUT /api/products/:id (admin only)
// Updates an existing product. Only provided fields are changed.
func (h *ProductHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product ID"})
		return
	}

	var req models.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product, err := h.productService.Update(id, &req)
	if err != nil {
		if err.Error() == "product not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update product"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// Delete handles DELETE /api/products/:id (admin only)
// Removes a product from the database.
func (h *ProductHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product ID"})
		return
	}

	if err := h.productService.Delete(id); err != nil {
		if err.Error() == "product not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete product"})
		return
	}

	// 200 OK with a success message (some APIs use 204 No Content, but this is more friendly)
	c.JSON(http.StatusOK, gin.H{"message": "product deleted successfully"})
}
