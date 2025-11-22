// Helper functions for API routes

export function getOrganizationIdFromRequest(request: Request): string | null {
  // Get organizationId from header (set by client)
  return request.headers.get("x-organization-id")
}

export function getUserIdFromRequest(request: Request): string | null {
  return request.headers.get("x-user-id")
}

// Helper to create headers for API requests from client
export function createApiHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  
  const organizationId = localStorage.getItem('organizationId')
  const userId = localStorage.getItem('userId')
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (organizationId) {
    headers['x-organization-id'] = organizationId
  }
  
  if (userId) {
    headers['x-user-id'] = userId
  }
  
  return headers
}

// Client-side fetch wrapper
export async function apiFetch(url: string, options: RequestInit = {}) {
  const headers = createApiHeaders()
  
  // Merge with existing headers
  const mergedHeaders = {
    ...headers,
    ...(options.headers || {}),
  }
  
  return fetch(url, {
    ...options,
    headers: mergedHeaders,
  })
}
