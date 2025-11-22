"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit2, Trash2 } from "lucide-react"

interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
}

interface Unit {
  id: string
  name: string
  code: string
}

export default function SettingsModule() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"warehouses" | "units">("warehouses")
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false)
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false)
  const [warehouseForm, setWarehouseForm] = useState({ name: "", location: "", capacity: 0 })
  const [unitForm, setUnitForm] = useState({ name: "", code: "" })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const { apiFetch } = await import("@/lib/api-helpers")
      const [warehousesRes, unitsRes] = await Promise.all([
        apiFetch("/api/warehouses"),
        apiFetch("/api/units"),
      ])

      if (warehousesRes.ok) {
        const warehousesData = await warehousesRes.json()
        setWarehouses(Array.isArray(warehousesData) ? warehousesData : [])
      }

      if (unitsRes.ok) {
        const unitsData = await unitsRes.json()
        setUnits(Array.isArray(unitsData) ? unitsData : [])
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { apiFetch } = await import("@/lib/api-helpers")
      const response = await apiFetch("/api/warehouses", {
        method: "POST",
        body: JSON.stringify(warehouseForm),
      })
      if (response.ok) {
        setIsWarehouseDialogOpen(false)
        setWarehouseForm({ name: "", location: "", capacity: 0 })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to create warehouse:", error)
    }
  }

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { apiFetch } = await import("@/lib/api-helpers")
      const response = await apiFetch("/api/units", {
        method: "POST",
        body: JSON.stringify(unitForm),
      })
      if (response.ok) {
        setIsUnitDialogOpen(false)
        setUnitForm({ name: "", code: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Failed to create unit:", error)
    }
  }

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this warehouse?")) return
    try {
      const { apiFetch } = await import("@/lib/api-helpers")
      const response = await apiFetch(`/api/warehouses/${id}`, { method: "DELETE" })
      if (response.ok) {
        setWarehouses(warehouses.filter((w) => w.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete warehouse:", error)
    }
  }

  const handleDeleteUnit = async (id: string) => {
    if (!confirm("Are you sure you want to delete this unit?")) return
    try {
      const { apiFetch } = await import("@/lib/api-helpers")
      const response = await apiFetch(`/api/units/${id}`, { method: "DELETE" })
      if (response.ok) {
        setUnits(units.filter((u) => u.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete unit:", error)
    }
  }

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
              <Button className="gap-2" onClick={() => setIsWarehouseDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Add Warehouse
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading warehouses...</div>
            ) : (
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
                  {warehouses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No warehouses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    warehouses.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">{warehouse.name}</TableCell>
                        <TableCell>{warehouse.location}</TableCell>
                        <TableCell>{warehouse.capacity.toLocaleString()}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteWarehouse(warehouse.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      )}

      {activeTab === "units" && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Units of Measure</h2>
              <Button className="gap-2" onClick={() => setIsUnitDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Add Unit
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading units...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No units found
                      </TableCell>
                    </TableRow>
                  ) : (
                    units.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{unit.name}</TableCell>
                        <TableCell>{unit.code}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteUnit(unit.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      )}

      <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Warehouse</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateWarehouse} className="space-y-4">
            <div>
              <Label htmlFor="warehouse-name">Warehouse Name</Label>
              <Input
                id="warehouse-name"
                value={warehouseForm.name}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                placeholder="Main Warehouse"
                required
              />
            </div>
            <div>
              <Label htmlFor="warehouse-location">Location</Label>
              <Input
                id="warehouse-location"
                value={warehouseForm.location}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })}
                placeholder="New York"
                required
              />
            </div>
            <div>
              <Label htmlFor="warehouse-capacity">Capacity</Label>
              <Input
                id="warehouse-capacity"
                type="number"
                value={warehouseForm.capacity}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, capacity: Number.parseInt(e.target.value) || 0 })}
                placeholder="10000"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Create Warehouse
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUnit} className="space-y-4">
            <div>
              <Label htmlFor="unit-name">Unit Name</Label>
              <Input
                id="unit-name"
                value={unitForm.name}
                onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                placeholder="Kilogram"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit-code">Unit Code</Label>
              <Input
                id="unit-code"
                value={unitForm.code}
                onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })}
                placeholder="kg"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Create Unit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
