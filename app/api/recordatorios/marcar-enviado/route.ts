
import { NextResponse } from "next/server"
import pool from "@/lib/db"

// POST - Marcar recordatorio como enviado
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { id_cita, medio, mensaje } = data

    if (!id_cita || !medio) {
      return NextResponse.json({ error: "Faltan campos requeridos: id_cita y medio" }, { status: 400 })
    }

    const query = `
      INSERT INTO tbl_recordatorios (
        medio,
        fecha_envio,
        estado_envio,
        mensaje,
        tbl_citas_id_citas
      ) VALUES (?, NOW(), 'enviado', ?, ?)
    `

    const [result] = await pool.query(query, [medio, mensaje || "Recordatorio de cita médica", id_cita])

    return NextResponse.json(
      {
        message: "Recordatorio registrado exitosamente",
        id_recordatorio: (result as any).insertId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error al registrar recordatorio:", error)
    return NextResponse.json({ error: "Error al registrar recordatorio" }, { status: 500 })
  }
}
