"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle, Calendar, CheckCircle, Clock, Stethoscope } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"

interface Medico {
  id_medico: number
  fk_id_consultorio: number | null
  descripcion: string
  persona: {
    nombre: string
    apellido: string
  }
  especialidad: {
    nombre: string
  }
  consultorio?: {
    id_consultorio: number
    nombre_sala: string
    ubicacion: string
  }
}

interface TimeSlot {
  hora: string
  disponible: boolean
}

export default function NuevaCitaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [horariosDisponibles, setHorariosDisponibles] = useState<any[]>([])
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  
  const [formData, setFormData] = useState({
    fk_id_medico: "",
    fk_id_consultorio: "",
    fecha_cita: "",
    hora_cita: "",
    motivo: "",
    observaciones: "",
  })

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const response = await fetch("/api/medicos")
        if (!response.ok) throw new Error("Error al cargar médicos")
        const data = await response.json()
        setMedicos(Array.isArray(data) ? data : data.medicos || [])
      } catch (err) {
        console.error("[v0] Error al cargar médicos:", err)
        setError("No se pudieron cargar los médicos disponibles")
      } finally {
        setLoadingData(false)
      }
    }
    fetchMedicos()
  }, [])

  useEffect(() => {
    if (formData.fk_id_medico) {
      const fetchHorariosDisponibles = async () => {
        setLoadingHorarios(true)
        try {
          const response = await fetch(`/api/medicos/${formData.fk_id_medico}/horarios-disponibles`)
          if (response.ok) {
            const data = await response.json()
            setHorariosDisponibles(data.horarios || [])
          } else {
            setHorariosDisponibles([])
          }
        } catch (error) {
          console.error("[v0] Error al cargar horarios disponibles:", error)
          setHorariosDisponibles([])
        } finally {
          setLoadingHorarios(false)
        }
      }

      fetchHorariosDisponibles()
    } else {
      setHorariosDisponibles([])
    }
  }, [formData.fk_id_medico])

  useEffect(() => {
    if (formData.fecha_cita && formData.fk_id_medico) {
      const fetchSlots = async () => {
        setLoadingSlots(true)
        setTimeSlots([])
        setFormData(prev => ({ ...prev, hora_cita: "" }))
        
        try {
          console.log("[v0] Obteniendo slots para médico:", formData.fk_id_medico, "fecha:", formData.fecha_cita)
          const response = await fetch(
            `/api/medicos/${formData.fk_id_medico}/slots-disponibles?fecha=${formData.fecha_cita}`
          )
          if (response.ok) {
            const data = await response.json()
            console.log("[v0] Slots recibidos:", data.slots)
            setTimeSlots(data.slots || [])
          } else {
            console.error("[v0] Error en respuesta de slots:", response.status)
            setTimeSlots([])
          }
        } catch (error) {
          console.error("[v0] Error al cargar slots:", error)
          setTimeSlots([])
        } finally {
          setLoadingSlots(false)
        }
      }

      fetchSlots()
    } else {
      setTimeSlots([])
      setFormData(prev => ({ ...prev, hora_cita: "" }))
    }
  }, [formData.fecha_cita, formData.fk_id_medico, horariosDisponibles])

  const handleMedicoChange = (medicoId: string) => {
    const medico = medicos.find((m) => m.id_medico === Number.parseInt(medicoId))
    
    setFormData((prev) => ({
      ...prev,
      fk_id_medico: medicoId,
      fk_id_consultorio: medico?.fk_id_consultorio ? medico.fk_id_consultorio.toString() : "",
      fecha_cita: "",
      hora_cita: "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.fk_id_medico) {
      setError("Por favor selecciona un médico")
      setLoading(false)
      return
    }

    if (!formData.fecha_cita) {
      setError("Por favor selecciona una fecha")
      setLoading(false)
      return
    }

    if (!formData.hora_cita) {
      setError("Por favor selecciona una hora")
      setLoading(false)
      return
    }

    if (!formData.fk_id_consultorio) {
      setError("Por favor selecciona un consultorio")
      setLoading(false)
      return
    }

    if (!formData.motivo.trim()) {
      setError("Por favor ingresa el motivo de la consulta")
      setLoading(false)
      return
    }

    if (!user?.paciente?.id_paciente) {
      setError("No se pudo identificar al paciente. Por favor inicia sesión nuevamente.")
      setLoading(false)
      return
    }

    try {
      const fechaHora = new Date(`${formData.fecha_cita}T${formData.hora_cita}`)

      const payload = {
        ...formData,
        fecha_cita: fechaHora.toISOString(),
        fk_id_medico: Number.parseInt(formData.fk_id_medico),
        fk_id_paciente: user?.paciente?.id_paciente,
        fk_id_consultorio: Number.parseInt(formData.fk_id_consultorio),
      }

      const response = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Error al crear la cita")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/paciente/citas")
      }, 2000)
    } catch (err) {
      console.error("[v0] Error en handleSubmit:", err)
      setError(err instanceof Error ? err.message : "Error al crear la cita")
      setLoading(false)
    }
  }

  const medicoSeleccionado = medicos.find((m) => m.id_medico === Number.parseInt(formData.fk_id_medico))

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agendar Nueva Cita</h1>
        <p className="text-muted-foreground">Completa el formulario para programar tu consulta médica</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Cita</CardTitle>
              <CardDescription>Selecciona el médico, fecha y hora de tu consulta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 text-green-900 border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Cita creada exitosamente. Redirigiendo...</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="medico">Médico y Especialidad</Label>
                  <Select
                    value={formData.fk_id_medico}
                    onValueChange={handleMedicoChange}
                    disabled={loadingData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingData ? "Cargando médicos..." : "Seleccionar médico"} />
                    </SelectTrigger>
                    <SelectContent>
                      {medicos.map((medico) => (
                        <SelectItem key={medico.id_medico} value={medico.id_medico.toString()}>
                          Dr. {medico.persona?.nombre} {medico.persona?.apellido} - {medico.especialidad?.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.fk_id_medico && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">Horarios disponibles del médico:</p>
                    {loadingHorarios ? (
                      <p className="text-sm text-blue-700">Cargando horarios...</p>
                    ) : horariosDisponibles.length > 0 ? (
                      <div className="space-y-1">
                        {horariosDisponibles.map((h, idx) => (
                          <p key={idx} className="text-sm text-blue-700">
                            {h.dia_semana}: {h.hora_inicio.slice(0, 5)} - {h.hora_fin.slice(0, 5)}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-yellow-700">Este médico no tiene horarios configurados.</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha de la Cita</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha_cita}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fecha_cita: e.target.value, hora_cita: "" }))}
                      className="pl-10"
                      min={new Date().toISOString().split("T")[0]}
                      disabled={!formData.fk_id_medico || horariosDisponibles.length === 0}
                    />
                  </div>
                </div>

                {formData.fecha_cita && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Selecciona el Horario (Cada cita dura 30 minutos)</Label>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Clock className="w-6 h-6 animate-spin mr-2" />
                        <span>Cargando horarios disponibles...</span>
                      </div>
                    ) : timeSlots.length > 0 ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                          {timeSlots.map((slot) => (
                            <Button
                              key={slot.hora}
                              type="button"
                              variant={formData.hora_cita === slot.hora ? "default" : "outline"}
                              disabled={!slot.disponible}
                              onClick={() => {
                                console.log("[v0] Slot seleccionado:", slot.hora)
                                setFormData((prev) => ({ ...prev, hora_cita: slot.hora }))
                              }}
                              className={`h-14 text-base font-medium transition-all ${
                                !slot.disponible 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100 opacity-50' 
                                  : formData.hora_cita === slot.hora
                                  ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md ring-2 ring-teal-300'
                                  : 'bg-white hover:bg-teal-50 hover:border-teal-500 border-2'
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                <Clock className={`w-4 h-4 mb-1 ${formData.hora_cita === slot.hora ? 'text-white' : 'text-teal-600'}`} />
                                <span>{slot.hora}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                        <div className="flex items-center gap-6 pt-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white border-2 rounded" />
                            <span className="text-muted-foreground">Disponible</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-teal-600 rounded" />
                            <span className="text-muted-foreground">Seleccionado</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-100 border-2 rounded opacity-50" />
                            <span className="text-muted-foreground">Ocupado</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-gray-50">
                        <Clock className="w-16 h-16 mx-auto mb-3 opacity-30" />
                        <p className="text-base font-medium">No hay horarios disponibles para esta fecha</p>
                        <p className="text-sm mt-2">El médico no tiene disponibilidad este día. Intenta seleccionar otro día.</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="consultorio">Consultorio</Label>
                  {medicoSeleccionado?.consultorio ? (
                    <div className="px-3 py-2 border rounded-md bg-muted">
                      <p className="text-sm">
                        {medicoSeleccionado.consultorio.nombre_sala} - {medicoSeleccionado.consultorio.ubicacion}
                      </p>
                    </div>
                  ) : (
                    <div className="px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                      <p className="text-sm">Selecciona un médico primero</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo de la Consulta</Label>
                  <Input
                    id="motivo"
                    placeholder="Ej: Consulta general, dolor, control, etc."
                    value={formData.motivo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, motivo: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones Adicionales (Opcional)</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Describe tus síntomas o información adicional relevante..."
                    value={formData.observaciones}
                    onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 bg-transparent"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || success || horariosDisponibles.length === 0} 
                    className="flex-1"
                  >
                    {loading ? "Agendando..." : success ? "Cita Agendada" : "Agendar Cita"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {medicoSeleccionado ? (
            <Card>
              <CardHeader>
                <CardTitle>Información del Médico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      Dr. {medicoSeleccionado.persona?.nombre} {medicoSeleccionado.persona?.apellido}
                    </p>
                    <p className="text-sm text-muted-foreground">{medicoSeleccionado.especialidad?.nombre}</p>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm text-muted-foreground">Descripción:</p>
                  <p className="text-sm">{medicoSeleccionado.descripcion}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Selecciona un médico para ver su información</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <p className="font-medium text-blue-900">Información Importante:</p>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Tu cita será confirmada por el médico</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Recibirás una notificación cuando sea confirmada</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Llega 10 minutos antes de tu cita</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Trae tu documento de identidad</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
