import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const transfers = await db.transfers.getAll(organizationId)
    return Response.json(Array.isArray(transfers) ? transfers : [])
  } catch (error) {
    console.error("Transfers fetch error:", error)
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
    const transfer = await db.transfers.create({
      ...body,
      organizationId,
    })
    
    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "CREATE",
        userId,
        documentType: "Transfer",
        documentId: transfer.id,
        changes: { from: transfer.from, to: transfer.to, qty: transfer.qty },
        timestamp: new Date().toISOString(),
      })
    }
    
    // Create stock movement when transfer is completed
    if (transfer.status === "Completed") {
      const product = await db.products.getById(transfer.productId, organizationId)
      if (product) {
        await db.stockMovements.create({
          organizationId,
          productId: transfer.productId,
          productName: product.name,
          operation: "Transfer",
          beginning: product.stock,
          qty: transfer.qty,
          ending: product.stock, // Stock doesn't change, just location
          location: `${transfer.from} → ${transfer.to}`,
          date: transfer.date,
          user: userId || "system",
          documentId: transfer.id,
          documentType: "Transfer",
        })
      }
    }
    
    return Response.json(transfer, { status: 201 })
  } catch (error) {
    console.error("Transfer create error:", error)
    return Response.json({ error: "Failed to create transfer" }, { status: 500 })
  }
}
