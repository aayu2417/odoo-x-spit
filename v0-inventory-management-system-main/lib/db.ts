// In-memory database for demo (replace with Supabase, Prisma, etc. in production)
interface Product {
  id: string
  name: string
  sku: string
  category: string
  uom: string
  stock: number
  createdAt: string
}

interface Receipt {
  id: string
  supplier: string
  date: string
  items: { productId: string; quantity: number; unitPrice: number }[]
  status: "Draft" | "Validated" | "Completed"
  total: number
  createdAt: string
}

interface Delivery {
  id: string
  customer: string
  date: string
  items: { productId: string; quantity: number }[]
  status: "Draft" | "Ready" | "Completed"
  total: number
  createdAt: string
}

interface Transfer {
  id: string
  productId: string
  from: string
  to: string
  qty: number
  status: "Draft" | "Ready" | "Completed"
  date: string
  createdAt: string
}

// Initialize with demo data
let products: Product[] = [
  {
    id: "1",
    name: "Steel Rods",
    sku: "SR-001",
    category: "Raw Materials",
    uom: "kg",
    stock: 100,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Chairs",
    sku: "CH-001",
    category: "Furniture",
    uom: "pcs",
    stock: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Desks",
    sku: "DK-001",
    category: "Furniture",
    uom: "pcs",
    stock: 12,
    createdAt: new Date().toISOString(),
  },
]

let receipts: Receipt[] = [
  {
    id: "1",
    supplier: "ABC Supplies",
    date: "2025-11-22",
    items: [{ productId: "1", quantity: 50, unitPrice: 100 }],
    status: "Draft",
    total: 5000,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    supplier: "XYZ Corp",
    date: "2025-11-21",
    items: [{ productId: "2", quantity: 20, unitPrice: 150 }],
    status: "Validated",
    total: 3000,
    createdAt: new Date().toISOString(),
  },
]

let deliveries: Delivery[] = [
  {
    id: "1",
    customer: "Customer A",
    date: "2025-11-22",
    items: [{ productId: "1", quantity: 10 }],
    status: "Ready",
    total: 2500,
    createdAt: new Date().toISOString(),
  },
]

let transfers: Transfer[] = [
  {
    id: "1",
    productId: "1",
    from: "Warehouse A",
    to: "Production Floor",
    qty: 25,
    status: "Completed",
    date: "2025-11-22",
    createdAt: new Date().toISOString(),
  },
]

// Database functions
export const db = {
  products: {
    getAll: () => products,
    getById: (id: string) => products.find((p) => p.id === id),
    create: (data: Omit<Product, "id" | "createdAt">) => {
      const newProduct: Product = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      products.push(newProduct)
      return newProduct
    },
    update: (id: string, data: Partial<Product>) => {
      const index = products.findIndex((p) => p.id === id)
      if (index >= 0) {
        products[index] = { ...products[index], ...data }
        return products[index]
      }
      return null
    },
    delete: (id: string) => {
      products = products.filter((p) => p.id !== id)
      return true
    },
  },
  receipts: {
    getAll: () => receipts,
    getById: (id: string) => receipts.find((r) => r.id === id),
    create: (data: Omit<Receipt, "id" | "createdAt">) => {
      const newReceipt: Receipt = {
        ...data,
        id: `RCP-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      receipts.push(newReceipt)
      return newReceipt
    },
    update: (id: string, data: Partial<Receipt>) => {
      const index = receipts.findIndex((r) => r.id === id)
      if (index >= 0) {
        receipts[index] = { ...receipts[index], ...data }
        return receipts[index]
      }
      return null
    },
    delete: (id: string) => {
      receipts = receipts.filter((r) => r.id !== id)
      return true
    },
  },
  deliveries: {
    getAll: () => deliveries,
    getById: (id: string) => deliveries.find((d) => d.id === id),
    create: (data: Omit<Delivery, "id" | "createdAt">) => {
      const newDelivery: Delivery = {
        ...data,
        id: `DEL-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      deliveries.push(newDelivery)
      return newDelivery
    },
    update: (id: string, data: Partial<Delivery>) => {
      const index = deliveries.findIndex((d) => d.id === id)
      if (index >= 0) {
        deliveries[index] = { ...deliveries[index], ...data }
        return deliveries[index]
      }
      return null
    },
    delete: (id: string) => {
      deliveries = deliveries.filter((d) => d.id !== id)
      return true
    },
  },
  transfers: {
    getAll: () => transfers,
    getById: (id: string) => transfers.find((t) => t.id === id),
    create: (data: Omit<Transfer, "id" | "createdAt">) => {
      const newTransfer: Transfer = {
        ...data,
        id: `TRN-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      transfers.push(newTransfer)
      return newTransfer
    },
    update: (id: string, data: Partial<Transfer>) => {
      const index = transfers.findIndex((t) => t.id === id)
      if (index >= 0) {
        transfers[index] = { ...transfers[index], ...data }
        return transfers[index]
      }
      return null
    },
    delete: (id: string) => {
      transfers = transfers.filter((t) => t.id !== id)
      return true
    },
  },
}
