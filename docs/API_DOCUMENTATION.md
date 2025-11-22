# StockMaster API Documentation

## Overview

This document provides comprehensive API documentation for the StockMaster Inventory Management System. The API is RESTful and uses MongoDB as the database backend.

## Quick Links

- [ER Diagram](./ER_DIAGRAM.md) - Database schema and relationships
- [OpenAPI Specification](./OPENAPI_SPEC.yaml) - Complete API contract in OpenAPI 3.0 format

## Authentication

All endpoints (except `/auth/login` and `/auth/register`) require JWT authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://api.stockmaster.com/v1`

## Core Endpoints

### Authentication

#### POST `/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "WAREHOUSE_MANAGER"
  }
}
```

### Products

#### GET `/products`
List all products with optional filters.

**Query Parameters:**
- `warehouse` (ObjectId) - Filter by warehouse
- `q` (string) - Search query
- `category` (string) - Filter by category
- `limit` (number, default: 50) - Results per page
- `page` (number, default: 1) - Page number

#### POST `/products`
Create a new product.

**Request:**
```json
{
  "sku": "STL-0001",
  "name": "Steel Rod 1kg",
  "category": "Raw Material",
  "unit": "kg",
  "reorderPoint": 10,
  "price": 12.5,
  "cost": 8,
  "variants": [],
  "metadata": {}
}
```

### Stocks

#### GET `/stocks`
Get stock levels.

**Query Parameters:**
- `productId` (ObjectId) - Filter by product
- `warehouseId` (ObjectId) - Filter by warehouse

#### POST `/stocks/adjust`
Adjust stock quantity (creates adjustment and ledger entry).

**Request:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "warehouseId": "507f1f77bcf86cd799439012",
  "adjustedQty": -3,
  "reason": "DAMAGED",
  "note": "3 kg damaged during handling"
}
```

**Example Scenarios:**
1. **Bulk correction**: `0 kg steel → stock –20`
   - `adjustedQty: -20`, `reason: "COUNT_CORRECTION"`, `note: "Found 0 kg"`

2. **Damage**: `3 kg damaged → stock –3`
   - `adjustedQty: -3`, `reason: "DAMAGED"`, `note: "3 kg damaged"`

### Receipts

#### POST `/receipts`
Create a receipt (incoming stock).

**Request:**
```json
{
  "supplier": "Acme Steel",
  "warehouseId": "507f1f77bcf86cd799439012",
  "reference": "PO-1234",
  "lines": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "qty": 20,
      "unitCost": 8,
      "unit": "kg"
    }
  ]
}
```

**Note:** This endpoint atomically:
1. Creates the receipt document
2. Updates stock levels (increases qty)
3. Creates ledger entries for each line item

### Deliveries

#### POST `/deliveries`
Create a delivery (outgoing shipment).

**Request:**
```json
{
  "customer": "Customer A",
  "warehouseId": "507f1f77bcf86cd799439012",
  "shippingAddress": "123 Main St",
  "lines": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "qty": 10,
      "unitPrice": 12.5,
      "unit": "kg"
    }
  ]
}
```

**Note:** This endpoint atomically:
1. Creates the delivery document
2. Updates stock levels (decrements qty)
3. Creates ledger entries for each line item

### Transfers

#### POST `/transfers`
Create an internal transfer between warehouses.

**Request:**
```json
{
  "fromWarehouseId": "507f1f77bcf86cd799439012",
  "toWarehouseId": "507f1f77bcf86cd799439013",
  "lines": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "qty": 25,
      "unit": "kg"
    }
  ]
}
```

**Note:** This endpoint atomically:
1. Creates the transfer document
2. Decrements stock in source warehouse
3. Increments stock in destination warehouse
4. Creates two ledger entries per line (TRANSFER_OUT and TRANSFER_IN)

### Ledger

#### GET `/ledger`
Get immutable audit log of all stock movements.

**Query Parameters:**
- `productId` (ObjectId) - Filter by product
- `warehouseId` (ObjectId) - Filter by warehouse
- `eventType` (enum) - RECEIPT, DELIVERY, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT
- `dateFrom` (datetime) - Start date
- `dateTo` (datetime) - End date
- `limit` (number, default: 100)
- `page` (number, default: 1)

**Response:**
```json
{
  "data": [
    {
      "_id": "...",
      "eventType": "ADJUSTMENT",
      "refId": "...",
      "productId": "...",
      "warehouseId": "...",
      "beforeQty": 20,
      "afterQty": 0,
      "delta": -20,
      "reason": "COUNT_CORRECTION",
      "note": "Found 0 kg",
      "performedBy": "...",
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 150,
    "totalPages": 2
  }
}
```

### Dashboard

#### GET `/dashboard`
Get dashboard KPIs and analytics.

**Query Parameters:**
- `warehouseId` (ObjectId) - Filter by warehouse
- `dateFrom` (date) - Start date
- `dateTo` (date) - End date

**Response:**
```json
{
  "totalProducts": 150,
  "totalStockValue": 125000.50,
  "lowStockCount": 12,
  "todaysReceipts": 5,
  "todaysDeliveries": 8,
  "warehousesOverview": [
    {
      "warehouseId": "...",
      "name": "Warehouse A",
      "totalValue": 75000.25,
      "productCount": 85
    }
  ]
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": {
    "field": "Additional error details"
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content (deleted)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (concurrency conflict)
- `500` - Internal Server Error

## Data Models

### Product
- `sku` (string, unique) - Stock Keeping Unit
- `name` (string) - Product name
- `category` (string) - Product category
- `unit` (enum) - kg, pcs, L, m, box, pallet
- `cost` (number) - Cost price
- `price` (number) - Retail price
- `reorderPoint` (number) - Low stock threshold
- `variants` (array) - Product variants
- `metadata` (object) - Additional metadata
- `imageUrls` (array) - Product images

### Stock
- `productId` (ObjectId) - Reference to product
- `warehouseId` (ObjectId) - Reference to warehouse
- `qty` (number) - Current quantity
- `reserved` (number) - Reserved quantity
- `version` (number) - Optimistic concurrency version

### Ledger Entry
- `eventType` (enum) - Type of event
- `refId` (ObjectId) - Reference to source document
- `productId` (ObjectId) - Product affected
- `warehouseId` (ObjectId) - Warehouse affected
- `beforeQty` (number) - Quantity before change
- `afterQty` (number) - Quantity after change
- `delta` (number) - Change amount
- `reason` (string) - Reason for change
- `note` (string) - Additional notes
- `performedBy` (ObjectId) - User who performed the action
- `timestamp` (datetime) - When the change occurred

## Important Notes

1. **Atomicity**: All stock-changing operations (receipts, deliveries, transfers, adjustments) must atomically update stocks and create ledger entries.

2. **Immutability**: Ledger entries are immutable - they cannot be updated or deleted.

3. **Concurrency**: Use optimistic concurrency control via the `version` field in stocks to prevent conflicts.

4. **Validation**: Stock quantity cannot go below 0 (enforced at application level).

5. **Real-time Updates**: Use WebSocket connections or polling to get real-time updates for dashboard KPIs.

## Testing

Use the provided OpenAPI specification to:
- Generate client SDKs
- Test endpoints with tools like Postman or Insomnia
- Validate request/response schemas

Import `OPENAPI_SPEC.yaml` into your API testing tool of choice.

