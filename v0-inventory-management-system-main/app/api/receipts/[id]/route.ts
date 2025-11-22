import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const organizationId = getOrganizationIdFromRequest(request)
    
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const receipt = await db.receipts.getById(id, organizationId)
    if (!receipt) return Response.json({ error: "Receipt not found" }, { status: 404 })
    return Response.json(receipt)
  } catch (error) {
    console.error("Receipt fetch error:", error)
    return Response.json({ error: "Failed to fetch receipt" }, { status: 500 })
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
    const oldReceipt = await db.receipts.getById(id, organizationId)
    const receipt = await db.receipts.update(id, organizationId, body)
    
    if (!receipt) return Response.json({ error: "Receipt not found" }, { status: 404 })
    
    // Create audit log
    if (userId && oldReceipt) {
      await db.auditLogs.create({
        organizationId,
        action: body.status ? "VALIDATE" : "UPDATE",
        userId,
        documentType: "Receipt",
        documentId: receipt.id,
        changes: oldReceipt.status !== receipt.status ? { status: `${oldReceipt.status} → ${receipt.status}` } : body,
        timestamp: new Date().toISOString(),
      })
    }
    
    // If status changed to Completed/Validated, update stock
    // Only create stock movements if status changed from Draft to Validated/Completed
    if (oldReceipt && oldReceipt.status === "Draft" && 
        (receipt.status === "Completed" || receipt.status === "Validated")) {
      // Get default warehouse or first warehouse
      const warehouses = await db.warehouses.getAll(organizationId)
      const defaultLocation = warehouses.length > 0 ? warehouses[0].name : "Main Warehouse"
      
      for (const item of receipt.items) {
        const product = await db.products.getById(item.productId, organizationId)
        if (product) {
          const newStock = product.stock + item.quantity
          const movementDate = receipt.date || new Date().toISOString()
          await db.stockMovements.create({
            organizationId,
            productId: item.productId,
            productName: product.name,
            operation: "Receipt",
            beginning: product.stock,
            qty: item.quantity,
            ending: newStock,
            location: defaultLocation,
            date: movementDate,
            user: userId || "system",
            documentId: receipt.id,
            documentType: "Receipt",
          })
          await db.products.update(item.productId, organizationId, { stock: newStock })
        }
      }
    }
    
    return Response.json(receipt)
  } catch (error) {
    console.error("Receipt update error:", error)
    return Response.json({ error: "Failed to update receipt" }, { status: 500 })
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

    await db.receipts.delete(id, organizationId)

    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "DELETE",
        userId,
        documentType: "Receipt",
        documentId: id,
        changes: {},
        timestamp: new Date().toISOString(),
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Receipt delete error:", error)
    return Response.json({ error: "Failed to delete receipt" }, { status: 500 })
  }
}
