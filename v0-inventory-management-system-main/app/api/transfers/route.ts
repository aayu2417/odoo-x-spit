import { db } from "@/lib/db"

export async function GET() {
  try {
    const transfers = db.transfers.getAll()
    return Response.json(transfers)
  } catch (error) {
    return Response.json({ error: "Failed to fetch transfers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const transfer = db.transfers.create(body)
    return Response.json(transfer, { status: 201 })
  } catch (error) {
    return Response.json({ error: "Failed to create transfer" }, { status: 500 })
  }
}
