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

interface Receipt {
  id: string;
  supplier: string;
  date: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
  status: "Draft" | "Validated" | "Completed";
  total: number;
}

export default function ReceiptsModule() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    supplier: "",
    date: "",
    total: 0,
  });

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const { apiFetch } = await import("@/lib/api-helpers");
      const res = await apiFetch("/api/receipts");
      if (res.ok) {
        const data = await res.json();
        // Ensure data is an array
        setReceipts(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch receipts:", res.statusText);
        setReceipts([]);
      }
    } catch (error) {
      console.error("Failed to fetch receipts:", error);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (receipt?: Receipt) => {
    if (receipt) {
      setEditingId(receipt.id);
      setFormData({
        supplier: receipt.supplier,
        date: receipt.date,
        total: receipt.total,
      });
    } else {
      setEditingId(null);
      setFormData({
        supplier: "",
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
        await apiFetch(`/api/receipts/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch("/api/receipts", {
          method: "POST",
          body: JSON.stringify({ ...formData, items: [], status: "Draft" }),
        });
      }
      setIsDialogOpen(false);
      fetchReceipts();
    } catch (error) {
      console.error("Failed to save receipt:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      try {
        const { apiFetch } = await import("@/lib/api-helpers");
        await apiFetch(`/api/receipts/${id}`, { method: "DELETE" });
        fetchReceipts();
      } catch (error) {
        console.error("Failed to delete receipt:", error);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { apiFetch } = await import("@/lib/api-helpers");
      const response = await apiFetch(`/api/receipts/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchReceipts();
        // Trigger dashboard refresh when receipt is validated
        if (newStatus === "Validated" || newStatus === "Completed") {
          const { triggerDashboardRefresh } = await import("@/lib/events");
          triggerDashboardRefresh();
        }
      }
    } catch (error) {
      console.error("Failed to update receipt status:", error);
    }
  };

  const statusColors = {
    Draft: "bg-muted text-muted-foreground",
    Validated: "bg-secondary/20 text-secondary",
    Completed: "bg-primary/20 text-primary",
  };

  const exportToPDF = (receipt: Receipt) => {
    const element = document.createElement("div");
    element.innerHTML = `
      <h1>Receipt #${receipt.id}</h1>
      <p>Supplier: ${receipt.supplier}</p>
      <p>Date: ${receipt.date}</p>
      <p>Total: ${receipt.total}</p>
      <p>Status: ${receipt.status}</p>
    `;
    const printWindow = window.open("", "", "height=400,width=600");
    printWindow?.document.write(element.innerHTML);
    printWindow?.document.close();
    printWindow?.print();
  };

  const exportToExcel = (receipt: Receipt) => {
    const csv = `Receipt ID,Supplier,Date,Total,Status\n${receipt.id},${receipt.supplier},${receipt.date},${receipt.total},${receipt.status}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${receipt.id}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Receipts (Incoming Stock)</h1>
        <Button className="gap-2" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4" />
          New Receipt
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
                  <TableHead>Receipt ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No receipts found
                    </TableCell>
                  </TableRow>
                ) : (
                  receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">
                        {receipt.id}
                      </TableCell>
                      <TableCell>{receipt.supplier}</TableCell>
                      <TableCell>{receipt.date}</TableCell>
                      <TableCell>{receipt.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            statusColors[
                              receipt.status as keyof typeof statusColors
                            ]
                          }`}
                        >
                          {receipt.status}
                        </span>
                      </TableCell>
                      <TableCell className="flex gap-1">
                        {receipt.status === "Draft" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            onClick={() =>
                              handleStatusChange(receipt.id, "Validated")
                            }
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportToPDF(receipt)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportToExcel(receipt)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDelete(receipt.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Receipt" : "Create New Receipt"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="supplier">Supplier Name</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                placeholder="Enter supplier name"
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
              {editingId ? "Update Receipt" : "Create Receipt"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
