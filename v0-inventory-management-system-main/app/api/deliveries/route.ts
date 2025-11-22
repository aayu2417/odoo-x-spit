import { db } from "@/lib/db"

export async function GET() {
  try {
    const deliveries = db.deliveries.getAll()
    return Response.json(deliveries)
  } catch (error) {
    return Response.json({ error: "Failed to fetch deliveries" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const delivery = db.deliveries.create(body)
    return Response.json(delivery, { status: 201 })
  } catch (error) {
    return Response.json({ error: "Failed to create delivery" }, { status: 500 })
  }
}
