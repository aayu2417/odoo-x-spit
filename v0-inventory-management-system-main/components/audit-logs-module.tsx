"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

  useEffect(() => {
    fetch("/api/audit-log")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

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
              <Input id="user" placeholder="Filter by user..." />
            </div>
            <div>
              <Label htmlFor="doctype" className="text-sm">
                Document Type
              </Label>
              <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
                <option>All Types</option>
                <option>Receipt</option>
                <option>Delivery</option>
                <option>Transfer</option>
                <option>Adjustment</option>
              </select>
            </div>
            <div>
              <Label htmlFor="action" className="text-sm">
                Action
              </Label>
              <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
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
              <Input id="date" type="date" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading audit logs...</div>
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
                        className={`px-3 py-1 rounded-full text-sm font-medium ${actionColors[log.action as keyof typeof actionColors]}`}
                      >
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{log.documentType}</TableCell>
                    <TableCell>{log.documentId}</TableCell>
                    <TableCell>{log.userId}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {JSON.stringify(log.changes).substring(0, 50)}...
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
