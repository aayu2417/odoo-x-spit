"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiFetch } from "@/lib/api-helpers"
import { triggerDashboardRefresh } from "@/lib/events"

interface Adjustment {
  id: string
  productId: string
  productName: string
  location: string
  counted: number
  recorded: number
  variance: number
  reason: string
  status: "Draft" | "Completed"
  date: string
  userId?: string
}

interface Product {
  id: string
  name: string
  stock: number
}

interface Warehouse {
  id: string
  name: string
}

export default function AdjustmentsModule() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    productId: "",
    location: "",
    counted: 0,
    recorded: 0,
    reason: "",
    status: "Draft" as "Draft" | "Completed",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchAdjustments()
    fetchProducts()
    fetchWarehouses()
  }, [])

  const fetchAdjustments = async () => {
    try {
      setLoading(true)
      const response = await apiFetch("/api/adjustments")
      if (response.ok) {
        const data = await response.json()
        setAdjustments(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch adjustments:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await apiFetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const response = await apiFetch("/api/warehouses")
      if (response.ok) {
        const data = await response.json()
        setWarehouses(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error)
    }
  }

  const handleOpenDialog = (adjustment?: Adjustment) => {
    if (adjustment) {
      setEditingId(adjustment.id)
      setFormData({
        productId: adjustment.productId,
        location: adjustment.location,
        counted: adjustment.counted,
        recorded: adjustment.recorded,
        reason: adjustment.reason,
        status: adjustment.status,
        date: adjustment.date.split("T")[0],
      })
    } else {
      setEditingId(null)
      setFormData({
        productId: "",
        location: "",
        counted: 0,
        recorded: 0,
        reason: "",
        status: "Draft",
        date: new Date().toISOString().split("T")[0],
      })
    }
    setIsDialogOpen(true)
  }

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (product) {
      setFormData({
        ...formData,
        productId,
        recorded: product.stock,
      })
    }
  }

  const handleCountedChange = (counted: number) => {
    const recorded = formData.recorded
    const variance = counted - recorded
    setFormData({
      ...formData,
      counted,
      variance,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const product = products.find((p) => p.id === formData.productId)
      if (!product) {
        alert("Please select a product")
        return
      }

      const adjustmentData = {
        productId: formData.productId,
        productName: product.name,
        location: formData.location,
        counted: formData.counted,
        recorded: formData.recorded,
        variance: formData.counted - formData.recorded,
        reason: formData.reason,
        status: formData.status,
        date: formData.date,
      }

      if (editingId) {
        await apiFetch(`/api/adjustments/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(adjustmentData),
        })
      } else {
        await apiFetch("/api/adjustments", {
          method: "POST",
          body: JSON.stringify(adjustmentData),
        })
      }
      setIsDialogOpen(false)
      fetchAdjustments()
      if (formData.status === "Completed") {
        triggerDashboardRefresh()
      }
    } catch (error) {
      console.error("Failed to save adjustment:", error)
      alert("Failed to save adjustment")
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this adjustment?")) {
      try {
        await apiFetch(`/api/adjustments/${id}`, { method: "DELETE" })
        fetchAdjustments()
      } catch (error) {
        console.error("Failed to delete adjustment:", error)
      }
    }
  }

  const handleStatusChange = async (id: string, newStatus: "Draft" | "Completed") => {
    try {
      const adjustment = adjustments.find((a) => a.id === id)
      if (!adjustment) return

      await apiFetch(`/api/adjustments/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...adjustment, status: newStatus }),
      })
      fetchAdjustments()
      if (newStatus === "Completed") {
        triggerDashboardRefresh()
      }
    } catch (error) {
      console.error("Failed to update adjustment status:", error)
    }
  }

  const statusColors = {
    Draft: "bg-muted text-muted-foreground",
    Completed: "bg-primary/20 text-primary",
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Adjustments</h1>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No adjustments found
                  </TableCell>
                </TableRow>
              ) : (
                adjustments.map((adj) => (
                  <TableRow key={adj.id}>
                    <TableCell className="font-medium">{adj.productName}</TableCell>
                    <TableCell>{adj.location}</TableCell>
                    <TableCell>{adj.recorded}</TableCell>
                    <TableCell>{adj.counted}</TableCell>
                    <TableCell className={adj.variance < 0 ? "text-destructive font-semibold" : "text-secondary font-semibold"}>
                      {adj.variance > 0 ? "+" : ""}
                      {adj.variance}
                    </TableCell>
                    <TableCell>{adj.reason}</TableCell>
                    <TableCell>
                      <select
                        value={adj.status}
                        onChange={(e) => handleStatusChange(adj.id, e.target.value as "Draft" | "Completed")}
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[adj.status]}`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </TableCell>
                    <TableCell>{adj.date.split("T")[0]}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(adj)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(adj.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Adjustment" : "New Adjustment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="product">Product *</Label>
              <select
                id="product"
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <select
                id="location"
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              >
                <option value="">Select a location</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.name}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recorded">Recorded Stock</Label>
                <Input
                  id="recorded"
                  type="number"
                  value={formData.recorded}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="counted">Counted Stock *</Label>
                <Input
                  id="counted"
                  type="number"
                  value={formData.counted}
                  onChange={(e) => handleCountedChange(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="variance">Variance</Label>
              <Input
                id="variance"
                type="number"
                value={formData.counted - formData.recorded}
                readOnly
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Physical count discrepancy"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "Draft" | "Completed" })}
                >
                  <option value="Draft">Draft</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
