import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const transfer = db.transfers.getById(id)
    if (!transfer) return Response.json({ error: "Transfer not found" }, { status: 404 })
    return Response.json(transfer)
  } catch (error) {
    return Response.json({ error: "Failed to fetch transfer" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const transfer = db.transfers.update(id, body)
    if (!transfer) return Response.json({ error: "Transfer not found" }, { status: 404 })
    return Response.json(transfer)
  } catch (error) {
    return Response.json({ error: "Failed to update transfer" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    db.transfers.delete(id)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to delete transfer" }, { status: 500 })
  }
}
