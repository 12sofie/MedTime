import { NextResponse } from "next/server"
import { mockCitas, mockMedicos, mockPacientes, mockConsultorios, mockEstados } from "@/lib/mock-data"
import type { Cita } from "@/lib/types"

// GET - Obtener todas las citas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const medicoId = searchParams.get("medico_id")
    const pacienteId = searchParams.get("paciente_id")
    const estado = searchParams.get("estado")

    let citas = [...mockCitas]

    // Filtrar por médico
    if (medicoId) {
      citas = citas.filter((c) => c.fk_id_medico === Number.parseInt(medicoId))
    }

    // Filtrar por paciente
    if (pacienteId) {
      citas = citas.filter((c) => c.fk_id_paciente === Number.parseInt(pacienteId))
    }

    // Filtrar por estado
    if (estado) {
      citas = citas.filter((c) => c.estado?.nombre === estado)
    }

    return NextResponse.json({ citas }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error al obtener citas:", error)
    return NextResponse.json({ error: "Error al obtener citas" }, { status: 500 })
  }
}

// POST - Crear nueva cita
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validaciones
    if (!data.fecha_cita || !data.fk_id_medico || !data.fk_id_paciente || !data.fk_id_consultorio) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar que el médico existe
    const medico = mockMedicos.find((m) => m.id_medico === data.fk_id_medico)
    if (!medico) {
      return NextResponse.json({ error: "Médico no encontrado" }, { status: 404 })
    }

    // Verificar que el paciente existe
    const paciente = mockPacientes.find((p) => p.id_paciente === data.fk_id_paciente)
    if (!paciente) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 })
    }

    // Verificar que el consultorio existe
    const consultorio = mockConsultorios.find((c) => c.id_consultorio === data.fk_id_consultorio)
    if (!consultorio) {
      return NextResponse.json({ error: "Consultorio no encontrado" }, { status: 404 })
    }

    // Crear nueva cita (simulado)
    const nuevaCita: Cita = {
      id_citas: mockCitas.length + 1,
      fecha_cita: new Date(data.fecha_cita),
      fecha_creacion: new Date(),
      motivo: data.motivo || "",
      observaciones: data.observaciones || "",
      fk_id_medico: data.fk_id_medico,
      fk_id_paciente: data.fk_id_paciente,
      fk_id_estado: 1, // Pendiente por defecto
      fk_id_consultorio: data.fk_id_consultorio,
      medico,
      paciente,
      estado: mockEstados[0],
      consultorio,
    }

    console.log("[v0] Nueva cita creada:", nuevaCita)

    return NextResponse.json({ cita: nuevaCita, message: "Cita creada exitosamente" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error al crear cita:", error)
    return NextResponse.json({ error: "Error al crear cita" }, { status: 500 })
  }
}
