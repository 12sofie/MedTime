import { NextResponse } from "next/server"
import type { AuthUser } from "@/lib/types"
import { mockMedicos, mockPacientes } from "@/lib/mock-data"

export async function POST(request: Request) {
  try {
    const { usuario, password } = await request.json()

    console.log("[v0] Intento de login:", { usuario, password })

    // Validación básica
    if (!usuario || !password) {
      return NextResponse.json({ error: "Usuario y contraseña son requeridos" }, { status: 400 })
    }

    let authUser: AuthUser | null = null

    // Usuario administrador
    if (usuario === "admin" && password === "123456") {
      authUser = {
        id_usuario: 1,
        email: "admin@medtime.com",
        rol: "administrador",
        persona: {
          id_persona: 1,
          nombre: "Admin",
          apellido: "Sistema",
          dni: "00000000",
          telefono: "999999999",
          correo: "admin@medtime.com",
        },
        administrador: {
          id_administrador: 1,
          fk_id_persona: 1,
          fk_id_usuario: 1,
        },
      }
    }
    // Usuario médico
    else if (usuario === "doctor1" && password === "123456") {
      const medico = mockMedicos[0]
      authUser = {
        id_usuario: 2,
        email: "doctor1@medtime.com",
        rol: "medico",
        persona: medico.persona!,
        medico: medico,
      }
    }
    // Usuario recepcionista
    else if (usuario === "recepcion" && password === "123456") {
      authUser = {
        id_usuario: 4,
        email: "recepcion@medtime.com",
        rol: "recepcionista",
        persona: {
          id_persona: 5,
          nombre: "Recepción",
          apellido: "Hospital",
          dni: "11111111",
          telefono: "999999998",
          correo: "recepcion@medtime.com",
        },
      }
    }
    // Usuario paciente
    else if (usuario === "paciente" && password === "123456") {
      const paciente = mockPacientes[0]
      authUser = {
        id_usuario: 3,
        email: "paciente@medtime.com",
        rol: "paciente",
        persona: paciente.persona!,
        paciente: paciente,
      }
    }

    if (!authUser) {
      console.log("[v0] Credenciales incorrectas")
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    console.log("[v0] Login exitoso:", authUser.rol)
    return NextResponse.json({ user: authUser }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
