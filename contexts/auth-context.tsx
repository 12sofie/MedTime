"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { AuthUser } from "@/lib/types"
import { getAuthUser, setAuthUser as saveAuthUser, clearAuthUser } from "@/lib/auth"

interface AuthContextType {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar usuario de localStorage al montar
    const savedUser = getAuthUser()
    setUser(savedUser)
    setIsLoading(false)
  }, [])

  const login = (authUser: AuthUser) => {
    setUser(authUser)
    saveAuthUser(authUser)
  }

  const logout = () => {
    setUser(null)
    clearAuthUser()
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
