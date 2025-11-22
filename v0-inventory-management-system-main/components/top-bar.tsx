"use client"

import { Menu, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [email, setEmail] = useState("")

  useEffect(() => {
    setEmail(localStorage.getItem("email") || "User")
  }, [])

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
          <span className="text-sm font-medium">{email}</span>
        </div>
      </div>
    </div>
  )
}
