"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Database } from "lucide-react"
import { setSession } from "@/lib/session"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userName, setUserName] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          mode: isLogin ? "login" : "signup",
          userName: isLogin ? undefined : userName,
          organizationName: isLogin ? undefined : organizationName,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (isLogin) {
          // Login - redirect to dashboard
          setSession({
            userId: data.userId,
            email: data.email,
            name: data.name,
            organizationId: data.organizationId,
            role: data.role,
          })
          window.location.href = "/dashboard"
        } else {
          // Signup - redirect to login page
          setError("")
          setIsLogin(true)
          setEmail("")
          setPassword("")
          setUserName("")
          setOrganizationName("")
          alert("Account created successfully! Please sign in.")
        }
      } else {
        setError(data.error || "Authentication failed")
      }
    } catch (error) {
      console.error("Auth error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="flex items-center justify-center mb-8">
            <Database className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-primary">StockMaster</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="My Company"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div>
                  <Label htmlFor="userName">Your Name</Label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="John Doe"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
