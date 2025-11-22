import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const receipt = db.receipts.getById(id)
    if (!receipt) return Response.json({ error: "Receipt not found" }, { status: 404 })
    return Response.json(receipt)
  } catch (error) {
    return Response.json({ error: "Failed to fetch receipt" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const receipt = db.receipts.update(id, body)
    if (!receipt) return Response.json({ error: "Receipt not found" }, { status: 404 })
    return Response.json(receipt)
  } catch (error) {
    return Response.json({ error: "Failed to update receipt" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    db.receipts.delete(id)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to delete receipt" }, { status: 500 })
  }
}
