import pool from "@/lib/db"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { dia_semana, hora_inicio, hora_fin } = body
    const { id } = await params

    if (!dia_semana || !hora_inicio || !hora_fin) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const idMedico = 3 // TODO: Obtener de la sesión

    const [check] = await pool.query(
      `SELECT md.fk_id_medico, md.fk_id_disponibilidad 
       FROM tbl_medicos_x_disponibilidad md 
       WHERE md.fk_id_disponibilidad = ? AND md.fk_id_medico = ?`,
      [id, idMedico]
    )

    if (!Array.isArray(check) || check.length === 0) {
      return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 })
    }

    await pool.query(
      `UPDATE tbl_disponibilidad SET dia_semana = ?, hora_inicio = ?, hora_fin = ? WHERE id_disponibilidad = ?`,
      [dia_semana, hora_inicio, hora_fin, id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error al actualizar disponibilidad:", error)
    return NextResponse.json({ error: "Error al actualizar disponibilidad" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const idMedico = 3 // TODO: Obtener de la sesión

    const [check] = await pool.query(
      `SELECT md.fk_id_medico, md.fk_id_disponibilidad 
       FROM tbl_medicos_x_disponibilidad md 
       WHERE md.fk_id_disponibilidad = ? AND md.fk_id_medico = ?`,
      [id, idMedico]
    )

    if (!Array.isArray(check) || check.length === 0) {
      return NextResponse.json({ error: "Horario no encontrado" }, { status: 404 })
    }

    await pool.query(
      `DELETE FROM tbl_medicos_x_disponibilidad WHERE fk_id_disponibilidad = ?`,
      [id]
    )

    await pool.query(`DELETE FROM tbl_disponibilidad WHERE id_disponibilidad = ?`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error al eliminar disponibilidad:", error)
    return NextResponse.json({ error: "Error al eliminar disponibilidad" }, { status: 500 })
  }
}
