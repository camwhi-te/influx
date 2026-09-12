import { LayoutDashboardIcon, ServerIcon, UserIcon, SettingsIcon } from 'lucide-react'
import type { ComponentType } from 'react'

export type AppRoute = 'dashboard' | 'servers.index' | 'dashboard.account' | 'dashboard.settings'

export type NavItem = {
  label: string
  /** Named route (Tuyau registry key) */
  route: AppRoute
  /** URL prefix used to compute the active state */
  match: string
  icon: ComponentType<{ className?: string }>
}

/**
 * Primary navigation for the authenticated area. Add entries here as the
 * app grows — every consumer (top bar, mobile drawer) stays in sync.
 */
export const appNav: NavItem[] = [
  { label: 'Dashboard', route: 'dashboard', match: '/app', icon: LayoutDashboardIcon },
  { label: 'Servers', route: 'servers.index', match: '/app/servers', icon: ServerIcon },
  { label: 'Account', route: 'dashboard.account', match: '/app/account', icon: UserIcon },
  { label: 'Settings', route: 'dashboard.settings', match: '/app/settings', icon: SettingsIcon },
]

export function isActive(currentUrl: string, match: string) {
  if (match === '/app') return currentUrl === '/app' || currentUrl === '/app/'
  return currentUrl === match || currentUrl.startsWith(match + '/')
}
