"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch } from "@/lib/api-helpers"
import { listenForDashboardRefresh } from "@/lib/events"
import { Loader2 } from "lucide-react"

interface StockMovement {
  id: string
  productName: string
  operation: string
  qty: number
  location: string
  date: string
}

export function StockTable() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovements()
    // Refresh movements every 30 seconds
    const interval = setInterval(() => {
      fetchMovements()
    }, 30000)
    
    // Listen for dashboard refresh events
    const unsubscribe = listenForDashboardRefresh(() => {
      fetchMovements()
    })
    
    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const fetchMovements = async () => {
    try {
      setLoading(true)
      const response = await apiFetch("/api/stock-movements")
      if (response.ok) {
        const data = await response.json()
        setMovements(Array.isArray(data) ? data.slice(0, 5) : []) // Get latest 5
      }
    } catch (error) {
      console.error("Failed to fetch movements:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (movements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent stock movements
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement) => (
          <TableRow key={movement.id}>
            <TableCell className="font-medium">{movement.productName}</TableCell>
            <TableCell>{movement.operation}</TableCell>
            <TableCell className={movement.qty < 0 ? "text-destructive" : "text-secondary"}>
              {movement.qty > 0 ? "+" : ""}
              {movement.qty}
            </TableCell>
            <TableCell>{movement.location}</TableCell>
            <TableCell>{movement.date ? new Date(movement.date).toLocaleDateString() : movement.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
