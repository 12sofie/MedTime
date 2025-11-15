import pool from "@/lib/db"
import type { Cita } from "@/lib/types"
import { NextResponse } from "next/server"

// GET - Obtener una cita específica
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = Number.parseInt(idString)

    const [rows] = await pool.query(
      `SELECT c.id_citas, c.fecha_cita, c.fecha_creacion, c.motivo, c.observaciones, 
              c.fk_id_medico, c.fk_id_paciente, c.fk_id_estado, c.fk_id_consultorio, c.cancelado_por,
              e.nombre as estado_nombre, e.color as estado_color,
              cons.nombre_sala, cons.ubicacion,
              pm.nombre as medico_nombre, pm.apellido as medico_apellido,
              pp.nombre as paciente_nombre, pp.apellido as paciente_apellido,
              esp.nombre as especialidad_nombre
       FROM tbl_citas c
       LEFT JOIN tbl_estado e ON c.fk_id_estado = e.id_estado
       LEFT JOIN tbl_consultorios cons ON c.fk_id_consultorio = cons.id_consultorio
       LEFT JOIN tbl_medicos m ON c.fk_id_medico = m.id_medico
       LEFT JOIN tbl_persona pm ON m.fk_id_persona = pm.id_persona
       LEFT JOIN tbl_especialidades esp ON m.fk_id_especialidad = esp.id_especialidad
       LEFT JOIN tbl_pacientes pac ON c.fk_id_paciente = pac.id_paciente
       LEFT JOIN tbl_persona pp ON pac.fk_id_persona = pp.id_persona
       WHERE c.id_citas = ?`,
      [id]
    )

    if (!rows || (rows as any[]).length === 0) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    const row = (rows as any[])[0]
    const cita: Cita = {
      id_citas: row.id_citas,
      fecha_cita: row.fecha_cita,
      fecha_creacion: row.fecha_creacion,
      motivo: row.motivo,
      observaciones: row.observaciones,
      fk_id_medico: row.fk_id_medico,
      fk_id_paciente: row.fk_id_paciente,
      fk_id_estado: row.fk_id_estado,
      fk_id_consultorio: row.fk_id_consultorio,
      cancelado_por: row.cancelado_por,
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
    }

    return NextResponse.json({ cita }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error al obtener cita:", error)
    return NextResponse.json({ error: "Error al obtener cita" }, { status: 500 })
  }
}

