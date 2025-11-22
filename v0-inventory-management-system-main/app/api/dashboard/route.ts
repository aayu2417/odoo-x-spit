export async function GET() {
  try {
    // Demo data - in production, fetch from database
    const stats = {
      totalProducts: 42,
      lowStockItems: 5,
      pendingReceipts: 3,
      pendingDeliveries: 7,
      internalTransfers: 2,
    }

    return Response.json(stats)
  } catch (error) {
    return Response.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
