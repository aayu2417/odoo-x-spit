import { db } from "@/lib/db"
import { getOrganizationIdFromRequest, getUserIdFromRequest } from "@/lib/api-helpers"

export async function POST(request: Request) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    const userId = getUserIdFromRequest(request)
    
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const { action, documentType, documentId, changes, timestamp } = await request.json()

    const auditLog = await db.auditLogs.create({
      organizationId,
      action,
      userId: userId || "system",
      documentType,
      documentId,
      changes,
      timestamp: timestamp || new Date().toISOString(),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    })

    return Response.json({
      success: true,
      logId: auditLog.id,
    })
  } catch (error) {
    console.error("Audit log error:", error)
    return Response.json({ error: "Failed to log audit" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const documentType = searchParams.get("documentType")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const filters: any = {}
    if (userId) filters.userId = userId
    if (documentType) filters.documentType = documentType
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const auditLogs = await db.auditLogs.getAll(organizationId, filters)

    return Response.json(auditLogs)
  } catch (error) {
    console.error("Audit log fetch error:", error)
    return Response.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
