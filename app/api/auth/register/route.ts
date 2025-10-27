import { NextResponse } from "next/server"
import type { PacienteForm } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const data: PacienteForm = await request.json()

    // Validación básica
    if (!data.email || !data.password || !data.nombre || !data.apellido || !data.dni) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    // Validar longitud de contraseña
    if (data.password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    // Aquí iría la lógica para crear el usuario en la base de datos
    // Por ahora solo simulamos una respuesta exitosa
    console.log("[v0] Registro de nuevo paciente:", data)

    return NextResponse.json(
      {
        message: "Registro exitoso",
        user: {
          email: data.email,
          nombre: data.nombre,
          apellido: data.apellido,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error en registro:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
