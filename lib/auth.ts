// Utilidades de autenticación
import type { AuthUser } from "./types"

// Simulación de almacenamiento de sesión (en producción usar JWT o sesiones reales)
export function setAuthUser(user: AuthUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem("authUser", JSON.stringify(user))
  }
}

export function getAuthUser(): AuthUser | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("authUser")
    return user ? JSON.parse(user) : null
  }
  return null
}

export function clearAuthUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authUser")
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null
}

export function hasRole(role: "administrador" | "medico" | "paciente"): boolean {
  const user = getAuthUser()
  return user?.rol === role
}
