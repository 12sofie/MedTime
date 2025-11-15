import pool from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Fetching médicos desde la base de datos...")

    const [medicos] = await pool.query(`
      SELECT 
        m.id_medico,
        m.descripcion,
        m.fk_id_persona,
        m.fk_id_usuario,
        m.fk_id_especialidad,
        m.fk_id_consultorio,
        m.activo,
        p.nombre,
        p.apellido,
        p.dni,
        p.telefono,
        p.correo,
        e.id_especialidad,
        e.nombre as especialidad_nombre,
        e.descripcion as especialidad_descripcion,
        c.id_consultorio,
        c.nombre_sala,
        c.ubicacion
      FROM tbl_medicos m
      INNER JOIN tbl_persona p ON m.fk_id_persona = p.id_persona
      INNER JOIN tbl_especialidades e ON m.fk_id_especialidad = e.id_especialidad
      LEFT JOIN tbl_consultorios c ON m.fk_id_consultorio = c.id_consultorio
      WHERE m.activo = 1
      ORDER BY p.nombre, p.apellido
    `)

    console.log(`[v0] ${(medicos as any[]).length} médicos encontrados`)

    const medicosConDisponibilidad = await Promise.all(
      (medicos as any[]).map(async (medico: any) => {
        const [disponibilidad] = await pool.query(`
          SELECT 
            d.id_disponibilidad,
            d.dia_semana,
            d.hora_inicio,
            d.hora_fin
          FROM tbl_medicos_x_disponibilidad mxd
          INNER JOIN tbl_disponibilidad d ON mxd.fk_id_disponibilidad = d.id_disponibilidad
          WHERE mxd.fk_id_medico = ?
          ORDER BY 
            FIELD(d.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'),
            d.hora_inicio
        `, [medico.id_medico])

        return {
          id_medico: medico.id_medico,
          descripcion: medico.descripcion,
          fk_id_persona: medico.fk_id_persona,
          fk_id_usuario: medico.fk_id_usuario,
          fk_id_especialidad: medico.fk_id_especialidad,
          fk_id_consultorio: medico.fk_id_consultorio,
          activo: medico.activo === 1,
          persona: {
            id_persona: medico.fk_id_persona,
            nombre: medico.nombre,
            apellido: medico.apellido,
            dni: medico.dni,
            telefono: medico.telefono,
            correo: medico.correo,
          },
          especialidad: {
            id_especialidad: medico.id_especialidad,
            nombre: medico.especialidad_nombre,
            descripcion: medico.especialidad_descripcion,
          },
          consultorio: medico.id_consultorio ? {
            id_consultorio: medico.id_consultorio,
            nombre_sala: medico.nombre_sala,
            ubicacion: medico.ubicacion,
          } : null,
          disponibilidad: disponibilidad,
        }
      })
    )

    return NextResponse.json({ 
      medicos: medicosConDisponibilidad,
      count: medicosConDisponibilidad.length 
    })
  } catch (error) {
    console.error("[v0] Error al obtener médicos:", error)
    return NextResponse.json(
      { error: "Error al obtener médicos", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
