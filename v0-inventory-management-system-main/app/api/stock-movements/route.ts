import { db } from "@/lib/db"
import { getOrganizationIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const location = searchParams.get("location")
    const operation = searchParams.get("operation")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const filters: any = {}
    if (productId) filters.productId = productId
    if (location) filters.location = location
    if (operation) filters.operation = operation
    if (startDate) filters.startDate = startDate
    if (endDate) filters.endDate = endDate

    const movements = await db.stockMovements.getAll(organizationId, filters)
    return Response.json(Array.isArray(movements) ? movements : [])
  } catch (error) {
    console.error("Stock movements fetch error:", error)
    return Response.json([])
  }
}
