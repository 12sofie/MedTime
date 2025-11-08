import { NextResponse } from "next/server"
import pool from "@/lib/db"

// GET - Obtener citas que necesitan recordatorio
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const horasAntes = searchParams.get("horas") || "24"

    const query = `
      SELECT 
        c.id_citas,
        c.fecha_cita,
        c.motivo,
        c.observaciones,
        c.fk_id_medico,
        c.fk_id_paciente,
        c.fk_id_consultorio,
        e.nombre as estado_nombre,
        cons.nombre_sala,
        cons.ubicacion,
        pm.nombre as medico_nombre,
        pm.apellido as medico_apellido,
        pm.telefono as medico_telefono,
        pm.correo as medico_correo,
        pp.nombre as paciente_nombre,
        pp.apellido as paciente_apellido,
        pp.telefono as paciente_telefono,
        pp.correo as paciente_correo,
        esp.nombre as especialidad_nombre
      FROM tbl_citas c
      LEFT JOIN tbl_estado e ON c.fk_id_estado = e.id_estado
      LEFT JOIN tbl_consultorios cons ON c.fk_id_consultorio = cons.id_consultorio
      LEFT JOIN tbl_medicos m ON c.fk_id_medico = m.id_medico
      LEFT JOIN tbl_persona pm ON m.fk_id_persona = pm.id_persona
      LEFT JOIN tbl_especialidades esp ON m.fk_id_especialidad = esp.id_especialidad
      LEFT JOIN tbl_pacientes pac ON c.fk_id_paciente = pac.id_paciente
      LEFT JOIN tbl_persona pp ON pac.fk_id_persona = pp.id_persona
      WHERE 
        c.fecha_cita BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? HOUR)
        AND e.nombre IN ('Pendiente', 'Confirmada')
        AND NOT EXISTS (
          SELECT 1 FROM tbl_recordatorios r 
          WHERE r.tbl_citas_id_citas = c.id_citas 
          AND r.estado_envio = 'enviado'
        )
      ORDER BY c.fecha_cita ASC
    `

    const [rows] = await pool.query(query, [Number.parseInt(horasAntes)])

    const citasParaRecordatorio = (rows as any[]).map((row) => ({
      id_cita: row.id_citas,
      fecha_cita: row.fecha_cita,
      motivo: row.motivo,
      observaciones: row.observaciones,
      estado: row.estado_nombre,
      consultorio: {
        nombre: row.nombre_sala,
        ubicacion: row.ubicacion,
      },
      medico: {
        id: row.fk_id_medico,
        nombre_completo: `${row.medico_nombre} ${row.medico_apellido}`,
        telefono: row.medico_telefono,
        correo: row.medico_correo,
        especialidad: row.especialidad_nombre,
      },
      paciente: {
        id: row.fk_id_paciente,
        nombre_completo: `${row.paciente_nombre} ${row.paciente_apellido}`,
        telefono: row.paciente_telefono,
        correo: row.paciente_correo,
      },
    }))

    return NextResponse.json(
      {
        total: citasParaRecordatorio.length,
        citas: citasParaRecordatorio,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error al obtener citas para recordatorio:", error)
    return NextResponse.json({ error: "Error al obtener citas para recordatorio" }, { status: 500 })
  }
}
