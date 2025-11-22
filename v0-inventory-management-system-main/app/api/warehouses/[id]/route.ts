import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const organizationId = getOrganizationIdFromRequest(request)
    
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const warehouse = await db.warehouses.getById(id, organizationId)
    if (!warehouse) {
      return Response.json({ error: "Warehouse not found" }, { status: 404 })
    }
    return Response.json(warehouse)
  } catch (error) {
    console.error("Warehouse fetch error:", error)
    return Response.json({ error: "Failed to fetch warehouse" }, { status: 500 })
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
    const warehouse = await db.warehouses.update(id, organizationId, body)
    
    if (!warehouse) {
      return Response.json({ error: "Warehouse not found" }, { status: 404 })
    }

    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "UPDATE",
        userId,
        documentType: "Warehouse",
        documentId: warehouse.id,
        changes: body,
        timestamp: new Date().toISOString(),
      })
    }

    return Response.json(warehouse)
  } catch (error) {
    console.error("Warehouse update error:", error)
    return Response.json({ error: "Failed to update warehouse" }, { status: 500 })
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

    await db.warehouses.delete(id, organizationId)

    // Create audit log
    if (userId) {
      await db.auditLogs.create({
        organizationId,
        action: "DELETE",
        userId,
        documentType: "Warehouse",
        documentId: id,
        changes: {},
        timestamp: new Date().toISOString(),
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Warehouse delete error:", error)
    return Response.json({ error: "Failed to delete warehouse" }, { status: 500 })
  }
}
