"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  RotateCcw,
  History,
  Settings,
  ChevronLeft,
  Database,
  LogOut,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/products", label: "Products", icon: Package },
    { href: "/receipts", label: "Receipts", icon: TrendingUp },
    { href: "/deliveries", label: "Deliveries", icon: TrendingDown },
    { href: "/transfers", label: "Internal Transfers", icon: ArrowRightLeft },
    { href: "/adjustments", label: "Stock Adjustments", icon: RotateCcw },
    { href: "/ledger", label: "Move History", icon: History },
    { href: "/audit-logs", label: "Audit Logs", icon: Shield },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  return (
    <div
      className={`${open ? "w-64" : "w-20"} bg-card border-r border-border transition-all duration-300 flex flex-col`}
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        {open && (
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">StockMaster</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
          <ChevronLeft className={`w-4 h-4 transition-transform ${!open ? "rotate-180" : ""}`} />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {open && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-transparent"
          onClick={() => {
            localStorage.clear()
            window.location.href = "/"
          }}
        >
          <LogOut className="w-4 h-4" />
          {open && "Logout"}
        </Button>
      </div>
    </div>
  )
}
