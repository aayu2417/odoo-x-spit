"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface StockMovement {
  id: string
  product: string
  operation: string
  beginning: number
  qty: number
  ending: number
  location: string
  date: string
  user: string
}

export default function LedgerModule() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([])
  const [filters, setFilters] = useState({
    product: "",
    location: "",
    operation: "",
    date: "",
  })

  useEffect(() => {
    fetchMovements()
    fetchWarehouses()
  }, [filters])

  const fetchWarehouses = async () => {
    try {
      const { apiFetch } = await import("@/lib/api-helpers")
      const response = await apiFetch("/api/warehouses")
      if (response.ok) {
        const data = await response.json()
        setWarehouses(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error)
    }
  }

  const fetchMovements = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.location && filters.location !== "All Locations") {
        params.append("location", filters.location)
      }
      if (filters.operation && filters.operation !== "All Operations") {
        params.append("operation", filters.operation)
      }
      if (filters.date) {
        params.append("startDate", filters.date)
      }

      const { apiFetch } = await import("@/lib/api-helpers")
      const response = await apiFetch(`/api/stock-movements?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        // Filter by product name if provided
        let filtered = Array.isArray(data) ? data : []
        if (filters.product) {
          filtered = filtered.filter((m: any) =>
            m.productName?.toLowerCase().includes(filters.product.toLowerCase())
          )
        }
        // Transform to match component format
        setMovements(
          filtered.map((m: any) => ({
            id: m.id,
            product: m.productName || m.product,
            operation: m.operation,
            beginning: m.beginning,
            qty: m.qty,
            ending: m.ending,
            location: m.location,
            date: m.date,
            user: m.user || "System",
          }))
        )
      }
    } catch (error) {
      console.error("Failed to fetch movements:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Move History (Stock Ledger)</h1>

      <Card>
        <div className="p-6">
          <div className="mb-6 p-4 bg-muted rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="product" className="text-sm">
                Product
              </Label>
              <Input
                id="product"
                placeholder="Filter by product..."
                value={filters.product}
                onChange={(e) => setFilters({ ...filters, product: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="location" className="text-sm">
                Location
              </Label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option>All Locations</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.name}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="operation" className="text-sm">
                Operation
              </Label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                value={filters.operation}
                onChange={(e) => setFilters({ ...filters, operation: e.target.value })}
              >
                <option>All Operations</option>
                <option>Receipt</option>
                <option>Delivery</option>
                <option>Transfer</option>
                <option>Adjustment</option>
              </select>
            </div>
            <div>
              <Label htmlFor="date" className="text-sm">
                Date Range
              </Label>
              <Input
                id="date"
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading movements...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Beginning Stock</TableHead>
                  <TableHead>Qty Change</TableHead>
                  <TableHead>Ending Stock</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No movements found
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium">{movement.product}</TableCell>
                      <TableCell>{movement.operation}</TableCell>
                      <TableCell>{movement.beginning}</TableCell>
                      <TableCell
                        className={movement.qty < 0 ? "text-destructive font-semibold" : "text-secondary font-semibold"}
                      >
                        {movement.qty > 0 ? "+" : ""}
                        {movement.qty}
                      </TableCell>
                      <TableCell className="font-semibold">{movement.ending}</TableCell>
                      <TableCell>{movement.location}</TableCell>
                      <TableCell>{movement.date}</TableCell>
                      <TableCell>{movement.user}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  )
}
