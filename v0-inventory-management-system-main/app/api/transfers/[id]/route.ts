import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const organizationId = getOrganizationIdFromRequest(request)
    
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const transfer = await db.transfers.getById(id, organizationId)
    if (!transfer) return Response.json({ error: "Transfer not found" }, { status: 404 })
    return Response.json(transfer)
  } catch (error) {
    console.error("Transfer fetch error:", error)
    return Response.json({ error: "Failed to fetch transfer" }, { status: 500 })
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
    const oldTransfer = await db.transfers.getById(id, organizationId)
    const transfer = await db.transfers.update(id, organizationId, body)
    
    if (!transfer) return Response.json({ error: "Transfer not found" }, { status: 404 })
    
    // Create audit log
    if (userId && oldTransfer) {
      await db.auditLogs.create({
        organizationId,
        action: body.status ? "UPDATE" : "UPDATE",
        userId,
        documentType: "Transfer",
        documentId: transfer.id,
        changes: oldTransfer.status !== transfer.status ? { status: `${oldTransfer.status} → ${transfer.status}` } : body,
        timestamp: new Date().toISOString(),
      })
    }
    
    // If status changed to Completed, create stock movement
    if (oldTransfer && oldTransfer.status !== "Completed" && transfer.status === "Completed") {
      const product = await db.products.getById(transfer.productId, organizationId)
      if (product) {
        await db.stockMovements.create({
          organizationId,
          productId: transfer.productId,
          productName: product.name,
          operation: "Transfer",
          beginning: product.stock,
          qty: transfer.qty,
          ending: product.stock,
          location: `${transfer.from} → ${transfer.to}`,
          date: transfer.date,
          user: userId || "system",
          documentId: transfer.id,
          documentType: "Transfer",
        })
      }
    }
    
    return Response.json(transfer)
  } catch (error) {
    console.error("Transfer update error:", error)
    return Response.json({ error: "Failed to update transfer" }, { status: 500 })
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

    await db.transfers.delete(id, organizationId)

    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "DELETE",
        userId,
        documentType: "Transfer",
        documentId: id,
        changes: {},
        timestamp: new Date().toISOString(),
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Transfer delete error:", error)
    return Response.json({ error: "Failed to delete transfer" }, { status: 500 })
  }
}
