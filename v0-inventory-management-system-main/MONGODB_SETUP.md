# MongoDB Setup Guide

This inventory management system has been integrated with MongoDB. Follow these steps to set up your database:

## 1. Install MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string from "Connect" → "Connect your application"

### Option B: Local MongoDB

1. Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017`

## 2. Configure Environment Variables

1. Create a `.env.local` file in the root directory
2. Add the following variables:

```env
MONGODB_URI=your_mongodb_connection_string_here
MONGODB_DB_NAME=inventory
```

**Example for MongoDB Atlas:**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=inventory
```

**Example for Local MongoDB:**

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=inventory
```

## 3. Database Collections

The system will automatically create the following collections when you start using the application:

- `products` - Product catalog
- `receipts` - Purchase receipts
- `deliveries` - Customer deliveries
- `transfers` - Internal stock transfers
- `auditLogs` - Audit trail
- `warehouses` - Warehouse locations
- `units` - Units of measure
- `stockMovements` - Stock movement history
- `adjustments` - Stock adjustments

## 4. Run the Application

```bash
npm run dev
```

The application will connect to MongoDB automatically. If the connection fails, check:

- Your MongoDB connection string is correct
- MongoDB service is running (for local setup)
- Your IP is whitelisted (for MongoDB Atlas)
- Network connectivity

## 5. Initial Data

The system starts with an empty database. You can:

- Add products through the Products page
- Add warehouses and units through the Settings page
- Create receipts, deliveries, and transfers through their respective pages

All data will be persisted in MongoDB and will survive server restarts.

## Troubleshooting

### Connection Error

- Verify your `MONGODB_URI` in `.env.local`
- Check MongoDB service status
- Verify network connectivity

### Database Not Found

- Collections are created automatically on first use
- Ensure the database name in `MONGODB_DB_NAME` matches your MongoDB database

### Authentication Failed

- Verify username and password in connection string
- Check database user permissions in MongoDB Atlas
