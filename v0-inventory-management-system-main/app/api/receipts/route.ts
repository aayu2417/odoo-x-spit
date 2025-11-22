import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const receipts = await db.receipts.getAll(organizationId)
    return Response.json(Array.isArray(receipts) ? receipts : [])
  } catch (error) {
    console.error("Receipts fetch error:", error)
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
    const receipt = await db.receipts.create({
      ...body,
      organizationId,
    })
    
    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "CREATE",
        userId,
        documentType: "Receipt",
        documentId: receipt.id,
        changes: { supplier: receipt.supplier, total: receipt.total },
        timestamp: new Date().toISOString(),
      })
    }
    
    // Create stock movements for receipt items when validated/completed
    if (receipt.status === "Completed" || receipt.status === "Validated") {
      for (const item of receipt.items) {
        const product = await db.products.getById(item.productId, organizationId)
        if (product) {
          const newStock = product.stock + item.quantity
          await db.stockMovements.create({
            organizationId,
            productId: item.productId,
            productName: product.name,
            operation: "Receipt",
            beginning: product.stock,
            qty: item.quantity,
            ending: newStock,
            location: "Warehouse A", // Default location, can be enhanced
            date: receipt.date,
            user: userId || "system",
            documentId: receipt.id,
            documentType: "Receipt",
          })
          await db.products.update(item.productId, organizationId, { stock: newStock })
        }
      }
    }
    
    return Response.json(receipt, { status: 201 })
  } catch (error) {
    console.error("Receipt create error:", error)
    return Response.json({ error: "Failed to create receipt" }, { status: 500 })
  }
}