// PUT - Actualizar una cita
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = Number.parseInt(idString)
    const data = await request.json()

    console.log("[v0] Actualizando cita:", id, data)

    // Construir query dinámicamente basado en los campos proporcionados
    const updates: string[] = []
    const values: any[] = []

    if (data.fecha_cita) {
      updates.push("fecha_cita = ?")
      values.push(new Date(data.fecha_cita))
    }
    if (data.motivo !== undefined) {
      updates.push("motivo = ?")
      values.push(data.motivo)
    }
    if (data.observaciones !== undefined) {
      updates.push("observaciones = ?")
      values.push(data.observaciones)
    }
    if (data.fk_id_medico) {
      updates.push("fk_id_medico = ?")
      values.push(data.fk_id_medico)
    }
    if (data.fk_id_estado) {
      updates.push("fk_id_estado = ?")
      values.push(data.fk_id_estado)
    }
    if (data.fk_id_consultorio) {
      updates.push("fk_id_consultorio = ?")
      values.push(data.fk_id_consultorio)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    values.push(id)
    const query = `UPDATE tbl_citas SET ${updates.join(", ")} WHERE id_citas = ?`

    await pool.query(query, values)

    // Obtener la cita actualizada
    const [rows] = await pool.query(
      `SELECT c.id_citas, c.fecha_cita, c.fecha_creacion, c.motivo, c.observaciones, 
              c.fk_id_medico, c.fk_id_paciente, c.fk_id_estado, c.fk_id_consultorio, c.cancelado_por,
              e.nombre as estado_nombre, e.color as estado_color,
              cons.nombre_sala, cons.ubicacion
       FROM tbl_citas c
       LEFT JOIN tbl_estado e ON c.fk_id_estado = e.id_estado
       LEFT JOIN tbl_consultorios cons ON c.fk_id_consultorio = cons.id_consultorio
       WHERE c.id_citas = ?`,
      [id]
    )

    const row = (rows as any[])[0]
    const citaActualizada = {
      id_citas: row.id_citas,
      fecha_cita: row.fecha_cita,
      fecha_creacion: row.fecha_creacion,
      motivo: row.motivo,
      observaciones: row.observaciones,
      fk_id_medico: row.fk_id_medico,
      fk_id_paciente: row.fk_id_paciente,
      fk_id_estado: row.fk_id_estado,
      fk_id_consultorio: row.fk_id_consultorio,
      cancelado_por: row.cancelado_por,
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
    }

    console.log("[v0] Cita actualizada:", citaActualizada)

    return NextResponse.json({ cita: citaActualizada, message: "Cita actualizada exitosamente" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error al actualizar cita:", error)
    return NextResponse.json({ error: "Error al actualizar cita" }, { status: 500 })
  }
}

// DELETE - Cancelar una cita
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = Number.parseInt(idString)
    
    const { searchParams } = new URL(request.url)
    const canceladoPor = searchParams.get("cancelado_por")

    console.log("[v0] ===== INICIO CANCELACIÓN =====")
    console.log("[v0] Cancelando cita ID:", id)
    console.log("[v0] Cancelado por:", canceladoPor)

    const [existingRows] = await pool.query(
      "SELECT id_citas, fk_id_estado FROM tbl_citas WHERE id_citas = ?",
      [id]
    )

    console.log("[v0] Cita encontrada:", existingRows)

    if (!existingRows || (existingRows as any[]).length === 0) {
      console.log("[v0] ERROR: Cita no encontrada en BD")
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    }

    const citaExistente = (existingRows as any[])[0]
    console.log("[v0] Estado actual de la cita:", citaExistente.fk_id_estado)

    const [updateResult] = await pool.query(
      `UPDATE tbl_citas 
       SET fk_id_estado = 5, cancelado_por = ?
       WHERE id_citas = ?`,
      [canceladoPor || null, id]
    )

    console.log("[v0] Resultado del UPDATE:", updateResult)
    console.log("[v0] Filas afectadas:", (updateResult as any).affectedRows)

    const [verifyRows] = await pool.query(
      "SELECT fk_id_estado, cancelado_por FROM tbl_citas WHERE id_citas = ?",
      [id]
    )
    console.log("[v0] Estado después del UPDATE:", verifyRows)

    const [rows] = await pool.query(
      `SELECT c.id_citas, c.fecha_cita, c.fecha_creacion, c.motivo, c.observaciones, 
              c.fk_id_medico, c.fk_id_paciente, c.fk_id_estado, c.fk_id_consultorio, c.cancelado_por,
              e.nombre as estado_nombre, e.color as estado_color,
              cons.nombre_sala, cons.ubicacion,
              pm.nombre as medico_nombre, pm.apellido as medico_apellido,
              pp.nombre as paciente_nombre, pp.apellido as paciente_apellido,
              esp.nombre as especialidad_nombre
       FROM tbl_citas c
       LEFT JOIN tbl_estado e ON c.fk_id_estado = e.id_estado
       LEFT JOIN tbl_consultorios cons ON c.fk_id_consultorio = cons.id_consultorio
       LEFT JOIN tbl_medicos m ON c.fk_id_medico = m.id_medico
       LEFT JOIN tbl_persona pm ON m.fk_id_persona = pm.id_persona
       LEFT JOIN tbl_especialidades esp ON m.fk_id_especialidad = esp.id_especialidad
       LEFT JOIN tbl_pacientes pac ON c.fk_id_paciente = pac.id_paciente
       LEFT JOIN tbl_persona pp ON pac.fk_id_persona = pp.id_persona
       WHERE c.id_citas = ?`,
      [id]
    )

    console.log("[v0] Cita completa después de cancelar:", rows)

    const row = (rows as any[])[0]
    const citaCancelada: Cita = {
      id_citas: row.id_citas,
      fecha_cita: row.fecha_cita,
      fecha_creacion: row.fecha_creacion,
      motivo: row.motivo,
      observaciones: row.observaciones,
      fk_id_medico: row.fk_id_medico,
      fk_id_paciente: row.fk_id_paciente,
      fk_id_estado: row.fk_id_estado,
      fk_id_consultorio: row.fk_id_consultorio,
      cancelado_por: row.cancelado_por,
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
    }

    console.log("[v0] Cita cancelada a retornar:", citaCancelada)
    console.log("[v0] ===== FIN CANCELACIÓN EXITOSA =====")

    return NextResponse.json({ 
      message: "Cita cancelada exitosamente",
      cita: citaCancelada 
    }, { status: 200 })
  } catch (error) {
    console.error("[v0] ===== ERROR EN CANCELACIÓN =====")
    console.error("[v0] Error completo:", error)
    console.error("[v0] Stack trace:", (error as Error).stack)
    return NextResponse.json({ error: "Error al cancelar cita" }, { status: 500 })
  }
}
