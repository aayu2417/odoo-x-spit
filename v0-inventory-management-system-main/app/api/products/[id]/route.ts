import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = db.products.getById(id)
    if (!product) return Response.json({ error: "Product not found" }, { status: 404 })
    return Response.json(product)
  } catch (error) {
    return Response.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const product = db.products.update(id, body)
    if (!product) return Response.json({ error: "Product not found" }, { status: 404 })
    return Response.json(product)
  } catch (error) {
    return Response.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    db.products.delete(id)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
