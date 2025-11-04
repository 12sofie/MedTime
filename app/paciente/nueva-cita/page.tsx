"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, AlertCircle, CheckCircle, Stethoscope } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { mockMedicos, mockConsultorios } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function NuevaCitaPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    fk_id_medico: "",
    fk_id_consultorio: "",
    fecha_cita: "",
    hora_cita: "",
    motivo: "",
    observaciones: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] Form data before validation:", formData)
    console.log("[v0] User data:", user)
    console.log("[v0] ID del paciente:", user?.paciente?.id_paciente)

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

      console.log("[v0] Sending payload to API:", JSON.stringify(payload, null, 2))

      const response = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log("[v0] API response:", data)

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

  const medicoSeleccionado = mockMedicos.find((m) => m.id_medico === Number.parseInt(formData.fk_id_medico))

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Agendar Nueva Cita</h1>
        <p className="text-muted-foreground">Completa el formulario para programar tu consulta médica</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Formulario */}
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
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, fk_id_medico: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar médico" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMedicos.map((medico) => (
                        <SelectItem key={medico.id_medico} value={medico.id_medico.toString()}>
                          Dr. {medico.persona?.nombre} {medico.persona?.apellido} - {medico.especialidad?.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha de la Cita</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fecha"
                        type="date"
                        value={formData.fecha_cita}
                        onChange={(e) => setFormData((prev) => ({ ...prev, fecha_cita: e.target.value }))}
                        className="pl-10"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora de la Cita</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="hora"
                        type="time"
                        value={formData.hora_cita}
                        onChange={(e) => setFormData((prev) => ({ ...prev, hora_cita: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultorio">Consultorio</Label>
                  <Select
                    value={formData.fk_id_consultorio}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, fk_id_consultorio: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar consultorio" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockConsultorios.map((consultorio) => (
                        <SelectItem key={consultorio.id_consultorio} value={consultorio.id_consultorio.toString()}>
                          {consultorio.nombre_sala} - {consultorio.ubicacion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Button type="submit" disabled={loading || success} className="flex-1">
                    {loading ? "Agendando..." : success ? "Cita Agendada" : "Agendar Cita"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Información del Médico */}
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
