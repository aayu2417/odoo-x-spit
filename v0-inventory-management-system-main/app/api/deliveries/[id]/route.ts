import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const delivery = db.deliveries.getById(id)
    if (!delivery) return Response.json({ error: "Delivery not found" }, { status: 404 })
    return Response.json(delivery)
  } catch (error) {
    return Response.json({ error: "Failed to fetch delivery" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const delivery = db.deliveries.update(id, body)
    if (!delivery) return Response.json({ error: "Delivery not found" }, { status: 404 })
    return Response.json(delivery)
  } catch (error) {
    return Response.json({ error: "Failed to update delivery" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    db.deliveries.delete(id)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to delete delivery" }, { status: 500 })
  }
}
