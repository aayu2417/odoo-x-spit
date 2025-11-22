"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2 } from "lucide-react"

export default function SettingsModule() {
  const [warehouses] = useState([
    { id: 1, name: "Main Warehouse", location: "New York", capacity: 10000 },
    { id: 2, name: "Branch Warehouse", location: "Los Angeles", capacity: 5000 },
  ])

  const [units] = useState([
    { id: 1, name: "Kilogram", code: "kg" },
    { id: 2, name: "Piece", code: "pcs" },
    { id: 3, name: "Meter", code: "m" },
  ])

  const [activeTab, setActiveTab] = useState<"warehouses" | "units">("warehouses")

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("warehouses")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "warehouses" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          Warehouse Management
        </button>
        <button
          onClick={() => setActiveTab("units")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "units" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          Units of Measure
        </button>
      </div>

      {activeTab === "warehouses" && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Warehouses</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Warehouse
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Warehouse Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                    <TableCell>{warehouse.location}</TableCell>
                    <TableCell>{warehouse.capacity.toLocaleString()}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === "units" && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Units of Measure</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Unit
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>{unit.code}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
