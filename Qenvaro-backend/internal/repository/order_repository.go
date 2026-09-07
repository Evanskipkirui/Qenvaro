package repository

import (
	"database/sql"
	"fmt"
	"qenvaro-backend/internal/models"
)

// OrderRepository provides methods to interact with the "orders" and "order_items" tables.
type OrderRepository struct {
	db *sql.DB
}

// NewOrderRepository creates a new OrderRepository.
func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

// CreateWithItems creates an order and its items inside a database TRANSACTION.
//
// What is a transaction?
// A transaction is a group of database operations that either ALL succeed or ALL fail together.
// Example: when placing an order, we need to:
//   1. Create the order row
//   2. Create the order_items rows
//   3. Reduce product stock
//
// If step 2 fails after step 1 already succeeded, we'd have an order with no items.
// A transaction prevents this — if anything fails, ALL changes are rolled back (undone).
// This keeps the database consistent.
func (r *OrderRepository) CreateWithItems(order *models.Order, items []models.OrderItem, productRepo *ProductRepository) (*models.Order, error) {
	// Begin starts a new transaction
	tx, err := r.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("begin transaction: %w", err)
	}

	// defer ensures that if we return early due to an error, the transaction is rolled back.
	// Rollback on a committed transaction is a no-op (safe to call).
	defer tx.Rollback()

	// Step 1: Insert the order
	orderQuery := `
		INSERT INTO orders (user_id, total_amount, status, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, user_id, total_amount, status, created_at, updated_at
	`

	created := &models.Order{}
	err = tx.QueryRow(orderQuery, order.UserID, order.TotalAmount, order.Status).Scan(
		&created.ID, &created.UserID, &created.TotalAmount,
		&created.Status, &created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create order: %w", err)
	}

	// Step 2: Insert each order item and deduct stock
	itemQuery := `
		INSERT INTO order_items (order_id, product_id, quantity, price)
		VALUES ($1, $2, $3, $4)
		RETURNING id, order_id, product_id, quantity, price
	`

	var createdItems []models.OrderItem
	for _, item := range items {
		// Deduct stock within the same transaction
		if err := productRepo.DeductStock(tx, item.ProductID, item.Quantity); err != nil {
			return nil, err // transaction will be rolled back by defer
		}

		// Insert the order item
		var createdItem models.OrderItem
		err = tx.QueryRow(itemQuery, created.ID, item.ProductID, item.Quantity, item.Price).Scan(
			&createdItem.ID, &createdItem.OrderID,
			&createdItem.ProductID, &createdItem.Quantity, &createdItem.Price,
		)
		if err != nil {
			return nil, fmt.Errorf("create order item: %w", err)
		}
		createdItems = append(createdItems, createdItem)
	}

	// Step 3: Commit the transaction — this makes all changes permanent
	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit transaction: %w", err)
	}

	created.Items = createdItems
	return created, nil
}

// FindByUserID returns all orders belonging to a specific user.
func (r *OrderRepository) FindByUserID(userID int64) ([]models.Order, error) {
	query := `
		SELECT id, user_id, total_amount, status, created_at, updated_at
		FROM orders
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	return r.queryOrders(query, userID)
}

// FindAll returns every order (admin use).
func (r *OrderRepository) FindAll() ([]models.Order, error) {
	query := `
		SELECT id, user_id, total_amount, status, created_at, updated_at
		FROM orders
		ORDER BY created_at DESC
	`
	return r.queryOrders(query)
}

// queryOrders is a helper that runs a SELECT query and scans the results into Order structs.
// It accepts optional arguments for parameterized queries (like WHERE user_id = $1).
func (r *OrderRepository) queryOrders(query string, args ...interface{}) ([]models.Order, error) {
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("query orders: %w", err)
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(
			&o.ID, &o.UserID, &o.TotalAmount,
			&o.Status, &o.CreatedAt, &o.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan order: %w", err)
		}
		orders = append(orders, o)
	}
	return orders, rows.Err()
}

// FindByID returns a single order with its items populated.
func (r *OrderRepository) FindByID(id int64) (*models.Order, error) {
	query := `
		SELECT id, user_id, total_amount, status, created_at, updated_at
		FROM orders
		WHERE id = $1
	`

	o := &models.Order{}
	err := r.db.QueryRow(query, id).Scan(
		&o.ID, &o.UserID, &o.TotalAmount,
		&o.Status, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Load the items for this order
	items, err := r.findItemsByOrderID(o.ID)
	if err != nil {
		return nil, err
	}
	o.Items = items

	return o, nil
}

// findItemsByOrderID returns all order_items rows for a given order.
func (r *OrderRepository) findItemsByOrderID(orderID int64) ([]models.OrderItem, error) {
	query := `
		SELECT id, order_id, product_id, quantity, price
		FROM order_items
		WHERE order_id = $1
	`

	rows, err := r.db.Query(query, orderID)
	if err != nil {
		return nil, fmt.Errorf("find order items: %w", err)
	}
	defer rows.Close()

	var items []models.OrderItem
	for rows.Next() {
		var item models.OrderItem
		if err := rows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.Quantity, &item.Price); err != nil {
			return nil, fmt.Errorf("scan order item: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

// UpdateStatus changes the status of an order. Only admins call this.
func (r *OrderRepository) UpdateStatus(id int64, status models.OrderStatus) (*models.Order, error) {
	query := `
		UPDATE orders
		SET status = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING id, user_id, total_amount, status, created_at, updated_at
	`

	o := &models.Order{}
	err := r.db.QueryRow(query, status, id).Scan(
		&o.ID, &o.UserID, &o.TotalAmount,
		&o.Status, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("update order status: %w", err)
	}

	return o, nil
}
