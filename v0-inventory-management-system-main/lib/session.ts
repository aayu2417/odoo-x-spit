// Session management utilities
// In production, use proper session management (NextAuth, JWT, etc.)

export interface Session {
  userId: string
  email: string
  name: string
  organizationId: string
  role?: string
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  
  const userId = localStorage.getItem('userId')
  const email = localStorage.getItem('email')
  const name = localStorage.getItem('userName')
  const organizationId = localStorage.getItem('organizationId')
  const role = localStorage.getItem('role')

  if (!userId || !email || !organizationId) {
    return null
  }

  return {
    userId,
    email,
    name: name || '',
    organizationId,
    role: role || undefined,
  }
}

export function setSession(session: Session) {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('userId', session.userId)
  localStorage.setItem('email', session.email)
  localStorage.setItem('userName', session.name)
  localStorage.setItem('organizationId', session.organizationId)
  if (session.role) {
    localStorage.setItem('role', session.role)
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('userId')
  localStorage.removeItem('email')
  localStorage.removeItem('userName')
  localStorage.removeItem('organizationId')
  localStorage.removeItem('role')
}

// Server-side session helper (for API routes)
export function getOrganizationIdFromRequest(request: Request): string | null {
  // In a real app, you'd get this from JWT token or session cookie
  // For now, we'll use a header (set by client)
  return request.headers.get('x-organization-id')
}

