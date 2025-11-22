import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const deliveries = await db.deliveries.getAll(organizationId)
    return Response.json(Array.isArray(deliveries) ? deliveries : [])
  } catch (error) {
    console.error("Deliveries fetch error:", error)
    return Response.json([])
  }
}

export async function POST(request: Request) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    const userId = getUserIdFromRequest(request)
    
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const body = await request.json()
    const delivery = await db.deliveries.create({
      ...body,
      organizationId,
    })
    
    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "CREATE",
        userId,
        documentType: "Delivery",
        documentId: delivery.id,
        changes: { customer: delivery.customer, total: delivery.total },
        timestamp: new Date().toISOString(),
      })
    }
    
    // Create stock movements for delivery items when completed
    if (delivery.status === "Completed") {
      for (const item of delivery.items) {
        const product = await db.products.getById(item.productId, organizationId)
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity)
          await db.stockMovements.create({
            organizationId,
            productId: item.productId,
            productName: product.name,
            operation: "Delivery",
            beginning: product.stock,
            qty: -item.quantity,
            ending: newStock,
            location: "Warehouse A",
            date: delivery.date,
            user: userId || "system",
            documentId: delivery.id,
            documentType: "Delivery",
          })
          await db.products.update(item.productId, organizationId, { stock: newStock })
        }
      }
    }
    
    return Response.json(delivery, { status: 201 })
  } catch (error) {
    console.error("Delivery create error:", error)
    return Response.json({ error: "Failed to create delivery" }, { status: 500 })
  }
}
