import { db } from "@/lib/db"

export async function GET() {
  try {
    const products = db.products.getAll()
    return Response.json(products)
  } catch (error) {
    return Response.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const product = db.products.create(body)
    return Response.json(product, { status: 201 })
  } catch (error) {
    return Response.json({ error: "Failed to create product" }, { status: 500 })
  }
}
