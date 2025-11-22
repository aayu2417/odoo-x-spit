export async function POST(request: Request) {
  try {
    const { action, userId, documentType, documentId, changes, timestamp } = await request.json()

    // In production, save to database
    const auditLog = {
      id: `audit-${Date.now()}`,
      action,
      userId,
      documentType,
      documentId,
      changes,
      timestamp: timestamp || new Date().toISOString(),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    }

    console.log("[AUDIT LOG]", auditLog)

    return Response.json({
      success: true,
      logId: auditLog.id,
    })
  } catch (error) {
    return Response.json({ error: "Failed to log audit" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const documentType = searchParams.get("documentType")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Demo data - in production, fetch from database with filters
    const auditLogs = [
      {
        id: "audit-1",
        action: "CREATE",
        userId: "user-1",
        documentType: "Receipt",
        documentId: "RCP-1",
        changes: { supplier: "ABC Supplies", total: 50000 },
        timestamp: "2025-11-22T10:30:00Z",
      },
      {
        id: "audit-2",
        action: "UPDATE",
        userId: "user-1",
        documentType: "Receipt",
        documentId: "RCP-1",
        changes: { status: "Draft → Validated" },
        timestamp: "2025-11-22T11:00:00Z",
      },
      {
        id: "audit-3",
        action: "VALIDATE",
        userId: "user-1",
        documentType: "Delivery",
        documentId: "DEL-2",
        changes: { status: "Ready → Completed" },
        timestamp: "2025-11-21T14:30:00Z",
      },
    ]

    return Response.json(auditLogs)
  } catch (error) {
    return Response.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
