package models

import "time"

// OrderStatus represents the lifecycle state of an order.
// An order starts as "pending" and an admin moves it through the stages.
type OrderStatus string

const (
	StatusPending   OrderStatus = "pending"
	StatusConfirmed OrderStatus = "confirmed"
	StatusShipped   OrderStatus = "shipped"
	StatusDelivered OrderStatus = "delivered"
	StatusCancelled OrderStatus = "cancelled"
)

// IsValid checks if a given status string is one of the allowed values.
// This prevents an admin from setting a typo like "shiped" as a status.
func (s OrderStatus) IsValid() bool {
	switch s {
	case StatusPending, StatusConfirmed, StatusShipped, StatusDelivered, StatusCancelled:
		return true
	}
	return false
}

// Order represents a row in the "orders" table.
// One user can have many orders.
type Order struct {
	ID          int64       `json:"id"`
	UserID      int64       `json:"user_id"`
	TotalAmount float64     `json:"total_amount"`
	Status      OrderStatus `json:"status"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`

	// Items are the individual products in this order.
	// This field is populated when we need to return full order details.
	Items []OrderItem `json:"items,omitempty"`
}

// OrderItem represents a row in the "order_items" table.
// It links an order to a product, and stores the price at time of purchase.
// Why store price here? Because a product's price might change later,
// but the customer should always see what they actually paid.
type OrderItem struct {
	ID        int64   `json:"id"`
	OrderID   int64   `json:"order_id"`
	ProductID int64   `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"` // price at time of purchase
}

// CreateOrderRequest is the JSON body expected when a customer places an order.
type CreateOrderRequest struct {
	Items []OrderItemRequest `json:"items" binding:"required,min=1,dive,required"`
}

// OrderItemRequest represents one product and quantity in the order request.
type OrderItemRequest struct {
	ProductID int64 `json:"product_id" binding:"required,gt=0"`
	Quantity  int   `json:"quantity"   binding:"required,gt=0"`
}

// UpdateOrderStatusRequest is the JSON body for updating an order's status.
// Only admins can do this.
type UpdateOrderStatusRequest struct {
	Status OrderStatus `json:"status" binding:"required"`
}
