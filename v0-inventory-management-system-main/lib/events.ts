// Custom event system for cross-component communication

export const DASHBOARD_REFRESH_EVENT = 'dashboard-refresh'

export function triggerDashboardRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DASHBOARD_REFRESH_EVENT))
  }
}

export function listenForDashboardRefresh(callback: () => void) {
  if (typeof window !== 'undefined') {
    window.addEventListener(DASHBOARD_REFRESH_EVENT, callback)
    return () => window.removeEventListener(DASHBOARD_REFRESH_EVENT, callback)
  }
  return () => {}
}

