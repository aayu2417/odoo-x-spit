import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const units = await db.units.getAll(organizationId)
    return Response.json(Array.isArray(units) ? units : [])
  } catch (error) {
    console.error("Units fetch error:", error)
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
    const unit = await db.units.create({
      ...body,
      organizationId,
    })

    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "CREATE",
        userId,
        documentType: "Unit",
        documentId: unit.id,
        changes: { name: unit.name, code: unit.code },
        timestamp: new Date().toISOString(),
      })
    }

    return Response.json(unit, { status: 201 })
  } catch (error) {
    console.error("Unit create error:", error)
    return Response.json({ error: "Failed to create unit" }, { status: 500 })
  }
}

