"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch } from "@/lib/api-helpers"
import { Loader2 } from "lucide-react"

interface AuditLog {
  id: string
  action: string
  userId: string
  documentType: string
  documentId: string
  changes: Record<string, any>
  timestamp: string
}

export default function AuditLogsModule() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    userId: "",
    documentType: "",
    action: "",
    date: "",
  })

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.userId) params.append("userId", filters.userId)
      if (filters.documentType && filters.documentType !== "All Types") {
        params.append("documentType", filters.documentType)
      }
      if (filters.date) params.append("startDate", filters.date)

      const response = await apiFetch(`/api/audit-log?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        let filtered = Array.isArray(data) ? data : []
        
        // Filter by action if specified
        if (filters.action && filters.action !== "All Actions") {
          filtered = filtered.filter((log: AuditLog) => log.action === filters.action)
        }
        
        setLogs(filtered)
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const actionColors = {
    CREATE: "bg-primary/20 text-primary",
    UPDATE: "bg-secondary/20 text-secondary",
    DELETE: "bg-destructive/20 text-destructive",
    VALIDATE: "bg-accent/20 text-accent",
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Audit Logs</h1>

      <Card>
        <div className="p-6">
          <div className="mb-6 p-4 bg-muted rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="user" className="text-sm">
                User
              </Label>
              <Input
                id="user"
                placeholder="Filter by user..."
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="doctype" className="text-sm">
                Document Type
              </Label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                value={filters.documentType}
                onChange={(e) => setFilters({ ...filters, documentType: e.target.value })}
              >
                <option>All Types</option>
                <option>Receipt</option>
                <option>Delivery</option>
                <option>Transfer</option>
                <option>Adjustment</option>
                <option>Product</option>
                <option>Warehouse</option>
                <option>Unit</option>
              </select>
            </div>
            <div>
              <Label htmlFor="action" className="text-sm">
                Action
              </Label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              >
                <option>All Actions</option>
                <option>CREATE</option>
                <option>UPDATE</option>
                <option>DELETE</option>
                <option>VALIDATE</option>
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
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Document ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${actionColors[log.action as keyof typeof actionColors] || "bg-muted"}`}
                      >
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{log.documentType}</TableCell>
                    <TableCell>{log.documentId}</TableCell>
                    <TableCell>{log.userId}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                      {JSON.stringify(log.changes)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  )
}
