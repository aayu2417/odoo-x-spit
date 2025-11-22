import { db } from "@/lib/db"
import { getOrganizationIdFromRequest } from "@/lib/api-helpers"

export async function GET(request: Request) {
  try {
    const organizationId = getOrganizationIdFromRequest(request)
    if (!organizationId) {
      return Response.json({ error: "Organization ID required" }, { status: 401 })
    }

    const [products, receipts, deliveries, transfers] = await Promise.all([
      db.products.getAll(organizationId),
      db.receipts.getAll(organizationId),
      db.deliveries.getAll(organizationId),
      db.transfers.getAll(organizationId),
    ])

    // Calculate low stock items (assuming threshold of 20)
    const lowStockItems = products.filter((p) => p.stock < 20).length

    // Count pending receipts (only Draft, not Validated or Completed)
    const pendingReceipts = receipts.filter((r) => r.status === "Draft").length

    // Count pending deliveries
    const pendingDeliveries = deliveries.filter((d) => d.status === "Draft" || d.status === "Ready").length

    // Count internal transfers
    const internalTransfers = transfers.filter((t) => t.status === "Draft" || t.status === "Ready").length

    const stats = {
      totalProducts: products.length,
      lowStockItems,
      pendingReceipts,
      pendingDeliveries,
      internalTransfers,
    }

    return Response.json(stats)
  } catch (error) {
    console.error("Dashboard error:", error)
    return Response.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
