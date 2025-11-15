"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Clock, Edit, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from "react"

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

interface Horario {
  id_disponibilidad: number
  dia_semana: string
  hora_inicio: string
  hora_fin: string
}

export default function MedicoDisponibilidadPage() {
  const [disponibilidad, setDisponibilidad] = useState<Horario[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Horario | null>(null)
  const [formData, setFormData] = useState({
    dia_semana: "",
    hora_inicio: "",
    hora_fin: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    cargarDisponibilidad()
  }, [])

  const cargarDisponibilidad = async () => {
    try {
      const response = await fetch("/api/disponibilidad")
      if (response.ok) {
        const data = await response.json()
        setDisponibilidad(data)
      }
    } catch (error) {
      console.error("[v0] Error al cargar disponibilidad:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la disponibilidad",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const guardarHorario = async () => {
    if (!formData.dia_semana || !formData.hora_inicio || !formData.hora_fin) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editando ? `/api/disponibilidad/${editando.id_disponibilidad}` : "/api/disponibilidad"
      const method = editando ? "PUT" : "POST"

      console.log("[v0] Guardando horario...")
      console.log("[v0] URL:", url)
      console.log("[v0] Method:", method)
      console.log("[v0] Form Data:", formData)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      console.log("[v0] Response status:", response.status)
      const responseData = await response.json()
      console.log("[v0] Response data:", responseData)

      if (response.ok) {
        toast({
          title: "Éxito",
          description: editando ? "Horario actualizado correctamente" : "Horario agregado correctamente",
        })
        await cargarDisponibilidad()
        cerrarDialog()
      } else {
        throw new Error(responseData.error || "Error al guardar el horario")
      }
    } catch (error) {
      console.error("[v0] Error al guardar horario:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el horario",
        variant: "destructive",
      })
    }
  }

  const eliminarHorario = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este horario?")) return

    try {
      const response = await fetch(`/api/disponibilidad/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Horario eliminado correctamente",
        })
        cargarDisponibilidad()
      }
    } catch (error) {
      console.error("[v0] Error al eliminar horario:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el horario",
        variant: "destructive",
      })
    }
  }

  const abrirDialog = (dia?: string, horario?: Horario) => {
    if (horario) {
      setEditando(horario)
      const formatearHora = (hora: string) => {
        if (!hora) return ""
        // Si ya está en formato HH:MM, devolverlo tal cual
        if (hora.length === 5 && hora.includes(":")) return hora
        // Si está en formato HH:MM:SS, extraer solo HH:MM
        if (hora.length === 8 && hora.includes(":")) return hora.substring(0, 5)
        // Otros formatos, retornar tal cual
        return hora
      }
      setFormData({
        dia_semana: horario.dia_semana,
        hora_inicio: formatearHora(horario.hora_inicio),
        hora_fin: formatearHora(horario.hora_fin),
      })
    } else {
      setEditando(null)
      setFormData({
        dia_semana: dia || "",
        hora_inicio: "",
        hora_fin: "",
      })
    }
    setDialogOpen(true)
  }

  const cerrarDialog = () => {
    setDialogOpen(false)
    setEditando(null)
    setFormData({
      dia_semana: "",
      hora_inicio: "",
      hora_fin: "",
    })
  }

  const disponibilidadPorDia = diasSemana.map((dia) => ({
    dia,
    horarios: disponibilidad.filter((d) => d.dia_semana === dia),
  }))

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Disponibilidad</h1>
          <p className="text-muted-foreground">Configura tus horarios de atención</p>
        </div>
        <Button onClick={() => abrirDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Horario
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Horarios Configurados</p>
              <p className="text-xs text-blue-700 mt-1">
                Los pacientes podrán agendar citas solo en los horarios que configures aquí
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disponibilidad por Día */}
      <div className="grid gap-6">
        {disponibilidadPorDia.map(({ dia, horarios }) => (
          <Card key={dia}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{dia}</CardTitle>
                  <CardDescription>
                    {horarios.length > 0 ? `${horarios.length} horario(s) configurado(s)` : "Sin horarios configurados"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => abrirDialog(dia)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {horarios.length > 0 ? (
                <div className="space-y-3">
                  {horarios.map((horario) => (
                    <div
                      key={horario.id_disponibilidad}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {horario.hora_inicio} - {horario.hora_fin}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Duración: {(() => {
                              const [horaInicio, minInicio] = horario.hora_inicio.split(":").map(Number)
                              const [horaFin, minFin] = horario.hora_fin.split(":").map(Number)
                              const duracion = horaFin * 60 + minFin - (horaInicio * 60 + minInicio)
                              return `${Math.floor(duracion / 60)}h ${duracion % 60}m`
                            })()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Activo</Badge>
                        <Button variant="ghost" size="icon" onClick={() => abrirDialog(undefined, horario)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => eliminarHorario(horario.id_disponibilidad)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No hay horarios configurados para este día</p>
                  <Button variant="link" size="sm" className="mt-2" onClick={() => abrirDialog(dia)}>
                    Agregar horario
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Horario" : "Agregar Horario"}</DialogTitle>
            <DialogDescription>
              {editando ? "Modifica los datos del horario" : "Configura un nuevo horario de atención"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dia">Día de la semana</Label>
              <select
                id="dia"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.dia_semana}
                onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                disabled={editando !== null}
              >
                <option value="">Selecciona un día</option>
                {diasSemana.map((dia) => (
                  <option key={dia} value={dia}>
                    {dia}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Hora de inicio</Label>
              <Input
                id="hora_inicio"
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora_fin">Hora de fin</Label>
              <Input
                id="hora_fin"
                type="time"
                value={formData.hora_fin}
                onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cerrarDialog}>
              Cancelar
            </Button>
            <Button onClick={guardarHorario}>{editando ? "Actualizar" : "Agregar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
