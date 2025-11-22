// Type definitions for MongoDB documents

export interface Organization {
  _id?: string
  id: string
  name: string
  createdAt: string
}

export interface User {
  _id?: string
  id: string
  email: string
  password: string // Hashed password
  name: string
  organizationId: string
  role?: string
  createdAt: string
}

export interface Product {
  _id?: string
  id: string
  organizationId: string
  name: string
  sku: string
  category: string
  uom: string
  stock: number
  createdAt: string
}

export interface Receipt {
  _id?: string
  id: string
  organizationId: string
  supplier: string
  date: string
  items: { productId: string; quantity: number; unitPrice: number }[]
  status: "Draft" | "Validated" | "Completed"
  total: number
  createdAt: string
}

export interface Delivery {
  _id?: string
  id: string
  organizationId: string
  customer: string
  date: string
  items: { productId: string; quantity: number }[]
  status: "Draft" | "Ready" | "Completed"
  total: number
  createdAt: string
}

export interface Transfer {
  _id?: string
  id: string
  organizationId: string
  productId: string
  from: string
  to: string
  qty: number
  status: "Draft" | "Ready" | "Completed"
  date: string
  createdAt: string
}

export interface AuditLog {
  _id?: string
  id: string
  organizationId: string
  action: string
  userId: string
  documentType: string
  documentId: string
  changes: Record<string, any>
  timestamp: string
  ipAddress?: string
}

export interface Warehouse {
  _id?: string
  id: string
  organizationId: string
  name: string
  location: string
  capacity: number
  createdAt: string
}

export interface Unit {
  _id?: string
  id: string
  organizationId: string
  name: string
  code: string
  createdAt: string
}

export interface StockMovement {
  _id?: string
  id: string
  organizationId: string
  productId: string
  productName: string
  operation: "Receipt" | "Delivery" | "Transfer" | "Adjustment"
  beginning: number
  qty: number
  ending: number
  location: string
  date: string
  user: string
  documentId?: string
  documentType?: string
  createdAt: string
}

export interface Adjustment {
  _id?: string
  id: string
  organizationId: string
  productId: string
  productName: string
  location: string
  counted: number
  recorded: number
  variance: number
  reason: string
  status: "Draft" | "Completed"
  date: string
  userId: string
  createdAt: string
}

