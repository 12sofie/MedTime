"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Plus, Edit, Trash2, CheckCircle } from "lucide-react"
import { mockDisponibilidad } from "@/lib/mock-data"

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export default function MedicoDisponibilidadPage() {
  const [disponibilidad] = useState(mockDisponibilidad)

  // Agrupar disponibilidad por día
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
        <Button>
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
                <Button variant="outline" size="sm">
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
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
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
                  <Button variant="link" size="sm" className="mt-2">
                    Agregar horario
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
