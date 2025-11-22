"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"

export default function AdjustmentsModule() {
  const [adjustments] = useState([
    {
      id: 1,
      product: "Steel Rods",
      location: "Warehouse A",
      counted: 97,
      recorded: 100,
      variance: -3,
      reason: "Damage",
      status: "Completed",
      date: "2025-11-22",
    },
    {
      id: 2,
      product: "Chairs",
      location: "Warehouse A",
      counted: 45,
      recorded: 45,
      variance: 0,
      reason: "Verification",
      status: "Completed",
      date: "2025-11-21",
    },
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Adjustments</h1>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Adjustment
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Recorded</TableHead>
                <TableHead>Counted</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.map((adj) => (
                <TableRow key={adj.id}>
                  <TableCell className="font-medium">{adj.product}</TableCell>
                  <TableCell>{adj.location}</TableCell>
                  <TableCell>{adj.recorded}</TableCell>
                  <TableCell>{adj.counted}</TableCell>
                  <TableCell className={adj.variance < 0 ? "text-destructive font-semibold" : ""}>
                    {adj.variance > 0 ? "+" : ""}
                    {adj.variance}
                  </TableCell>
                  <TableCell>{adj.reason}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary">
                      {adj.status}
                    </span>
                  </TableCell>
                  <TableCell>{adj.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
