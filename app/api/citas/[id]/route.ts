import { mockCitas } from "@/lib/mock-data"
import { NextResponse } from "next/server"

// GET - Obtener una cita específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const cita = mockCitas.find((c) => c.id_citas === id)

    if (!cita) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ cita }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error al obtener cita:", error)
    return NextResponse.json({ error: "Error al obtener cita" }, { status: 500 })
  }
}

// PUT - Actualizar una cita
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const data = await request.json()

    const citaIndex = mockCitas.findIndex((c) => c.id_citas === id)

    if (citaIndex === -1) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    // Actualizar cita (simulado)
    const citaActualizada = {
      ...mockCitas[citaIndex],
      ...data,
      fecha_cita: data.fecha_cita ? new Date(data.fecha_cita) : mockCitas[citaIndex].fecha_cita,
    }

    console.log("[v0] Cita actualizada:", citaActualizada)

    return NextResponse.json({ cita: citaActualizada, message: "Cita actualizada exitosamente" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error al actualizar cita:", error)
    return NextResponse.json({ error: "Error al actualizar cita" }, { status: 500 })
  }
}

// DELETE - Eliminar una cita
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const citaIndex = mockCitas.findIndex((c) => c.id_citas === id)

    if (citaIndex === -1) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    console.log("[v0] Cita eliminada:", mockCitas[citaIndex])

    return NextResponse.json({ message: "Cita eliminada exitosamente" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error al eliminar cita:", error)
    return NextResponse.json({ error: "Error al eliminar cita" }, { status: 500 })
  }
}
