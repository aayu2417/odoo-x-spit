import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import type { Organization, User } from "@/lib/models"

export async function POST(request: Request) {
  try {
    const { email, password, mode, organizationName, userName } = await request.json()

    if (mode === "signup") {
      // Check if organization with same name already exists (case-insensitive)
      const orgName = organizationName || `${email.split("@")[0]}'s Organization`
      let organization = await db.organizations.getByName(orgName)
      
      // If organization doesn't exist, create it
      if (!organization) {
        organization = await db.organizations.create({
          name: orgName,
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user linked to existing or new organization
      const user = await db.users.create({
        email,
        password: hashedPassword,
        name: userName || email.split("@")[0],
        organizationId: organization.id,
        role: "admin",
      })

      return Response.json({
        success: true,
        userId: (user as any).id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        role: user.role,
      })
    } else {
      // Login mode
      const user = await db.users.getByEmail(email)
      
      if (!user) {
        return Response.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password)
      
      if (!isValid) {
        return Response.json({ error: "Invalid credentials" }, { status: 401 })
      }

      return Response.json({
        success: true,
        userId: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        role: user.role,
      })
    }
  } catch (error) {
    console.error("Auth error:", error)
    return Response.json({ error: "Authentication failed" }, { status: 500 })
  }
}
