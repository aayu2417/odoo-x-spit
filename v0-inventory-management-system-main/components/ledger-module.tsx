"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function LedgerModule() {
  const [movements] = useState([
    {
      id: 1,
      product: "Steel Rods",
      operation: "Receipt",
      beginning: 50,
      qty: 50,
      ending: 100,
      location: "Warehouse A",
      date: "2025-11-22",
      user: "Admin",
    },
    {
      id: 2,
      product: "Chairs",
      operation: "Delivery",
      beginning: 55,
      qty: -10,
      ending: 45,
      location: "Warehouse A",
      date: "2025-11-21",
      user: "Warehouse Staff",
    },
    {
      id: 3,
      product: "Steel Rods",
      operation: "Transfer",
      beginning: 100,
      qty: 25,
      ending: 75,
      location: "Warehouse A",
      date: "2025-11-20",
      user: "Inventory Manager",
    },
    {
      id: 4,
      product: "Steel Rods",
      operation: "Adjustment",
      beginning: 75,
      qty: -3,
      ending: 72,
      location: "Warehouse A",
      date: "2025-11-19",
      user: "Inventory Manager",
    },
  ])

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
              <Input id="product" placeholder="Filter by product..." />
            </div>
            <div>
              <Label htmlFor="location" className="text-sm">
                Location
              </Label>
              <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
                <option>All Locations</option>
                <option>Warehouse A</option>
                <option>Warehouse B</option>
              </select>
            </div>
            <div>
              <Label htmlFor="operation" className="text-sm">
                Operation
              </Label>
              <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
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
              <Input id="date" type="date" />
            </div>
          </div>

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
              {movements.map((movement) => (
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
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
