import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const adjustments = await db.adjustments.getAll(organizationId)
    return Response.json(Array.isArray(adjustments) ? adjustments : [])
  } catch (error) {
    console.error("Adjustments fetch error:", error)
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
    const adjustment = await db.adjustments.create({
      ...body,
      organizationId,
    })
    
    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "CREATE",
        userId,
        documentType: "Adjustment",
        documentId: adjustment.id,
        changes: { productName: adjustment.productName, variance: adjustment.variance },
        timestamp: new Date().toISOString(),
      })
    }
    
    // Create stock movement for the adjustment
    if (adjustment.status === "Completed") {
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
    
    return Response.json(adjustment, { status: 201 })
  } catch (error) {
    console.error("Adjustment create error:", error)
    return Response.json({ error: "Failed to create adjustment" }, { status: 500 })
  }
}

