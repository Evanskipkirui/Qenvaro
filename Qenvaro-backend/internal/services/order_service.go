package services

import (
	"database/sql"
	"errors"
	"fmt"
	"qenvaro-backend/internal/models"
	"qenvaro-backend/internal/repository"
)

// OrderService contains the business logic for order operations.
type OrderService struct {
	orderRepo   *repository.OrderRepository
	productRepo *repository.ProductRepository
}

// NewOrderService creates a new OrderService.
func NewOrderService(orderRepo *repository.OrderRepository, productRepo *repository.ProductRepository) *OrderService {
	return &OrderService{
		orderRepo:   orderRepo,
		productRepo: productRepo,
	}
}

// Create places a new order for a customer.
//
// Important: The total is CALCULATED HERE on the server, not trusted from the frontend.
// Why? Because a malicious user could send a modified request with a total of $0.
// By computing the total ourselves, we ensure accuracy.
func (s *OrderService) Create(userID int64, req *models.CreateOrderRequest) (*models.Order, error) {
	var orderItems []models.OrderItem
	var totalAmount float64

	// For each requested item:
	// 1. Verify the product exists
	// 2. Check there is enough stock
	// 3. Record the current price (so it's stored at time of purchase)
	for _, item := range req.Items {
		product, err := s.productRepo.FindByID(item.ProductID)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return nil, fmt.Errorf("product %d not found", item.ProductID)
			}
			return nil, fmt.Errorf("find product: %w", err)
		}

		// Check stock availability before going further
		if product.Stock < item.Quantity {
			return nil, fmt.Errorf("insufficient stock for product '%s' (requested: %d, available: %d)",
				product.Name, item.Quantity, product.Stock)
		}

		// Add to total: price × quantity
		totalAmount += product.Price * float64(item.Quantity)

		// Build the order item with the CURRENT product price
		orderItems = append(orderItems, models.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     product.Price, // snapshot of price at time of purchase
		})
	}

	// Build the order struct
	order := &models.Order{
		UserID:      userID,
		TotalAmount: totalAmount,
		Status:      models.StatusPending, // all new orders start as "pending"
	}

	// Save order + items + deduct stock in a single transaction
	return s.orderRepo.CreateWithItems(order, orderItems, s.productRepo)
}

// GetAllOrders returns all orders (admin only).
func (s *OrderService) GetAllOrders() ([]models.Order, error) {
	return s.orderRepo.FindAll()
}

// GetUserOrders returns only the orders belonging to a specific user (customer use).
func (s *OrderService) GetUserOrders(userID int64) ([]models.Order, error) {
	return s.orderRepo.FindByUserID(userID)
}

// GetByID returns a single order with items.
// If the user is a customer, we verify the order belongs to them.
// If the user is an admin, they can see any order.
func (s *OrderService) GetByID(orderID int64, requesterID int64, requesterRole models.Role) (*models.Order, error) {
	order, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("order not found")
		}
		return nil, fmt.Errorf("find order: %w", err)
	}

	// Customers can only see their own orders
	if requesterRole == models.RoleCustomer && order.UserID != requesterID {
		return nil, errors.New("order not found") // 404 is safer than 403 (doesn't confirm order exists)
	}

	return order, nil
}

// UpdateStatus changes the order status. Only admins can call this.
func (s *OrderService) UpdateStatus(orderID int64, req *models.UpdateOrderStatusRequest) (*models.Order, error) {
	// Validate the status value
	if !req.Status.IsValid() {
		return nil, fmt.Errorf("invalid status: %s", req.Status)
	}

	// Check the order exists first
	_, err := s.orderRepo.FindByID(orderID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("order not found")
		}
		return nil, fmt.Errorf("find order: %w", err)
	}

	return s.orderRepo.UpdateStatus(orderID, req.Status)
}
