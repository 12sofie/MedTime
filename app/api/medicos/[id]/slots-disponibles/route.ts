import pool from "@/lib/db"
import { NextResponse } from "next/server"

// GET: Obtener slots disponibles para un médico en una fecha específica
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha')
    
    console.log("[v0] API slots-disponibles - ID médico:", id, "Fecha:", fecha)
    
    if (!fecha) {
      return NextResponse.json({ error: "Fecha requerida" }, { status: 400 })
    }

    const medicoId = parseInt(id)
    if (isNaN(medicoId)) {
      return NextResponse.json({ error: "ID de médico inválido" }, { status: 400 })
    }

    const fechaObj = new Date(fecha + 'T12:00:00')
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const diaSemana = diasSemana[fechaObj.getDay()]
    
    console.log("[v0] Día de la semana calculado:", diaSemana, "para fecha:", fechaObj)

    // Obtener horarios disponibles del médico para ese día
    const [horarios] = await pool.query(
      `SELECT TIME_FORMAT(d.hora_inicio, '%H:%i') as hora_inicio, 
              TIME_FORMAT(d.hora_fin, '%H:%i') as hora_fin
       FROM tbl_disponibilidad d
       INNER JOIN tbl_medicos_x_disponibilidad md ON d.id_disponibilidad = md.fk_id_disponibilidad
       WHERE md.fk_id_medico = ? AND d.dia_semana = ?
       ORDER BY d.hora_inicio`,
      [medicoId, diaSemana]
    )
    
    console.log("[v0] Horarios encontrados en BD:", JSON.stringify(horarios))

    if (!Array.isArray(horarios) || horarios.length === 0) {
      console.log("[v0] No hay horarios configurados para", diaSemana)
      return NextResponse.json({ slots: [] })
    }

    // Generar todos los slots posibles de 30 minutos con mejor manejo de tipos
    const todosLosSlots: { hora: string, disponible: boolean }[] = []
    
    horarios.forEach((horario: any) => {
      const [horaInicioH, horaInicioM] = horario.hora_inicio.split(':').map((n: string) => parseInt(n))
      const [horaFinH, horaFinM] = horario.hora_fin.split(':').map((n: string) => parseInt(n))

      let currentH = horaInicioH
      let currentM = horaInicioM

      // Generar slots cada 30 minutos, pero NO incluir la hora de fin
      while (currentH < horaFinH || (currentH === horaFinH && currentM < horaFinM)) {
        const horaStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`
        todosLosSlots.push({ hora: horaStr, disponible: true })

        currentM += 30
        if (currentM >= 60) {
          currentM = 0
          currentH++
        }
      }
    })
    
    console.log("[v0] Total de slots generados:", todosLosSlots.length, "slots:", todosLosSlots.map(s => s.hora))

    // Obtener citas ya agendadas para este médico en esta fecha
    const [citasAgendadas] = await pool.query(
      `SELECT TIME_FORMAT(TIME(fecha_cita), '%H:%i') as hora_cita
       FROM tbl_citas
       WHERE fk_id_medico = ? 
       AND DATE(fecha_cita) = ?
       AND fk_id_estado IN (
         SELECT id_estado FROM tbl_estado WHERE nombre IN ('Pendiente', 'Confirmada', 'Programada')
       )`,
      [medicoId, fecha]
    )
    
    console.log("[v0] Citas agendadas encontradas:", JSON.stringify(citasAgendadas))

    const citasOcupadas = new Set(
      (citasAgendadas as any[]).map(cita => cita.hora_cita)
    )

    console.log("[v0] Slots ocupados:", Array.from(citasOcupadas))

    // Marcar slots como disponibles u ocupados
    const slotsConDisponibilidad = todosLosSlots.map(slot => ({
      hora: slot.hora,
      disponible: !citasOcupadas.has(slot.hora)
    }))
    
    console.log("[v0] Slots finales a retornar:", JSON.stringify(slotsConDisponibilidad))

    return NextResponse.json({ slots: slotsConDisponibilidad })
  } catch (error) {
    console.error("[v0] Error al obtener slots disponibles:", error)
    return NextResponse.json(
      { error: "Error al obtener slots disponibles", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
