# Qenvaro Backend

REST API for the Qenvaro electronics marketplace. Built with Go, Gin, and PostgreSQL.

---

## Project Structure

```
qenvaro-backend/
├── main.go                          # Entry point — wires everything together and starts server
├── go.mod                           # Go module file — lists the project name and dependencies
├── go.sum                           # Checksums for dependencies (auto-generated, don't edit)
├── .env.example                     # Template for your environment variables
├── .gitignore                       # Files Git should ignore (like .env)
│
├── config/
│   └── config.go                    # Reads environment variables into a Config struct
│
├── migrations/
│   ├── 001_create_users.sql         # Creates the users table
│   ├── 002_create_products.sql      # Creates the products table
│   ├── 003_create_orders.sql        # Creates the orders table
│   └── 004_create_order_items.sql   # Creates the order_items table
│
└── internal/                        # Private application code (can't be imported by other projects)
    ├── database/
    │   └── db.go                    # Opens the PostgreSQL connection
    │
    ├── models/
    │   ├── user.go                  # User struct + request/response types
    │   ├── product.go               # Product struct + request/response types
    │   └── order.go                 # Order + OrderItem structs + request/response types
    │
    ├── repository/
    │   ├── user_repository.go       # SQL queries for the users table
    │   ├── product_repository.go    # SQL queries for the products table
    │   └── order_repository.go      # SQL queries for orders and order_items
    │
    ├── services/
    │   ├── auth_service.go          # Registration, login, JWT generation and validation
    │   ├── product_service.go       # Product business logic (CRUD)
    │   └── order_service.go         # Order business logic (create, read, status update)
    │
    ├── handlers/
    │   ├── health_handler.go        # GET /api/health
    │   ├── auth_handler.go          # POST /api/auth/register, POST /api/auth/login
    │   ├── product_handler.go       # Product CRUD handlers
    │   └── order_handler.go         # Order handlers
    │
    ├── middleware/
    │   └── auth_middleware.go       # JWT authentication + role-based authorization
    │
    └── routes/
        └── routes.go                # Wires URLs to handlers, configures CORS
```

### The Request Flow

Every HTTP request follows this path:

```
HTTP Request
     ↓
Gin Router  (routes.go — which URL matches?)
     ↓
Middleware  (auth_middleware.go — is the user authenticated?)
     ↓
Handler     (handlers/ — read request, call service, write response)
     ↓
Service     (services/ — business logic, validation, calculations)
     ↓
Repository  (repository/ — SQL queries)
     ↓
PostgreSQL
     ↓
Repository  (scan rows into structs)
     ↓
Service     (return result)
     ↓
Handler     (JSON response)
     ↓
HTTP Response
```

---

## Getting Started

### 1. Install Go

Download from https://go.dev/dl/ and install.

Verify:
```bash
go version
```

### 2. Install PostgreSQL

Download from https://www.postgresql.org/download/ and install.

### 3. Create the database

Open your PostgreSQL terminal (psql) and run:

```sql
CREATE DATABASE qenvaro;
```

### 4. Configure environment variables

Copy the example file:
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env` with your actual values:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_actual_password
DB_NAME=qenvaro
DB_SSLMODE=disable
PORT=8080
JWT_SECRET=any_long_random_string_you_choose
```

**Never commit `.env` to Git.** It is already in `.gitignore`.

### 5. Run database migrations

Migrations create the database tables. Run them in order:

```bash
psql -U postgres -d qenvaro -f migrations/001_create_users.sql
psql -U postgres -d qenvaro -f migrations/002_create_products.sql
psql -U postgres -d qenvaro -f migrations/003_create_orders.sql
psql -U postgres -d qenvaro -f migrations/004_create_order_items.sql
```

### 6. Install Go dependencies

```bash
go mod tidy
```

### 7. Start the server

```bash
go run main.go
```

You should see:
```
Connected to PostgreSQL successfully
Qenvaro API starting on http://localhost:8080
```

---

## API Reference

### Base URL
```
http://localhost:8080/api
```

### Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

You get the token from `/api/auth/login` or `/api/auth/register`.

---

### Health

#### GET /api/health
No authentication required.

```bash
curl http://localhost:8080/api/health
```

Response:
```json
{ "message": "Qenvaro API is running" }
```

---

### Authentication

#### POST /api/auth/register

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response `201 Created`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/auth/login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response `200 OK` — same structure as register.

---

### Products

#### GET /api/products (public)

```bash
curl http://localhost:8080/api/products
```

#### GET /api/products/:id (public)

```bash
curl http://localhost:8080/api/products/1
```

#### POST /api/products (admin only)

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "HP EliteBook 840",
    "description": "Business laptop with 16GB RAM",
    "price": 75000,
    "image": "https://example.com/elitebook.jpg",
    "category": "Laptops",
    "stock": 10
  }'
