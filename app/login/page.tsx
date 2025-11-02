"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] Enviando login con:", { usuario, password })

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario, password }),
      })

      const data = await response.json()

      console.log("[v0] Respuesta del servidor:", data)

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión")
        setLoading(false)
        return
      }

      login(data.user)

      if (data.user.rol === "administrador") {
        router.push("/admin/dashboard")
      } else if (data.user.rol === "medico") {
        router.push("/medico/dashboard")
      } else if (data.user.rol === "paciente") {
        router.push("/paciente/dashboard")
      } else if (data.user.rol === "recepcionista") {
        router.push("/admin/dashboard")
      }
    } catch (err) {
      console.error("[v0] Error en login:", err)
      setError("Error de conexión. Intenta nuevamente.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Logo MedTime */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#4A9B9B] to-[#3A8B8B] rounded-2xl flex items-center justify-center shadow-md">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#2C5282]">MedTime</h1>
            </div>
          </div>

          {/* Título */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-[#2C5282]">Iniciar Sesión</h2>
            <p className="text-sm text-[#718096]">Accede a tu cuenta para gestionar citas médicas</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario" className="text-[#2C5282] font-medium">
                Usuario
              </Label>
              <Input
                id="usuario"
                type="text"
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="border-[#E2E8F0] focus:border-[#4A9B9B] focus:ring-[#4A9B9B]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#2C5282] font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[#E2E8F0] focus:border-[#4A9B9B] focus:ring-[#4A9B9B]"
                required
              />
            </div>

            {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-[#4A9B9B] hover:bg-[#3A8B8B] text-white font-medium py-3"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          {/* Usuarios de prueba */}
          <div className="bg-[#F0F4F8] rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-[#2C5282]">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-[#718096]">
              <p>• admin / 123456 (Administrador)</p>
              <p>• doctor1 / 123456 (Médico)</p>
              <p>• recepcion / 123456 (Recepcionista)</p>
              <p>• paciente / 123456 (Cliente/Paciente)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
