import { NextResponse } from "next/server"
import pool from "@/lib/db"
import type { Cita } from "@/lib/types"

// GET - Obtener todas las citas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const medicoId = searchParams.get("medico_id")
    const pacienteId = searchParams.get("paciente_id")
    const estado = searchParams.get("estado")

    let query = `
      SELECT 
        c.id_citas,
        c.fecha_cita,
        c.fecha_creacion,
        c.motivo,
        c.observaciones,
        c.fk_id_medico,
        c.fk_id_paciente,
        c.fk_id_estado,
        c.fk_id_consultorio,
        e.nombre as estado_nombre,
        e.color as estado_color,
        cons.nombre_sala,
        cons.ubicacion,
        pm.nombre as medico_nombre,
        pm.apellido as medico_apellido,
        pp.nombre as paciente_nombre,
        pp.apellido as paciente_apellido,
        esp.nombre as especialidad_nombre
      FROM tbl_citas c
      LEFT JOIN tbl_estado e ON c.fk_id_estado = e.id_estado
      LEFT JOIN tbl_consultorios cons ON c.fk_id_consultorio = cons.id_consultorio
      LEFT JOIN tbl_medicos m ON c.fk_id_medico = m.id_medico
      LEFT JOIN tbl_persona pm ON m.fk_id_persona = pm.id_persona
      LEFT JOIN tbl_especialidades esp ON m.fk_id_especialidad = esp.id_especialidad
      LEFT JOIN tbl_pacientes pac ON c.fk_id_paciente = pac.id_paciente
      LEFT JOIN tbl_persona pp ON pac.fk_id_persona = pp.id_persona
      WHERE 1=1
    `

    const params: any[] = []

    // Filtrar por médico
    if (medicoId) {
      query += " AND c.fk_id_medico = ?"
      params.push(Number.parseInt(medicoId))
    }

    // Filtrar por paciente
    if (pacienteId) {
      query += " AND c.fk_id_paciente = ?"
      params.push(Number.parseInt(pacienteId))
    }

    // Filtrar por estado
    if (estado) {
      query += " AND e.nombre = ?"
      params.push(estado)
    }

    query += " ORDER BY c.fecha_cita DESC"

    const [rows] = await pool.query(query, params)

    // Transform database rows to Cita objects
    const citas = (rows as any[]).map((row) => ({
      id_citas: row.id_citas,
      fecha_cita: row.fecha_cita,
      fecha_creacion: row.fecha_creacion,
      motivo: row.motivo,
      observaciones: row.observaciones,
      fk_id_medico: row.fk_id_medico,
      fk_id_paciente: row.fk_id_paciente,
      fk_id_estado: row.fk_id_estado,
      fk_id_consultorio: row.fk_id_consultorio,
      estado: {
        id_estado: row.fk_id_estado,
        nombre: row.estado_nombre,
        color: row.estado_color,
      },
      consultorio: {
        id_consultorio: row.fk_id_consultorio,
        nombre_sala: row.nombre_sala,
        ubicacion: row.ubicacion,
        activo: true,
      },
      medico: {
        id_medico: row.fk_id_medico,
        persona: {
          nombre: row.medico_nombre,
          apellido: row.medico_apellido,
        },
        especialidad: {
          nombre: row.especialidad_nombre,
        },
      },
      paciente: {
        id_paciente: row.fk_id_paciente,
        persona: {
          nombre: row.paciente_nombre,
          apellido: row.paciente_apellido,
        },
      },
    }))

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

    console.log("[v0] =====INICIO DEBUG TIMEZONE API=====")
    console.log("[v0] Datos recibidos para crear cita:", JSON.stringify(data, null, 2))
    console.log("[v0] Fecha recibida (data.fecha_cita):", data.fecha_cita)
    console.log("[v0] Tipo de dato:", typeof data.fecha_cita)

    // Validaciones
    if (!data.fecha_cita || !data.fk_id_medico || !data.fk_id_paciente || !data.fk_id_consultorio) {
      console.log("[v0] Validación fallida. Campos faltantes:", {
        fecha_cita: !!data.fecha_cita,
        fk_id_medico: !!data.fk_id_medico,
        fk_id_paciente: !!data.fk_id_paciente,
        fk_id_consultorio: !!data.fk_id_consultorio,
      })
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Si por alguna razón es un Date object, convertirlo correctamente
    let fechaMysql: string
    if (data.fecha_cita instanceof Date) {
      // Si es un Date object, formatear manualmente sin conversión UTC
      const year = data.fecha_cita.getFullYear()
      const month = String(data.fecha_cita.getMonth() + 1).padStart(2, "0")
      const day = String(data.fecha_cita.getDate()).padStart(2, "0")
      const hours = String(data.fecha_cita.getHours()).padStart(2, "0")
      const minutes = String(data.fecha_cita.getMinutes()).padStart(2, "0")
      const seconds = String(data.fecha_cita.getSeconds()).padStart(2, "0")
      fechaMysql = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    } else if (typeof data.fecha_cita === "string") {
      // Si es string, verificar formato y limpiar si tiene formato ISO
      if (data.fecha_cita.includes("T")) {
        // Si tiene formato ISO, convertir a formato MySQL sin cambiar la hora
        const dateObj = new Date(data.fecha_cita)
        const year = dateObj.getFullYear()
        const month = String(dateObj.getMonth() + 1).padStart(2, "0")
        const day = String(dateObj.getDate()).padStart(2, "0")
        const hours = String(dateObj.getHours()).padStart(2, "0")
        const minutes = String(dateObj.getMinutes()).padStart(2, "0")
        const seconds = String(dateObj.getSeconds()).padStart(2, "0")
        fechaMysql = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      } else {
        // Ya está en formato correcto
        fechaMysql = data.fecha_cita
      }
    } else {
      return NextResponse.json({ error: "Formato de fecha inválido" }, { status: 400 })
    }

    console.log("[v0] Fecha que se insertará en MySQL:", fechaMysql)
    console.log("[v0] Tipo final:", typeof fechaMysql)

    const query = `
      INSERT INTO tbl_citas (
        fecha_cita,
        fecha_creacion,
        motivo,
        observaciones,
        fk_id_medico,
        fk_id_paciente,
        fk_id_estado,
        fk_id_consultorio
      ) VALUES (?, NOW(), ?, ?, ?, ?, 1, ?)
    `

    const params = [
      fechaMysql,
      data.motivo || "",
      data.observaciones || "",
      data.fk_id_medico,
      data.fk_id_paciente,
      data.fk_id_consultorio,
    ]
    console.log("[v0] Parámetros de la query:", params)

    const [result] = await pool.query(query, params)

    const insertId = (result as any).insertId
    console.log("[v0] Cita insertada con ID:", insertId)

    // Fetch the created appointment with all related data
    const [rows] = await pool.query(
      `
      SELECT 
        c.id_citas,
        c.fecha_cita,
        c.fecha_creacion,
        c.motivo,
        c.observaciones,
        c.fk_id_medico,
        c.fk_id_paciente,
        c.fk_id_estado,
        c.fk_id_consultorio,
        e.nombre as estado_nombre,
        cons.nombre_sala,
        cons.ubicacion,
        pm.nombre as medico_nombre,
        pm.apellido as medico_apellido,
        pp.nombre as paciente_nombre,
        pp.apellido as paciente_apellido,
        esp.nombre as especialidad_nombre
      FROM tbl_citas c
      LEFT JOIN tbl_estado e ON c.fk_id_estado = e.id_estado
      LEFT JOIN tbl_consultorios cons ON c.fk_id_consultorio = cons.id_consultorio
      LEFT JOIN tbl_medicos m ON c.fk_id_medico = m.id_medico
      LEFT JOIN tbl_persona pm ON m.fk_id_persona = pm.id_persona
      LEFT JOIN tbl_especialidades esp ON m.fk_id_especialidad = esp.id_especialidad
      LEFT JOIN tbl_pacientes pac ON c.fk_id_paciente = pac.id_paciente
      LEFT JOIN tbl_persona pp ON pac.fk_id_persona = pp.id_persona
      WHERE c.id_citas = ?
    `,
      [insertId],
    )

    const row = (rows as any[])[0]

    console.log("[v0] Fecha recuperada de la base de datos:", row.fecha_cita)
    console.log("[v0] Tipo de dato recuperado:", typeof row.fecha_cita)
    console.log("[v0] =====FIN DEBUG TIMEZONE API=====")

    const nuevaCita: Cita = {
      id_citas: row.id_citas,
      fecha_cita: row.fecha_cita,
      fecha_creacion: row.fecha_creacion,
      motivo: row.motivo,
      observaciones: row.observaciones,
      fk_id_medico: row.fk_id_medico,
      fk_id_paciente: row.fk_id_paciente,
      fk_id_estado: row.fk_id_estado,
      fk_id_consultorio: row.fk_id_consultorio,
      estado: {
        id_estado: row.fk_id_estado,
        nombre: row.estado_nombre,
      },
      consultorio: {
        id_consultorio: row.fk_id_consultorio,
        nombre_sala: row.nombre_sala,
        ubicacion: row.ubicacion,
        activo: true,
      },
      medico: {
        id_medico: row.fk_id_medico,
        persona: {
          nombre: row.medico_nombre,
          apellido: row.medico_apellido,
        },
        especialidad: {
          nombre: row.especialidad_nombre,
        },
      },
      paciente: {
        id_paciente: row.fk_id_paciente,
        persona: {
          nombre: row.paciente_nombre,
          apellido: row.paciente_apellido,
        },
      },
    }

    console.log("[v0] Nueva cita creada en base de datos:", nuevaCita)

    return NextResponse.json({ cita: nuevaCita, message: "Cita creada exitosamente" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error al crear cita:", error)
    console.error("[v0] Error completo:", JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return NextResponse.json(
      {
        error: "Error al crear cita",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// PATCH - Actualizar estado de la cita
export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const { id_citas, fk_id_estado } = data

    if (!id_citas || !fk_id_estado) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const query = `
      UPDATE tbl_citas 
      SET fk_id_estado = ?
      WHERE id_citas = ?
    `

    await pool.query(query, [fk_id_estado, id_citas])

    return NextResponse.json({ message: "Cita actualizada exitosamente" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error al actualizar cita:", error)
    return NextResponse.json({ error: "Error al actualizar cita" }, { status: 500 })
  }
}
