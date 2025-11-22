import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const organizationId = getOrganizationIdFromRequest(request)
    
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const adjustment = await db.adjustments.getById(id, organizationId)
    if (!adjustment) {
      return Response.json({ error: "Adjustment not found" }, { status: 404 })
    }
    return Response.json(adjustment)
  } catch (error) {
    console.error("Adjustment fetch error:", error)
    return Response.json({ error: "Failed to fetch adjustment" }, { status: 500 })
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
    const oldAdjustment = await db.adjustments.getById(id, organizationId)
    const adjustment = await db.adjustments.update(id, organizationId, body)
    
    if (!adjustment) {
      return Response.json({ error: "Adjustment not found" }, { status: 404 })
    }
    
    // Create audit log
    if (userId && oldAdjustment) {
      await db.auditLogs.create({
        organizationId,
        action: body.status ? "UPDATE" : "UPDATE",
        userId,
        documentType: "Adjustment",
        documentId: adjustment.id,
        changes: oldAdjustment.status !== adjustment.status ? { status: `${oldAdjustment.status} → ${adjustment.status}` } : body,
        timestamp: new Date().toISOString(),
      })
    }
    
    // If status changed to Completed, create stock movement
    if (oldAdjustment && oldAdjustment.status !== "Completed" && adjustment.status === "Completed") {
      await db.stockMovements.create({
        organizationId,
        productId: adjustment.productId,
        productName: adjustment.productName,
        operation: "Adjustment",
        beginning: adjustment.recorded,
        qty: adjustment.variance,
        ending: adjustment.counted,
        location: adjustment.location,
        date: adjustment.date,
        user: userId || adjustment.userId,
        documentId: adjustment.id,
        documentType: "Adjustment",
      })
      
      // Update product stock
      const product = await db.products.getById(adjustment.productId, organizationId)
      if (product) {
        await db.products.update(adjustment.productId, organizationId, {
          stock: adjustment.counted,
        })
      }
    }
    
    return Response.json(adjustment)
  } catch (error) {
    console.error("Adjustment update error:", error)
    return Response.json({ error: "Failed to update adjustment" }, { status: 500 })
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

    await db.adjustments.delete(id, organizationId)

    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "DELETE",
        userId,
        documentType: "Adjustment",
        documentId: id,
        changes: {},
        timestamp: new Date().toISOString(),
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Adjustment delete error:", error)
    return Response.json({ error: "Failed to delete adjustment" }, { status: 500 })
  }
}
