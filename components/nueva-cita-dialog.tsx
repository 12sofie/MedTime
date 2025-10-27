"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { mockMedicos, mockConsultorios, mockPacientes } from "@/lib/mock-data"

interface NuevaCitaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacienteId?: number
}

export function NuevaCitaDialog({ open, onOpenChange, pacienteId }: NuevaCitaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    fk_id_medico: "",
    fk_id_paciente: pacienteId?.toString() || "",
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

    try {
      // Combinar fecha y hora
      const fechaHora = new Date(`${formData.fecha_cita}T${formData.hora_cita}`)

      const response = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fecha_cita: fechaHora.toISOString(),
          fk_id_medico: Number.parseInt(formData.fk_id_medico),
          fk_id_paciente: Number.parseInt(formData.fk_id_paciente),
          fk_id_consultorio: Number.parseInt(formData.fk_id_consultorio),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al crear la cita")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setFormData({
          fk_id_medico: "",
          fk_id_paciente: pacienteId?.toString() || "",
          fk_id_consultorio: "",
          fecha_cita: "",
          hora_cita: "",
          motivo: "",
          observaciones: "",
        })
      }, 2000)
    } catch (err) {
      console.error("[v0] Error al crear cita:", err)
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Cita Médica</DialogTitle>
          <DialogDescription>Completa los datos para agendar una nueva cita</DialogDescription>
        </DialogHeader>

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
              <AlertDescription>Cita creada exitosamente</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paciente">Paciente</Label>
              <Select
                value={formData.fk_id_paciente}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, fk_id_paciente: value }))}
                disabled={!!pacienteId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {mockPacientes.map((paciente) => (
                    <SelectItem key={paciente.id_paciente} value={paciente.id_paciente.toString()}>
                      {paciente.persona?.nombre} {paciente.persona?.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medico">Médico</Label>
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
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha_cita}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fecha_cita: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Hora</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora_cita}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hora_cita: e.target.value }))}
                  className="pl-10"
                  required
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
              placeholder="Ej: Consulta general, control, etc."
              value={formData.motivo}
              onChange={(e) => setFormData((prev) => ({ ...prev, motivo: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
            <Textarea
              id="observaciones"
              placeholder="Información adicional sobre la cita..."
              value={formData.observaciones}
              onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || success} className="flex-1">
              {loading ? "Creando..." : success ? "Cita Creada" : "Crear Cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
