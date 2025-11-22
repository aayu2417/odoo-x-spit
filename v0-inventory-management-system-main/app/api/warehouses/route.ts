import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const warehouses = await db.warehouses.getAll(organizationId)
    return Response.json(Array.isArray(warehouses) ? warehouses : [])
  } catch (error) {
    console.error("Warehouses fetch error:", error)
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
    const warehouse = await db.warehouses.create({
      ...body,
      organizationId,
    })

    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "CREATE",
        userId,
        documentType: "Warehouse",
        documentId: warehouse.id,
        changes: { name: warehouse.name, location: warehouse.location },
        timestamp: new Date().toISOString(),
      })
    }

    return Response.json(warehouse, { status: 201 })
  } catch (error) {
    console.error("Warehouse create error:", error)
    return Response.json({ error: "Failed to create warehouse" }, { status: 500 })
  }
}
