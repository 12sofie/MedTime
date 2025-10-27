"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<"administrador" | "medico" | "paciente">
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (allowedRoles && !allowedRoles.includes(user.rol)) {
        // Redirigir al dashboard correspondiente según el rol
        if (user.rol === "administrador") {
          router.push("/admin/dashboard")
        } else if (user.rol === "medico") {
          router.push("/medico/dashboard")
        } else if (user.rol === "paciente") {
          router.push("/paciente/dashboard")
        }
      }
    }
  }, [user, isLoading, allowedRoles, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.rol))) {
    return null
  }

  return <>{children}</>
}
