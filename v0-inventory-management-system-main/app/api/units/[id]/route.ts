import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const organizationId = getOrganizationIdFromRequest(request)
    
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const unit = await db.units.getById(id, organizationId)
    if (!unit) {
      return Response.json({ error: "Unit not found" }, { status: 404 })
    }
    return Response.json(unit)
  } catch (error) {
    console.error("Unit fetch error:", error)
    return Response.json({ error: "Failed to fetch unit" }, { status: 500 })
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
    const unit = await db.units.update(id, organizationId, body)
    
    if (!unit) {
      return Response.json({ error: "Unit not found" }, { status: 404 })
    }

    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "UPDATE",
        userId,
        documentType: "Unit",
        documentId: unit.id,
        changes: body,
        timestamp: new Date().toISOString(),
      })
    }

    return Response.json(unit)
  } catch (error) {
    console.error("Unit update error:", error)
    return Response.json({ error: "Failed to update unit" }, { status: 500 })
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

    await db.units.delete(id, organizationId)

    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "DELETE",
        userId,
        documentType: "Unit",
        documentId: id,
        changes: {},
        timestamp: new Date().toISOString(),
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Unit delete error:", error)
    return Response.json({ error: "Failed to delete unit" }, { status: 500 })
  }
}