```

#### PUT /api/products/:id (admin only)

```bash
curl -X PUT http://localhost:8080/api/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{ "price": 70000, "stock": 8 }'
```

#### DELETE /api/products/:id (admin only)

```bash
curl -X DELETE http://localhost:8080/api/products/1 \
  -H "Authorization: Bearer <admin_token>"
```

---

### Orders

#### POST /api/orders (authenticated)

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "product_id": 1, "quantity": 2 },
      { "product_id": 3, "quantity": 1 }
    ]
  }'
```

Note: The total is calculated by the server. You only send product IDs and quantities.

#### GET /api/orders (authenticated)

```bash
curl http://localhost:8080/api/orders \
  -H "Authorization: Bearer <token>"
```

Customers see only their orders. Admins see all orders.

#### GET /api/orders/:id (authenticated)

```bash
curl http://localhost:8080/api/orders/1 \
  -H "Authorization: Bearer <token>"
```

#### PUT /api/orders/:id/status (admin only)

```bash
curl -X PUT http://localhost:8080/api/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{ "status": "confirmed" }'
```

Valid statuses: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`

---

### Creating an Admin User

There is no admin registration endpoint (for security — anyone could make themselves admin).

To create an admin, register normally then update the role directly in PostgreSQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@qenvaro.com';
```

---

## HTTP Status Codes Used

| Code | Meaning | When used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST (new resource created) |
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Authenticated but not admin |
| 404 | Not Found | Product/order does not exist |
| 409 | Conflict | Email already registered |
| 500 | Internal Server Error | Unexpected server error |

---

## Architecture — Frontend to Backend

```
QENVARO
               |
   ┌───────────┴───────────┐
   ↓                       ↓
React Frontend         Go Backend
localhost:5173         localhost:8080
   │                       │
   │      HTTP / JSON      │
   └───────────────────────┘
                           │
                           ↓
                      PostgreSQL
                      localhost:5432
```

The React frontend sends HTTP requests to the Go backend. The Go backend queries PostgreSQL. The frontend NEVER talks to PostgreSQL directly — only the backend does. This keeps the database secure.

---

## Concepts for Beginners

**What is Go?**
Go (or Golang) is a programming language made by Google. It is fast, simple, and great for building web servers and APIs.

**What is Gin?**
Gin is a web framework for Go. It handles incoming HTTP requests and routes them to the right function (handler). It also handles JSON parsing and response writing.

**What is PostgreSQL?**
PostgreSQL is a database — a system that stores data permanently. In Qenvaro it stores users, products, and orders.

**What is a REST API?**
REST API is a way for two systems to communicate over HTTP. The React frontend sends requests to the Go backend using URLs like `/api/products`. The backend replies with JSON data.

**What is an endpoint?**
An endpoint is a URL your API exposes. For example, `GET /api/products` is an endpoint that returns all products.

**What is CRUD?**
CRUD stands for Create, Read, Update, Delete — the four basic operations on data. In Qenvaro, products support full CRUD.

**What is JSON?**
JSON (JavaScript Object Notation) is a text format for representing data. Example: `{"name": "HP Laptop", "price": 75000}`. It is what the frontend and backend send to each other.

**What is a handler?**
A handler is a Go function that receives an HTTP request and writes an HTTP response. It reads the request body, calls a service, then responds with JSON.

**What is a service?**
A service contains business logic. For example, the order service calculates the total price on the server, checks stock, and prevents negative totals. It doesn't know about HTTP.

**What is a repository?**
A repository is the layer that talks to the database. It contains SQL queries. Only repositories write SQL — everything else calls repository functions.

**What is a database migration?**
A migration is a SQL file that creates or changes database tables. Running them in order sets up your database schema. They are versioned (001, 002...) so you always know what has been applied.

**What is authentication?**
Authentication is proving who you are. In Qenvaro, you prove your identity by logging in with email and password. The server gives you a JWT token to use for future requests.

**What is authorization?**
Authorization is what you are allowed to do. In Qenvaro, customers can place orders but only admins can create/edit/delete products.

**What is JWT?**
JWT (JSON Web Token) is a string the server gives you after login. You send it with every protected request. The server reads it to know who you are and what your role is — without querying the database every time.

**What is CORS?**
CORS (Cross-Origin Resource Sharing) is a browser security feature. Since the React frontend (port 5173) and Go backend (port 8080) run on different ports, they are considered "different origins." CORS configuration tells the browser it's safe for the frontend to talk to the backend.

**How does an order get created?**
1. Customer sends a POST request with product IDs and quantities
2. Server reads the token to get the customer's real user ID
3. Server fetches each product from the database to get current prices
4. Server checks stock availability
5. Server calculates the total (never trusts the frontend's total)
6. Server creates the order, order items, and deducts stock — all in one transaction
7. If anything fails, the transaction rolls back (nothing is partially saved)
