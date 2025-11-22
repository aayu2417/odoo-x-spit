"use client"

import { Menu, Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getSession, clearSession } from "@/lib/session"
import { useRouter } from "next/navigation"

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [session, setSession] = useState<{ name: string; email: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userSession = getSession()
    if (userSession) {
      setSession({ name: userSession.name, email: userSession.email })
    }
  }, [])

  const handleLogout = () => {
    clearSession()
    router.push("/")
  }

  return (
    <div className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="hidden sm:flex">
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">Inventory Management</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <User className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">{session?.name || session?.email || "User"}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
