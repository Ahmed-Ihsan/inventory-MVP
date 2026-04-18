# Backend API Documentation

This document provides comprehensive documentation for the Inventory Management API, built with FastAPI.

## Base URL
```
http://localhost:8000
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication

#### Register User
- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: User object
- **Status Codes**: 200 (Success), 400 (Username/Email already exists)

#### Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and get access token
- **Request Body** (Form Data):
  ```
  username: string
  password: string
  ```
- **Response**:
  ```json
  {
    "access_token": "string",
    "token_type": "bearer"
  }
  ```
- **Status Codes**: 200 (Success), 401 (Invalid credentials)

### Items

#### Get Items
- **Endpoint**: `GET /items/`
- **Description**: Retrieve a list of items with optional filtering
- **Query Parameters**:
  - `skip`: int (default: 0) - Number of items to skip
  - `limit`: int (default: 100) - Maximum number of items to return
  - `name`: string (optional) - Filter by item name (case-insensitive partial match)
  - `sku`: string (optional) - Filter by SKU (case-insensitive partial match)
  - `category_id`: int (optional) - Filter by category ID
- **Response**: Array of item objects
- **Status Codes**: 200 (Success)

#### Create Item
- **Endpoint**: `POST /items/`
- **Description**: Create a new inventory item
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string (optional)",
    "sku": "string (unique)",
    "price": "number",
    "category_id": "integer (optional)",
    "min_stock_level": "integer (default: 0)",
    "current_stock": "integer (default: 0)"
  }
  ```
- **Response**: Created item object
- **Status Codes**: 200 (Success), 400 (SKU already exists)

#### Get Item by ID
- **Endpoint**: `GET /items/{item_id}`
- **Description**: Retrieve a specific item by ID
- **Path Parameters**: `item_id` (integer)
- **Response**: Item object
- **Status Codes**: 200 (Success), 404 (Item not found)

#### Update Item
- **Endpoint**: `PUT /items/{item_id}`
- **Description**: Update an existing item
- **Path Parameters**: `item_id` (integer)
- **Request Body**: Same as create, all fields optional
- **Response**: Updated item object
- **Status Codes**: 200 (Success), 400 (SKU already exists), 404 (Item not found)

#### Delete Item
- **Endpoint**: `DELETE /items/{item_id}`
- **Description**: Delete an item
- **Path Parameters**: `item_id` (integer)
- **Response**: `{"message": "Item deleted"}`
- **Status Codes**: 200 (Success), 404 (Item not found)

### Categories

#### Get Categories
- **Endpoint**: `GET /categories/`
- **Description**: Retrieve all categories
- **Query Parameters**:
  - `skip`: int (default: 0)
  - `limit`: int (default: 100)
- **Response**: Array of category objects
- **Status Codes**: 200 (Success)

