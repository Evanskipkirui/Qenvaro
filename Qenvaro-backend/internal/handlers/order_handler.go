package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"qenvaro-backend/internal/middleware"
	"qenvaro-backend/internal/models"
	"qenvaro-backend/internal/services"
)

// OrderHandler handles all order-related HTTP requests.
type OrderHandler struct {
	orderService *services.OrderService
}

// NewOrderHandler creates a new OrderHandler.
func NewOrderHandler(orderService *services.OrderService) *OrderHandler {
	return &OrderHandler{orderService: orderService}
}

// Create handles POST /api/orders (authenticated customers and admins)
// Creates a new order for the authenticated user.
func (h *OrderHandler) Create(c *gin.Context) {
	var req models.CreateOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get the authenticated user's ID from middleware context
	// This is the REAL user ID from the token — we never trust user_id from the request body
	userID := middleware.GetUserID(c)

	order, err := h.orderService.Create(userID, &req)
	if err != nil {
		// Service returns descriptive errors for stock/product issues
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

// GetAll handles GET /api/orders
// Admins see all orders. Customers see only their own orders.
func (h *OrderHandler) GetAll(c *gin.Context) {
	userID := middleware.GetUserID(c)
	userRole := middleware.GetUserRole(c)

	var orders []models.Order
	var err error

	if userRole == models.RoleAdmin {
		orders, err = h.orderService.GetAllOrders()
	} else {
		orders, err = h.orderService.GetUserOrders(userID)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve orders"})
		return
	}

	if orders == nil {
		orders = []models.Order{}
	}

	c.JSON(http.StatusOK, orders)
}

// GetOne handles GET /api/orders/:id
// Returns one order with its items. Customers can only see their own orders.
func (h *OrderHandler) GetOne(c *gin.Context) {
	orderID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order ID"})
		return
	}

	userID := middleware.GetUserID(c)
	userRole := middleware.GetUserRole(c)

	order, err := h.orderService.GetByID(orderID, userID, userRole)
	if err != nil {
		if err.Error() == "order not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve order"})
		return
	}

	c.JSON(http.StatusOK, order)
}

// UpdateStatus handles PUT /api/orders/:id/status (admin only)
// Updates the status of an order (e.g., from "pending" to "confirmed").
func (h *OrderHandler) UpdateStatus(c *gin.Context) {
	orderID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order ID"})
		return
	}

	var req models.UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.orderService.UpdateStatus(orderID, &req)
	if err != nil {
		if err.Error() == "order not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
			return
		}
		// Invalid status value
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)
}
