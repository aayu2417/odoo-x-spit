import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function StockTable() {
  const movements = [
    { id: 1, product: "Steel Rods", type: "Receipt", quantity: 50, location: "Warehouse A", date: "2025-11-22" },
    { id: 2, product: "Chairs", type: "Delivery", quantity: -10, location: "Warehouse A", date: "2025-11-21" },
    { id: 3, product: "Desks", type: "Transfer", quantity: 25, location: "Warehouse B", date: "2025-11-20" },
    { id: 4, product: "Steel Rods", type: "Adjustment", quantity: -3, location: "Warehouse A", date: "2025-11-19" },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement) => (
          <TableRow key={movement.id}>
            <TableCell className="font-medium">{movement.product}</TableCell>
            <TableCell>{movement.type}</TableCell>
            <TableCell className={movement.quantity < 0 ? "text-destructive" : "text-secondary"}>
              {movement.quantity > 0 ? "+" : ""}
              {movement.quantity}
            </TableCell>
            <TableCell>{movement.location}</TableCell>
            <TableCell>{movement.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
