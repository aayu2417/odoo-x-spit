# StockMaster - Inventory Management System

A comprehensive, multi-tenant inventory management system built with Next.js, TypeScript, and MongoDB. This system allows organizations to manage their inventory, track stock movements, handle receipts and deliveries, and maintain a complete audit trail.

Wesite link: https://odoo-x-spit.onrender.com

Video link explaining the code and its features: https://drive.google.com/drive/folders/1wKHD3uaLLvi5IZFzu105Jlejv2smUWGF?usp=sharing


## Features

- **Multi-Tenant Architecture**: Organizations and their employees can access shared data within their organization
- **Product Management**: Complete product catalog with SKU, categories, and stock tracking
- **Receipt Management**: Track incoming stock with validation workflow (Draft → Validated → Completed)
- **Delivery Management**: Manage outgoing stock to customers
- **Internal Transfers**: Transfer stock between warehouse locations
- **Stock Adjustments**: Record and manage inventory adjustments with variance tracking
- **Stock Movements**: Complete audit trail of all stock movements with beginning/ending stock
- **Warehouse Management**: Manage multiple warehouse locations with capacity tracking
- **Units of Measure**: Configure custom units for products
- **Audit Logs**: Track all system changes and user actions
- **Real-time Dashboard**: Monitor key metrics and recent stock movements
- **User Authentication**: Secure login and signup with organization-based access

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** or **pnpm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas account) - [Download](https://www.mongodb.com/try/download/community) or [Sign up for Atlas](https://www.mongodb.com/cloud/atlas)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd v0-inventory-management-system-main
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

Or using pnpm:

```bash
pnpm install
```

### 3. Set Up MongoDB Database

You have two options for MongoDB to access the database.

Add this to the .env.local file you have created:
MONGODB_URI=mongodb+srv://aayu:aayu2417@cluster0.drl5bja.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=inventory

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory of the project:

```bash
touch .env.local
```

Add the following environment variables to `.env.local`:

**For MongoDB Atlas:**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=inventory
```

**For Local MongoDB:**

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=inventory
```

**Important Notes:**

- Replace `username` and `password` with your actual MongoDB credentials
- Replace `cluster.mongodb.net` with your actual cluster URL (for Atlas)
- The `.env.local` file is already in `.gitignore` and won't be committed to version control
- Never commit your actual credentials to the repository

### 5. Run the Development Server

```bash
npm run dev
```

Or using yarn:

```bash
yarn dev
```

Or using pnpm:

```bash
pnpm dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

To create a production build:

```bash
npm run build
npm start
```

## Database Structure

This system uses MongoDB with the following collections. All collections are automatically created when you first use the application.

### Collections Overview

The database contains **11 collections** organized by functionality:

1. **organizations** - Organization/company data
2. **users** - User accounts and authentication
3. **products** - Product catalog
4. **receipts** - Purchase receipts (incoming stock)
5. **deliveries** - Customer deliveries (outgoing stock)
6. **transfers** - Internal stock transfers between warehouses
7. **adjustments** - Stock adjustments and corrections
8. **warehouses** - Warehouse locations
9. **units** - Units of measure
10. **stockMovements** - Complete stock movement history
11. **auditLogs** - System audit trail

### Database Schema Details

#### 1. Organizations Collection

```typescript
{
  _id: ObjectId,
  id: string,              // Format: "ORG-{timestamp}"
  name: string,            // Organization name (case-insensitive matching)
  createdAt: string        // ISO timestamp
}
```

**Features:**

- Case-insensitive name matching for multi-user organizations
- Auto-generated unique ID
- Created timestamp tracking

#### 2. Users Collection

```typescript
{
  _id: ObjectId,
  id: string,              // Format: "USER-{timestamp}"
  email: string,           // Unique email address
  password: string,         // Bcrypt hashed password
  name: string,            // User's display name
  organizationId: string,   // Links to organizations collection
  role: string,            // User role (e.g., "admin")
  createdAt: string        // ISO timestamp
}
```

**Features:**

- Password hashing with bcryptjs
- Organization-based access control
- Email-based authentication

#### 3. Products Collection

```typescript
{
  _id: ObjectId,
  id: string,              // Product ID
  organizationId: string,  // Multi-tenant isolation
  name: string,           // Product name
  sku: string,            // Stock Keeping Unit
  category: string,       // Product category
  uom: string,            // Unit of measure
  stock: number,          // Current stock quantity
  createdAt: string       // ISO timestamp
}
```

**Features:**

- Organization-scoped products
- Real-time stock tracking
- SKU-based identification

#### 4. Receipts Collection

```typescript
{
  _id: ObjectId,
  id: string,              // Receipt ID
  organizationId: string,
  supplier: string,        // Supplier name
  date: string,           // Receipt date
  items: Array<{
    productId: string,
    quantity: number,
    unitPrice: number
  }>,
  status: "Draft" | "Validated" | "Completed",
  total: number,          // Total amount
  createdAt: string
}
```

**Features:**

- Status workflow: Draft → Validated → Completed
- Multiple items per receipt
- Automatic stock movement creation on validation
- Stock updates when status changes to Validated/Completed

#### 5. Deliveries Collection

```typescript
{
  _id: ObjectId,
  id: string,
  organizationId: string,
  customer: string,        // Customer name
  date: string,
  items: Array<{
    productId: string,
    quantity: number
  }>,
  status: "Draft" | "Ready" | "Completed",
  total: number,
  createdAt: string
}
```

**Features:**

- Status workflow: Draft → Ready → Completed
- Stock reduction on completion
- Automatic stock movement tracking

#### 6. Transfers Collection

```typescript
{
  _id: ObjectId,
  id: string,
  organizationId: string,
  productId: string,     // Product being transferred
  from: string,          // Source warehouse
  to: string,            // Destination warehouse
  qty: number,           // Transfer quantity
  status: "Draft" | "Ready" | "Completed",
  date: string,
  createdAt: string
}
```

**Features:**

- Inter-warehouse stock transfers
- Status-based workflow
- Stock movement tracking between locations

#### 7. Adjustments Collection

```typescript
{
  _id: ObjectId,
  id: string,            // Format: "ADJ-{timestamp}"
  organizationId: string,
  productId: string,
  productName: string,
  location: string,       // Warehouse location
  counted: number,       // Physical count
  recorded: number,      // System recorded stock
  variance: number,      // counted - recorded
  reason: string,        // Adjustment reason
  status: "Draft" | "Completed",
  date: string,
  userId: string,
  createdAt: string
}
```

**Features:**

- Variance calculation (counted - recorded)
- Status-based approval workflow
- Stock correction on completion
- Reason tracking for audit purposes

#### 8. Warehouses Collection

```typescript
{
  _id: ObjectId,
  id: string,
  organizationId: string,
  name: string,          // Warehouse name
  location: string,      // Physical location/address
  capacity: number,      // Storage capacity
  createdAt: string
}
```

**Features:**

- Organization-specific warehouses
- Capacity tracking
- Used in transfers and stock movements

#### 9. Units Collection

```typescript
{
  _id: ObjectId,
  id: string,
  organizationId: string,
  name: string,          // Unit name (e.g., "Piece", "Box")
  code: string,         // Unit code (e.g., "PC", "BX")
  createdAt: string
}
```

**Features:**

- Custom units per organization
- Used in product definitions

#### 10. StockMovements Collection

```typescript
{
  _id: ObjectId,
  id: string,
  organizationId: string,
  productId: string,
  productName: string,
  operation: "Receipt" | "Delivery" | "Transfer" | "Adjustment",
  beginning: number,     // Stock before movement
  qty: number,          // Quantity change (+ or -)
  ending: number,       // Stock after movement
  location: string,      // Warehouse location
  date: string,         // Movement date
  user: string,         // User who performed action
  documentId: string,    // Reference to source document
  documentType: string, // "Receipt", "Delivery", etc.
  createdAt: string
}
```

**Features:**

- Complete audit trail of all stock changes
- Beginning/ending stock tracking
- Links to source documents
- User tracking
- Operation type classification
- Sorted by date (newest first)

#### 11. AuditLogs Collection

```typescript
{
  _id: ObjectId,
  id: string,
  organizationId: string,
  action: string,        // "CREATE", "UPDATE", "DELETE", "VALIDATE"
  userId: string,        // User who performed action
  documentType: string,  // "Product", "Receipt", etc.
  documentId: string,   // ID of affected document
  changes: Object,      // Change details
  timestamp: string,     // ISO timestamp
  ipAddress?: string    // Optional IP tracking
}
```

**Features:**

- Complete system audit trail
- User action tracking
- Change history
- Document-level tracking

## Database Features

### Multi-Tenant Architecture

- **Organization Isolation**: All collections (except `organizations`) include `organizationId` field
- **Data Segregation**: Users can only access data from their organization
- **Shared Access**: Multiple users from the same organization share data
- **Organization Matching**: Case-insensitive name matching automatically links users to existing organizations

### Automatic Stock Tracking

- **Stock Movements**: Automatically created when:
  - Receipts are validated or completed
  - Deliveries are completed
  - Transfers are completed
  - Adjustments are completed
- **Stock Updates**: Product stock is automatically updated based on operations
- **Beginning/Ending Stock**: Every movement tracks stock before and after

### Status Workflows

- **Receipts**: Draft → Validated → Completed
- **Deliveries**: Draft → Ready → Completed
- **Transfers**: Draft → Ready → Completed
- **Adjustments**: Draft → Completed

### Data Relationships

- Users → Organizations (many-to-one)
- Products → Organizations (many-to-one)
- Receipts → Products (many-to-many via items)
- Deliveries → Products (many-to-many via items)
- Transfers → Products (many-to-one)
- Adjustments → Products (many-to-one)
- StockMovements → Products (many-to-one)
- All entities → Organizations (multi-tenant)

## First Time Setup

1. **Open the Application**: Navigate to [http://localhost:3000](http://localhost:3000)

2. **Create an Account**:

   - Click on "Sign Up"
   - Enter your email, password, organization name, and your name
   - Click "Sign Up"
   - You'll be redirected to the login page
   - **Note**: If an organization with the same name exists (case-insensitive), you'll be automatically linked to it

3. **Login**:

   - Enter your email and password
   - Click "Login"

4. **Initial Configuration**:

   - Go to **Settings** (gear icon in sidebar)
   - Add at least one **Warehouse** location (required for transfers)
   - Add **Units of Measure** (e.g., "Piece", "Box", "Kg", "Liter")
   - Go to **Products** and add your first products

5. **Start Using the System**:
   - Create receipts for incoming stock (status: Draft → Validated → Completed)
   - Create deliveries for outgoing stock
   - Transfer stock between warehouses
   - Make stock adjustments as needed
   - View audit logs and stock movement history

## Database Operations

### Automatic Operations

The system automatically performs these database operations:

1. **On Receipt Validation**:

   - Creates stock movement records for each item
   - Updates product stock quantities
   - Records audit log entry

2. **On Delivery Completion**:

   - Creates stock movement records
   - Reduces product stock
   - Records audit log entry

3. **On Transfer Completion**:

   - Creates stock movement records
   - Updates product stock (if needed)
   - Records audit log entry

4. **On Adjustment Completion**:
   - Creates stock movement record
   - Updates product stock to counted value
   - Records audit log entry

### Manual Operations

Users can manually:

- Create, update, delete products
- Create, update, delete warehouses
- Create, update, delete units
- Create receipts, deliveries, transfers, adjustments
- Change status of receipts, deliveries, transfers, adjustments

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Troubleshooting

### MongoDB Connection Issues

**Error: "Failed to connect to MongoDB"**

1. Verify your `MONGODB_URI` in `.env.local` is correct
2. For MongoDB Atlas:
   - Check that your IP address is whitelisted
   - Verify your username and password are correct
   - Ensure your cluster is running
3. For Local MongoDB:
   - Check that MongoDB service is running
   - Verify MongoDB is listening on port 27017
   - Try connecting with `mongosh` to test the connection

### Port Already in Use

**Error: "Port 3000 is already in use"**

- Change the port by modifying the dev script in `package.json`:
  ```json
  "dev": "next dev -p 3001"
  ```
- Or stop the process using port 3000

### Module Not Found Errors

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Environment Variables Not Loading

- Ensure `.env.local` is in the root directory
- Restart the development server after changing environment variables
- Check that variable names match exactly (case-sensitive)

### Organization Matching Issues

- Organization names are matched case-insensitively
- If users can't see shared data, ensure they used the exact same organization name (spaces and capitalization don't matter)
- Check the browser console for any errors

### Database Collections Not Created

- Collections are created automatically on first use
- If collections don't appear, check MongoDB connection
- Verify database name in `MONGODB_DB_NAME` environment variable

## Security Notes

- Passwords are hashed using bcryptjs (10 rounds)
- Session data is stored in browser localStorage
- All API requests include organization and user context via headers
- Data is isolated by organization at the database level
- All database queries filter by `organizationId`

## Technology Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Database**: MongoDB (with official MongoDB driver)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Authentication**: Custom implementation with bcryptjs
- **Icons**: Lucide React

## Project Structure

```
v0-inventory-management-system-main/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── products/      # Product CRUD operations
│   │   ├── receipts/      # Receipt management
│   │   ├── deliveries/    # Delivery management
│   │   ├── transfers/     # Transfer management
│   │   ├── adjustments/   # Stock adjustments
│   │   ├── stock-movements/ # Stock movement history
│   │   ├── warehouses/    # Warehouse management
│   │   ├── units/         # Units management
│   │   └── audit-log/     # Audit log retrieval
│   ├── dashboard/         # Dashboard page
│   ├── products/          # Products page
│   ├── receipts/          # Receipts page
│   ├── deliveries/        # Deliveries page
│   ├── transfers/         # Transfers page
│   ├── adjustments/       # Adjustments page
│   ├── ledger/            # Stock movement history page
│   ├── audit-logs/        # Audit logs page
│   └── settings/          # Settings page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── dashboard.tsx     # Dashboard component
│   ├── products-module.tsx
│   ├── receipts-module.tsx
│   ├── deliveries-module.tsx
│   ├── transfers-module.tsx
│   ├── adjustments-module.tsx
│   ├── ledger-module.tsx
│   └── ...
├── lib/                   # Utility functions
│   ├── db.ts             # Database operations (all CRUD functions)
│   ├── mongodb.ts        # MongoDB connection
│   ├── api-helpers.ts    # API helper functions
│   ├── session.ts        # Session management
│   ├── events.ts         # Event system for real-time updates
│   └── models/           # TypeScript interfaces
│       └── index.ts      # All database models
├── public/               # Static assets
├── .env.local            # Environment variables (create this)
├── package.json          # Dependencies
└── README.md            # This file
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas Setup Guide](MONGODB_SETUP.md)

---

**Note**: This is a production-ready inventory management system. Ensure you have proper backups of your MongoDB database and follow security best practices when deploying to production.
