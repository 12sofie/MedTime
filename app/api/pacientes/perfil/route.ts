import pool from '@/lib/db'
import { NextResponse } from 'next/server'

// GET - Obtener datos del perfil del paciente
export async function GET() {
  try {
    const idPaciente = 1

    console.log('[v0] Obteniendo perfil del paciente:', idPaciente)

    const [rows] = await pool.query(
      `SELECT 
        p.id_paciente,
        per.dni,
        per.telefono,
        per.correo,
        p.fecha_registro,
        per.nombre,
        per.apellido,
        u.email as email
      FROM tbl_pacientes p
      INNER JOIN tbl_persona per ON p.fk_id_persona = per.id_persona
      INNER JOIN tbl_usuarios u ON p.fk_id_usuario = u.id_usuario
      WHERE p.id_paciente = ?`,
      [idPaciente]
    )

    const paciente = (rows as any[])[0]

    if (!paciente) {
      console.log('[v0] Paciente no encontrado para ID:', idPaciente)
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    console.log('[v0] Perfil encontrado:', paciente)
    return NextResponse.json(paciente)
  } catch (error) {
    console.error('[v0] Error al obtener perfil:', error)
    return NextResponse.json(
      { error: 'Error al obtener perfil del paciente' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar datos del perfil del paciente
export async function PUT(request: Request) {
  try {
    const idPaciente = 1
    const body = await request.json()
    const { nombre, apellido, dni, telefono, correo } = body

    console.log('[v0] Actualizando perfil del paciente:', idPaciente, body)

    // Validaciones
    if (!nombre || !apellido || !dni) {
      return NextResponse.json(
        { error: 'Nombre, apellido y DNI son obligatorios' },
        { status: 400 }
      )
    }

    // Obtener el id_persona del paciente
    const [pacienteData] = await pool.query(
      'SELECT fk_id_persona FROM tbl_pacientes WHERE id_paciente = ?',
      [idPaciente]
    )

    const paciente = (pacienteData as any[])[0]
    if (!paciente) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    const idPersona = paciente.fk_id_persona

    await pool.query(
      `UPDATE tbl_persona 
       SET nombre = ?, apellido = ?, dni = ?, telefono = ?, correo = ?
       WHERE id_persona = ?`,
      [nombre, apellido, dni, telefono, correo, idPersona]
    )

    console.log('[v0] Perfil actualizado correctamente para paciente:', idPaciente)

    // Devolver los datos actualizados
    const [updatedRows] = await pool.query(
      `SELECT 
        p.id_paciente,
        per.dni,
        per.telefono,
        per.correo,
        p.fecha_registro,
        per.nombre,
        per.apellido,
        u.email as email
      FROM tbl_pacientes p
      INNER JOIN tbl_persona per ON p.fk_id_persona = per.id_persona
      INNER JOIN tbl_usuarios u ON p.fk_id_usuario = u.id_usuario
      WHERE p.id_paciente = ?`,
      [idPaciente]
    )

    const updatedPaciente = (updatedRows as any[])[0]

    return NextResponse.json(updatedPaciente)
  } catch (error) {
    console.error('[v0] Error al actualizar perfil:', error)
    return NextResponse.json(
      { error: 'Error al actualizar perfil del paciente' },
      { status: 500 }
    )
  }
}
