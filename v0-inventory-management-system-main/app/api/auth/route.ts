export async function POST(request: Request) {
  try {
    const { email, password, mode } = await request.json()

    // Demo authentication - in production, use Supabase or similar
    const demoEmail = "demo@stockmaster.com"
    const demoPassword = "demo123"

    if (email === demoEmail && password === demoPassword) {
      return Response.json({
        success: true,
        userId: "user-1",
        email: email,
      })
    }

    // Allow any email/password combo in demo mode (except actual admin credentials)
    if (mode === "signup") {
      return Response.json({
        success: true,
        userId: `user-${Date.now()}`,
        email: email,
      })
    }

    return Response.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return Response.json({ error: "Authentication failed" }, { status: 500 })
  }
}
