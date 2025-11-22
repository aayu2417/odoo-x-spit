"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, AlertTriangle, TrendingUp, TrendingDown, ArrowRightLeft, RotateCcw, Loader2 } from "lucide-react"
import { KPICard } from "@/components/kpi-card"
import { StockTable } from "@/components/stock-table"

interface Stats {
  totalProducts: number
  lowStockItems: number
  pendingReceipts: number
  pendingDeliveries: number
  internalTransfers: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    lowStockItems: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    internalTransfers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [productsRes, receiptsRes, deliveriesRes, transfersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/receipts"),
        fetch("/api/deliveries"),
        fetch("/api/transfers"),
      ])

      const products = await productsRes.json()
      const receipts = await receiptsRes.json()
      const deliveries = await deliveriesRes.json()
      const transfers = await transfersRes.json()

      setStats({
        totalProducts: products.length,
        lowStockItems: products.filter((p: any) => p.stock < 20).length,
        pendingReceipts: receipts.filter((r: any) => r.status === "Draft").length,
        pendingDeliveries: deliveries.filter((d: any) => d.status === "Ready").length,
        internalTransfers: transfers.filter((t: any) => t.status !== "Completed").length,
      })
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Products" value={stats.totalProducts} icon={Package} color="primary" />
        <KPICard title="Low Stock" value={stats.lowStockItems} icon={AlertTriangle} color="destructive" />
        <KPICard title="Pending Receipts" value={stats.pendingReceipts} icon={TrendingUp} color="secondary" />
        <KPICard title="Pending Deliveries" value={stats.pendingDeliveries} icon={TrendingDown} color="accent" />
        <KPICard title="Internal Transfers" value={stats.internalTransfers} icon={ArrowRightLeft} color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Stock Movements</h2>
            <StockTable />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                <TrendingUp className="w-4 h-4" />
                New Receipt
              </Button>
              <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                <TrendingDown className="w-4 h-4" />
                New Delivery
              </Button>
              <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                <ArrowRightLeft className="w-4 h-4" />
                New Transfer
              </Button>
              <Button className="w-full justify-start gap-2 bg-transparent" variant="outline">
                <RotateCcw className="w-4 h-4" />
                New Adjustment
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
