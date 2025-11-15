import pool from "@/lib/db"
import { NextResponse } from "next/server"

// Obtener próximos horarios disponibles para todos los médicos
export async function GET() {
  try {
    // Obtener el día de la semana actual y la hora actual
    const now = new Date()
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const diaActual = diasSemana[now.getDay()]
    const horaActual = now.toTimeString().slice(0, 5) // formato HH:MM

    // Consultar horarios disponibles de cada médico
    const query = `
      SELECT 
        m.id_medico,
        d.dia_semana,
        d.hora_inicio,
        d.hora_fin
      FROM tbl_medicos m
      INNER JOIN tbl_medicos_x_disponibilidad md ON m.id_medico = md.fk_id_medico
      INNER JOIN tbl_disponibilidad d ON md.fk_id_disponibilidad = d.id_disponibilidad
      WHERE (
        d.dia_semana > ? OR 
        (d.dia_semana = ? AND d.hora_inicio > ?)
      )
      ORDER BY 
        m.id_medico,
        FIELD(d.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'),
        d.hora_inicio
    `

    const [rows] = await pool.query(query, [diaActual, diaActual, horaActual])
    const horarios = rows as any[]

    // Agrupar horarios por médico y tomar solo los primeros 4
    const horariosPorMedico: Record<number, any[]> = {}
    
    for (const horario of horarios) {
      if (!horariosPorMedico[horario.id_medico]) {
        horariosPorMedico[horario.id_medico] = []
      }
      
      if (horariosPorMedico[horario.id_medico].length < 4) {
        horariosPorMedico[horario.id_medico].push({
          dia: horario.dia_semana,
          hora: horario.hora_inicio.slice(0, 5) // formato HH:MM
        })
      }
    }

    return NextResponse.json({ horariosPorMedico }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error al obtener horarios próximos:", error)
    return NextResponse.json(
      { error: "Error al obtener horarios próximos" },
      { status: 500 }
    )
  }
}
