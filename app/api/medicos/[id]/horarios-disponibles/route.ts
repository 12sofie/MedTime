import pool from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// Obtener horarios disponibles de un médico específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const medicoId = parseInt(id)

    if (isNaN(medicoId)) {
      return NextResponse.json({ error: "ID de médico inválido" }, { status: 400 })
    }

    // Consultar los horarios disponibles del médico desde la base de datos
    const query = `
      SELECT 
        d.id_disponibilidad,
        d.dia_semana,
        d.hora_inicio,
        d.hora_fin
      FROM tbl_disponibilidad d
      INNER JOIN tbl_medicos_x_disponibilidad md ON d.id_disponibilidad = md.fk_id_disponibilidad
      WHERE md.fk_id_medico = ?
      ORDER BY 
        FIELD(d.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'),
        d.hora_inicio
    `

    const [rows] = await pool.query(query, [medicoId])
    const horarios = rows as any[]

    return NextResponse.json({ horarios }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error al obtener horarios disponibles:", error)
    return NextResponse.json(
      { error: "Error al obtener horarios disponibles" },
      { status: 500 }
    )
  }
}
