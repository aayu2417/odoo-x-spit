import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const organizationId = getOrganizationIdFromRequest(request)
    
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const delivery = await db.deliveries.getById(id, organizationId)
    if (!delivery) return Response.json({ error: "Delivery not found" }, { status: 404 })
    return Response.json(delivery)
  } catch (error) {
    console.error("Delivery fetch error:", error)
    return Response.json({ error: "Failed to fetch delivery" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const organizationId = getOrganizationIdFromRequest(request)
    const userId = getUserIdFromRequest(request)
    
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const body = await request.json()
    const oldDelivery = await db.deliveries.getById(id, organizationId)
    const delivery = await db.deliveries.update(id, organizationId, body)
    
    if (!delivery) return Response.json({ error: "Delivery not found" }, { status: 404 })
    
    // Create audit log
    if (userId && oldDelivery) {
      await db.auditLogs.create({
        organizationId,
        action: body.status ? "UPDATE" : "UPDATE",
        userId,
        documentType: "Delivery",
        documentId: delivery.id,
        changes: oldDelivery.status !== delivery.status ? { status: `${oldDelivery.status} → ${delivery.status}` } : body,
        timestamp: new Date().toISOString(),
      })
    }
    
    // If status changed to Completed, update stock
    if (oldDelivery && oldDelivery.status !== "Completed" && delivery.status === "Completed") {
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
    
    return Response.json(delivery)
  } catch (error) {
    console.error("Delivery update error:", error)
    return Response.json({ error: "Failed to update delivery" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const organizationId = getOrganizationIdFromRequest(request)
    const userId = getUserIdFromRequest(request)
    
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    await db.deliveries.delete(id, organizationId)

    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "DELETE",
        userId,
        documentType: "Delivery",
        documentId: id,
        changes: {},
        timestamp: new Date().toISOString(),
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Delivery delete error:", error)
    return Response.json({ error: "Failed to delete delivery" }, { status: 500 })
  }
}