#### Create Category
- **Endpoint**: `POST /categories/`
- **Description**: Create a new category
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string (optional)"
  }
  ```
- **Response**: Created category object
- **Status Codes**: 200 (Success)

#### Get Category by ID
- **Endpoint**: `GET /categories/{category_id}`
- **Description**: Retrieve a specific category
- **Path Parameters**: `category_id` (integer)
- **Response**: Category object
- **Status Codes**: 200 (Success), 404 (Category not found)

#### Update Category
- **Endpoint**: `PUT /categories/{category_id}`
- **Description**: Update a category
- **Path Parameters**: `category_id` (integer)
- **Request Body**: Same as create
- **Response**: Updated category object
- **Status Codes**: 200 (Success), 404 (Category not found)

#### Delete Category
- **Endpoint**: `DELETE /categories/{category_id}`
- **Description**: Delete a category
- **Path Parameters**: `category_id` (integer)
- **Response**: `{"message": "Category deleted"}`
- **Status Codes**: 200 (Success), 404 (Category not found)

### Stock Management

#### Get Stock Levels
- **Endpoint**: `GET /stock/levels`
- **Description**: Get current stock levels for all items
- **Response**: Array of objects with item stock information
  ```json
  [
    {
      "id": "integer",
      "name": "string",
      "sku": "string",
      "current_stock": "integer",
      "min_stock_level": "integer"
    }
  ]
  ```
- **Status Codes**: 200 (Success)

#### Create Stock Movement
- **Endpoint**: `POST /stock/movement`
- **Description**: Record a stock movement (inbound/outbound)
- **Request Body**:
  ```json
  {
    "item_id": "integer",
    "quantity_change": "integer (positive for inbound, negative for outbound)",
    "reason": "string (e.g., 'inbound', 'outbound', 'adjustment')"
  }
  ```
- **Response**: Created stock movement object
- **Status Codes**: 200 (Success), 404 (Item not found)

#### Get Stock Movements
- **Endpoint**: `GET /stock/movements`
- **Description**: Get stock movement history
- **Query Parameters**:
  - `skip`: int (default: 0)
  - `limit`: int (default: 100)
- **Response**: Array of stock movement objects
- **Status Codes**: 200 (Success)

### Barcode Scanning

#### Scan Barcode
- **Endpoint**: `POST /scanning/scan`
- **Description**: Scan a barcode from an uploaded image
- **Authentication**: Required
- **Request Body**: Image file (multipart/form-data)
- **Response**:
  ```json
  {
    "sku": "string",
    "item": "string (item name)",
    "current_stock": "integer"
  }
  ```
- **Status Codes**: 200 (Success), 400 (Invalid file or barcode not found), 404 (Item not found)

### Alerts

#### Get Active Alerts
- **Endpoint**: `GET /alerts/`
- **Description**: Get all active alerts
- **Response**: Array of alert objects
- **Status Codes**: 200 (Success)

#### Get Alert by ID
- **Endpoint**: `GET /alerts/{alert_id}`
- **Description**: Get a specific alert
- **Path Parameters**: `alert_id` (integer)
- **Response**: Alert object
- **Status Codes**: 200 (Success), 404 (Alert not found)

#### Create Alert
- **Endpoint**: `POST /alerts/`
- **Description**: Create a new alert
- **Request Body**:
  ```json
  {
    "item_id": "integer",
    "alert_type": "string",
    "message": "string",
    "is_active": "boolean (default: true)"
  }
  ```
- **Response**: Created alert object
- **Status Codes**: 201 (Created)

#### Update Alert
- **Endpoint**: `PUT /alerts/{alert_id}`
- **Description**: Update an alert (typically to resolve it)
- **Path Parameters**: `alert_id` (integer)
- **Request Body**:
  ```json
  {
    "is_active": "boolean (optional)",
    "resolved_at": "datetime (optional)"
  }
  ```
- **Response**: Updated alert object
- **Status Codes**: 200 (Success), 404 (Alert not found)

#### Delete Alert
- **Endpoint**: `DELETE /alerts/{alert_id}`
- **Description**: Delete an alert
- **Path Parameters**: `alert_id` (integer)
- **Status Codes**: 204 (No Content), 404 (Alert not found)

### Payments

#### Get Payments
- **Endpoint**: `GET /payments/`
- **Description**: Get payments with optional filtering
- **Query Parameters**:
  - `skip`: int (default: 0)
  - `limit`: int (default: 100)
  - `payment_type`: string (optional) - 'sale' or 'purchase'
  - `status`: string (optional) - 'pending', 'completed', 'overdue', 'cancelled'
  - `item_id`: int (optional)
  - `user_id`: int (optional)
- **Response**: Array of payment objects
- **Status Codes**: 200 (Success)

#### Get Payment by ID
- **Endpoint**: `GET /payments/{payment_id}`
- **Description**: Get a specific payment
- **Path Parameters**: `payment_id` (integer)
- **Response**: Payment object
- **Status Codes**: 200 (Success), 404 (Payment not found)

#### Create Payment
- **Endpoint**: `POST /payments/`
- **Description**: Create a new payment
- **Request Body**:
  ```json
  {
    "item_id": "integer",
    "user_id": "integer",
    "amount": "number",
    "payment_type": "string ('s
