import pool from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id_paciente,
        p.fk_id_persona,
        p.activo,
        per.nombre,
        per.apellido,
        per.dni,
        per.telefono,
        per.correo
      FROM paciente p
      INNER JOIN persona per ON p.fk_id_persona = per.id_persona
      WHERE p.activo = 1
      ORDER BY per.nombre, per.apellido
    `)

    const pacientes = (rows as any[]).map((row) => ({
      id_paciente: row.id_paciente,
      fk_id_persona: row.fk_id_persona,
      activo: row.activo,
      persona: {
        nombre: row.nombre,
        apellido: row.apellido,
        dni: row.dni,
        telefono: row.telefono,
        correo: row.correo,
      },
    }))

    return NextResponse.json(pacientes)
  } catch (error) {
    console.error("[v0] Error al obtener pacientes:", error)
    return NextResponse.json({ error: "Error al obtener pacientes" }, { status: 500 })
  }
}
