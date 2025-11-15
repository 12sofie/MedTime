"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import type { Cita } from "@/lib/types"
import { Calendar, Clock, FileText, MapPin, Phone, Stethoscope } from 'lucide-react'
import { useEffect, useState } from "react"

export default function HistorialPage() {
  const { user } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCitas = async () => {
      if (!user?.paciente?.id_paciente) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/citas?paciente_id=${user.paciente.id_paciente}`)

        if (!response.ok) {
          throw new Error("Error al cargar el historial")
        }

        const data = await response.json()

        const citasPasadas = data.citas
          .map((cita: any) => ({
            ...cita,
            fecha_cita: new Date(cita.fecha_cita),
            fecha_creacion: new Date(cita.fecha_creacion),
          }))
          .filter((cita: Cita) => cita.fecha_cita < new Date() || cita.estado?.nombre === "Cancelada")
          .sort((a: Cita, b: Cita) => b.fecha_cita.getTime() - a.fecha_cita.getTime())

        setCitas(citasPasadas)
      } catch (err) {
        console.error("Error al cargar historial:", err)
        setError("No se pudo cargar el historial médico")
      } finally {
        setLoading(false)
      }
    }

    fetchCitas()
  }, [user?.paciente?.id_paciente])

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando historial médico...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Historial Médico</h1>
        <p className="text-muted-foreground">Consulta tus citas médicas anteriores</p>
      </div>

      {citas.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No tienes citas en tu historial</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {citas.map((cita) => (
            <Card key={cita.id_citas} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Dr. {cita.medico?.persona?.nombre} {cita.medico?.persona?.apellido}
                      </CardTitle>
                      <CardDescription>{cita.medico?.especialidad?.nombre}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: `${cita.estado?.color}20`,
                        color: cita.estado?.color,
                        borderColor: cita.estado?.color,
                      }}
                    >
                      {cita.estado?.nombre}
                    </Badge>
                    {cita.estado?.nombre === "Cancelada" && cita.cancelado_por && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                        Cancelada por {cita.cancelado_por === "medico" ? "el médico" : "el paciente"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {cita.fecha_cita.toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{cita.fecha_cita.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {cita.consultorio?.nombre_sala}
                      {cita.consultorio?.ubicacion && ` - ${cita.consultorio.ubicacion}`}
                    </span>
                  </div>
                  {cita.medico?.persona?.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{cita.medico.persona.telefono}</span>
                    </div>
                  )}
                </div>

                {cita.medico?.descripcion && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-1">Acerca del médico:</p>
                    <p className="text-sm text-muted-foreground">{cita.medico.descripcion}</p>
                  </div>
                )}

                {cita.motivo && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-1">Motivo de la consulta:</p>
                    <p className="text-sm text-muted-foreground">{cita.motivo}</p>
                  </div>
                )}

                {cita.observaciones && (
                  <div className="pt-2">
                    <p className="text-sm font-medium mb-1">Observaciones:</p>
                    <p className="text-sm text-muted-foreground">{cita.observaciones}</p>
                  </div>
                )}

                {cita.estado?.nombre === "Completada" && (
                  <div className="pt-3 mt-3 border-t bg-green-50 -mx-6 -mb-6 px-6 py-3 rounded-b-lg">
                    <p className="text-sm text-green-800">
                      ✓ Consulta completada exitosamente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
