# StockMaster Database ER Diagram

## Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USERS ||--o{ RECEIPTS : "creates"
    USERS ||--o{ DELIVERIES : "creates"
    USERS ||--o{ TRANSFERS : "creates"
    USERS ||--o{ ADJUSTMENTS : "performs"
    USERS ||--o{ LEDGER : "performedBy"
    
    PRODUCTS ||--o{ STOCKS : "has"
    PRODUCTS ||--o{ RECEIPT_LINES : "contains"
    PRODUCTS ||--o{ DELIVERY_LINES : "contains"
    PRODUCTS ||--o{ TRANSFER_LINES : "contains"
    PRODUCTS ||--o{ ADJUSTMENTS : "adjusted"
    PRODUCTS ||--o{ LEDGER : "tracks"
    
    WAREHOUSES ||--o{ STOCKS : "stores"
    WAREHOUSES ||--o{ RECEIPTS : "receives"
    WAREHOUSES ||--o{ DELIVERIES : "ships"
    WAREHOUSES ||--o{ TRANSFERS : "from/to"
    WAREHOUSES ||--o{ ADJUSTMENTS : "location"
    WAREHOUSES ||--o{ LEDGER : "location"
    
    RECEIPTS ||--o{ RECEIPT_LINES : "contains"
    RECEIPTS ||--o{ LEDGER : "generates"
    
    DELIVERIES ||--o{ DELIVERY_LINES : "contains"
    DELIVERIES ||--o{ LEDGER : "generates"
    
    TRANSFERS ||--o{ TRANSFER_LINES : "contains"
    TRANSFERS ||--o{ LEDGER : "generates"
    
    ADJUSTMENTS ||--|| LEDGER : "creates"
    
    USERS {
        ObjectId _id PK
        string email UK
        string passwordHash
        string name
        enum role "ADMIN|WAREHOUSE_MANAGER|STOCK_CLERK|VIEWER"
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    PRODUCTS {
        ObjectId _id PK
        string sku UK
        string name
        string category
        string unit "kg|pcs|L|m"
        number cost
        number price
        number reorderPoint
        array variants
        object metadata
        array imageUrls
        datetime createdAt
        datetime updatedAt
    }
    
    WAREHOUSES {
        ObjectId _id PK
        string name
        string code UK
        string address
        string contact
        string timezone
        string defaultDock
        string currency
        object settings
        datetime createdAt
        datetime updatedAt
    }
    
    STOCKS {
        ObjectId _id PK
        ObjectId productId FK
        ObjectId warehouseId FK
        number qty
        number reserved
        number version "optimistic concurrency"
        datetime updatedAt
        index "productId_warehouseId" UK
    }
    
    RECEIPTS {
        ObjectId _id PK
        string supplier
        string reference "PO-1234"
        ObjectId warehouseId FK
        ObjectId receivedBy FK
        enum status "DRAFT|RECEIVED|CANCELED"
        datetime receivedAt
        datetime createdAt
        datetime updatedAt
    }
    
    RECEIPT_LINES {
        ObjectId _id PK
        ObjectId receiptId FK
        ObjectId productId FK
        number qty
        number unitCost
        string unit
        number total
    }
    
    DELIVERIES {
        ObjectId _id PK
        string customer
        string shippingAddress
        ObjectId warehouseId FK
        ObjectId shippedBy FK
        enum status "DRAFT|READY|SHIPPED|COMPLETED|CANCELED"
        datetime shippedAt
        datetime createdAt
        datetime updatedAt
    }
    
    DELIVERY_LINES {
        ObjectId _id PK
        ObjectId deliveryId FK
        ObjectId productId FK
        number qty
        number unitPrice
        string unit
        number total
    }
    
    TRANSFERS {
        ObjectId _id PK
        ObjectId fromWarehouseId FK
        ObjectId toWarehouseId FK
        ObjectId initiatedBy FK
        enum status "DRAFT|IN_TRANSIT|COMPLETED|CANCELED"
        datetime completedAt
        datetime createdAt
        datetime updatedAt
    }
    
    TRANSFER_LINES {
        ObjectId _id PK
        ObjectId transferId FK
        ObjectId productId FK
        number qty
        string unit
    }
    
    ADJUSTMENTS {
        ObjectId _id PK
        ObjectId productId FK
        ObjectId warehouseId FK
        number adjustedQty "can be negative"
        enum reason "DAMAGE|SHRINKAGE|COUNT_CORRECTION|OTHER"
        string note
        string photoUrl
        ObjectId performedBy FK
        datetime createdAt
    }
    
    LEDGER {
        ObjectId _id PK
        enum eventType "RECEIPT|DELIVERY|TRANSFER_IN|TRANSFER_OUT|ADJUSTMENT"
        ObjectId refId "receipt/delivery/transfer/adjustment id"
        ObjectId productId FK
        ObjectId warehouseId FK
        number beforeQty
        number afterQty
        number delta
        string reason
        string note
        ObjectId performedBy FK
        datetime timestamp
        index "timestamp"
        index "productId_warehouseId"
        index "eventType"
    }
```

## Collection Indexes

### Products
- `sku` - Unique index
- `category` - Index for filtering
- `name` - Text index for search

### Stocks
- `productId + warehouseId` - Unique compound index
- `warehouseId` - Index for warehouse queries
- `productId` - Index for product queries

### Ledger
- `timestamp` - Index for time-based queries (descending)
- `productId + warehouseId` - Compound index for product/warehouse history
- `eventType` - Index for filtering by event type
- `refId` - Index for finding all ledger entries for a transaction

### Receipts
- `warehouseId` - Index for warehouse filtering
- `status` - Index for status filtering
- `receivedAt` - Index for date range queries

### Deliveries
- `warehouseId` - Index for warehouse filtering
- `status` - Index for status filtering
- `shippedAt` - Index for date range queries

### Transfers
- `fromWarehouseId` - Index
- `toWarehouseId` - Index
- `status` - Index

### Adjustments
- `productId + warehouseId` - Compound index
- `performedBy` - Index
- `createdAt` - Index for time-based queries

## Relationships Summary

1. **Users** can create multiple receipts, deliveries, transfers, and adjustments
2. **Products** exist in multiple warehouses (via Stocks)
3. **Stocks** represent the quantity of a product in a specific warehouse
4. **Receipts** contain multiple receipt lines (products)
5. **Deliveries** contain multiple delivery lines (products)
6. **Transfers** contain multiple transfer lines (products)
7. **Ledger** is an immutable audit log of all stock movements
8. Every stock change (receipt, delivery, transfer, adjustment) creates a ledger entry

## Data Integrity Rules

1. Stock quantity cannot go below 0 (enforced at application level)
2. Ledger entries are immutable (no updates/deletes allowed)
3. Every stock change must have a corresponding ledger entry (atomic transaction)
4. Transfers require both source and destination warehouse stocks to be updated atomically
5. SKU must be unique across all products
6. Warehouse code must be unique

