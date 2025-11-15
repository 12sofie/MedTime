import pool from "@/lib/db"
import { NextResponse } from "next/server"

// Obtener todas las disponibilidades del médico logueado
export async function GET() {
  try {
    const idMedico = 3 // TODO: Obtener de la sesión

    const [rows] = await pool.query(`
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
    `, [idMedico])

    return NextResponse.json(rows)
  } catch (error) {
    console.error("[v0] Error al obtener disponibilidad:", error)
    return NextResponse.json({ error: "Error al obtener disponibilidad" }, { status: 500 })
  }
}

// Crear nueva disponibilidad
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { dia_semana, hora_inicio, hora_fin } = body

    if (!dia_semana || !hora_inicio || !hora_fin) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const idMedico = 3 // TODO: Obtener de la sesión

    const [result] = await pool.query(
      `INSERT INTO tbl_disponibilidad (dia_semana, hora_inicio, hora_fin) VALUES (?, ?, ?)`,
      [dia_semana, hora_inicio, hora_fin],
    )

    const idDisponibilidad = (result as any).insertId

    await pool.query(
      `INSERT INTO tbl_medicos_x_disponibilidad (fk_id_medico, fk_id_disponibilidad) VALUES (?, ?)`,
      [idMedico, idDisponibilidad],
    )

    return NextResponse.json({ success: true, id: idDisponibilidad })
  } catch (error) {
    console.error("[v0] Error al crear disponibilidad:", error)
    return NextResponse.json({ error: "Error al crear disponibilidad" }, { status: 500 })
  }
}
