import { db } from "@/lib/db"

export async function GET() {
  try {
    const receipts = db.receipts.getAll()
    return Response.json(receipts)
  } catch (error) {
    return Response.json({ error: "Failed to fetch receipts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const receipt = db.receipts.create(body)
    return Response.json(receipt, { status: 201 })
  } catch (error) {
    return Response.json({ error: "Failed to create receipt" }, { status: 500 })
  }
}
