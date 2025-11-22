"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  CheckCircle,
  Download,
  FileText,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Delivery {
  id: string;
  customer: string;
  date: string;
  items: { productId: string; quantity: number }[];
  status: "Draft" | "Ready" | "Completed";
  total: number;
}

export default function DeliveriesModule() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer: "",
    date: "",
    total: 0,
  });

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const { apiFetch } = await import("@/lib/api-helpers");
      const res = await apiFetch("/api/deliveries");
      if (res.ok) {
        const data = await res.json();
        // Ensure data is an array
        setDeliveries(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch deliveries:", res.statusText);
        setDeliveries([]);
      }
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (delivery?: Delivery) => {
    if (delivery) {
      setEditingId(delivery.id);
      setFormData({
        customer: delivery.customer,
        date: delivery.date,
        total: delivery.total,
      });
    } else {
      setEditingId(null);
      setFormData({
        customer: "",
        date: new Date().toISOString().split("T")[0],
        total: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { apiFetch } = await import("@/lib/api-helpers");
      if (editingId) {
        await apiFetch(`/api/deliveries/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch("/api/deliveries", {
          method: "POST",
          body: JSON.stringify({ ...formData, items: [], status: "Draft" }),
        });
      }
      setIsDialogOpen(false);
      fetchDeliveries();
    } catch (error) {
      console.error("Failed to save delivery:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      try {
        const { apiFetch } = await import("@/lib/api-helpers");
        await apiFetch(`/api/deliveries/${id}`, { method: "DELETE" });
        fetchDeliveries();
      } catch (error) {
        console.error("Failed to delete delivery:", error);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { apiFetch } = await import("@/lib/api-helpers");
      await apiFetch(`/api/deliveries/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      fetchDeliveries();
    } catch (error) {
      console.error("Failed to update delivery status:", error);
    }
  };

  const statusColors = {
    Draft: "bg-muted text-muted-foreground",
    Ready: "bg-accent/20 text-accent",
    Completed: "bg-primary/20 text-primary",
  };

  const exportToPDF = (delivery: Delivery) => {
    const element = document.createElement("div");
    element.innerHTML = `
      <h1>Delivery Order #${delivery.id}</h1>
      <p>Customer: ${delivery.customer}</p>
      <p>Date: ${delivery.date}</p>
      <p>Total: ${delivery.total}</p>
      <p>Status: ${delivery.status}</p>
    `;
    const printWindow = window.open("", "", "height=400,width=600");
    printWindow?.document.write(element.innerHTML);
    printWindow?.document.close();
    printWindow?.print();
  };

  const exportToExcel = (delivery: Delivery) => {
    const csv = `Delivery ID,Customer,Date,Total,Status\n${delivery.id},${delivery.customer},${delivery.date},${delivery.total},${delivery.status}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delivery-${delivery.id}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Delivery Orders</h1>
        <Button className="gap-2" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4" />
          New Delivery
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
                  <TableHead>Delivery ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">{delivery.id}</TableCell>
                    <TableCell>{delivery.customer}</TableCell>
                    <TableCell>{delivery.date}</TableCell>
                    <TableCell>{delivery.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusColors[
                            delivery.status as keyof typeof statusColors
                          ]
                        }`}
                      >
                        {delivery.status}
                      </span>
                    </TableCell>
                    <TableCell className="flex gap-1">
                      {delivery.status === "Ready" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary"
                          onClick={() =>
                            handleStatusChange(delivery.id, "Completed")
                          }
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportToPDF(delivery)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportToExcel(delivery)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(delivery.id)}
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
            <DialogTitle>
              {editingId ? "Edit Delivery" : "Create New Delivery"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customer">Customer Name</Label>
              <Input
                id="customer"
                value={formData.customer}
                onChange={(e) =>
                  setFormData({ ...formData, customer: e.target.value })
                }
                placeholder="Enter customer name"
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="total">Total Amount</Label>
              <Input
                id="total"
                type="number"
                value={formData.total}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total: Number.parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Enter total amount"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {editingId ? "Update Delivery" : "Create Delivery"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
