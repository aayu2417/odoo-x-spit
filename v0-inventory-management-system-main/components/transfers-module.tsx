"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, CheckCircle, Trash2, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Transfer {
  id: string
  productId: string
  from: string
  to: string
  qty: number
  status: "Draft" | "Ready" | "Completed"
  date: string
}

interface Product {
  id: string
  name: string
}

interface Warehouse {
  id: string
  name: string
  location: string
}

export default function TransfersModule() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ productId: "", from: "", to: "", qty: 0, date: "" })

  useEffect(() => {
    fetchTransfers()
    fetchProducts()
    fetchWarehouses()
  }, [])

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      const { apiFetch } = await import("@/lib/api-helpers")
      const res = await apiFetch("/api/transfers")
      if (res.ok) {
        const data = await res.json()
        setTransfers(Array.isArray(data) ? data : [])
      } else {
        console.error("Failed to fetch transfers:", res.statusText)
        setTransfers([])
      }
    } catch (error) {
      console.error("Failed to fetch transfers:", error)
      setTransfers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const { apiFetch } = await import("@/lib/api-helpers")
      const res = await apiFetch("/api/products")
      if (res.ok) {
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } else {
        console.error("Failed to fetch products:", res.statusText)
        setProducts([])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setProducts([])
    }
  }

  const fetchWarehouses = async () => {
    try {
      const { apiFetch } = await import("@/lib/api-helpers")
      const res = await apiFetch("/api/warehouses")
      if (res.ok) {
        const data = await res.json()
        setWarehouses(Array.isArray(data) ? data : [])
      } else {
        console.error("Failed to fetch warehouses:", res.statusText)
        setWarehouses([])
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error)
      setWarehouses([])
    }
  }

  const handleOpenDialog = (transfer?: Transfer) => {
    if (transfer) {
      setEditingId(transfer.id)
      setFormData({
        productId: transfer.productId,
        from: transfer.from,
        to: transfer.to,
        qty: transfer.qty,
        date: transfer.date,
      })
    } else {
      setEditingId(null)
      setFormData({ productId: "", from: "", to: "", qty: 0, date: new Date().toISOString().split("T")[0] })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { apiFetch } = await import("@/lib/api-helpers")
      if (editingId) {
        await apiFetch(`/api/transfers/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        })
      } else {
        await apiFetch("/api/transfers", {
          method: "POST",
          body: JSON.stringify({ ...formData, status: "Draft" }),
        })
      }
      setIsDialogOpen(false)
      fetchTransfers()
    } catch (error) {
      console.error("Failed to save transfer:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      try {
        const { apiFetch } = await import("@/lib/api-helpers")
        await apiFetch(`/api/transfers/${id}`, { method: "DELETE" })
        fetchTransfers()
      } catch (error) {
        console.error("Failed to delete transfer:", error)
      }
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { apiFetch } = await import("@/lib/api-helpers")
      await apiFetch(`/api/transfers/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      })
      fetchTransfers()
    } catch (error) {
      console.error("Failed to update transfer status:", error)
    }
  }

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || productId
  }

  const statusColors = {
    Draft: "bg-muted text-muted-foreground",
    Ready: "bg-accent/20 text-accent",
    Completed: "bg-primary/20 text-primary",
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Internal Transfers</h1>
        <Button className="gap-2" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4" />
          New Transfer
        </Button>
      </div>

      <Card>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-medium">{transfer.id}</TableCell>
                    <TableCell>{getProductName(transfer.productId)}</TableCell>
                    <TableCell>{transfer.from}</TableCell>
                    <TableCell>{transfer.to}</TableCell>
                    <TableCell>{transfer.qty}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[transfer.status as keyof typeof statusColors]}`}
                      >
                        {transfer.status}
                      </span>
                    </TableCell>
                    <TableCell>{transfer.date}</TableCell>
                    <TableCell className="flex gap-1">
                      {transfer.status === "Ready" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                          onClick={() => handleStatusChange(transfer.id, "Completed")}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(transfer.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Transfer" : "Create New Transfer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="product">Product</Label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                required
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="from">From Warehouse</Label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                required
              >
                <option value="">Select source warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name} ({w.location})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="to">To Warehouse</Label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                required
              >
                <option value="">Select destination warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name} ({w.location})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: Number.parseInt(e.target.value) || 0 })}
                placeholder="Enter quantity"
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {editingId ? "Update Transfer" : "Create Transfer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
