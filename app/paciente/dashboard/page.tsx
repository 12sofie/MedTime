"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Stethoscope, FileText, Plus, AlertCircle } from "lucide-react"
import { mockEspecialidades } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState, useEffect } from "react"
import type { Cita } from "@/lib/types"

export default function PacienteDashboardPage() {
  const { user } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)

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
          throw new Error("Error al cargar las citas")
        }

        const data = await response.json()

        // Convert fecha_cita strings to Date objects
        const citasConFechas = data.citas.map((cita: any) => ({
          ...cita,
          fecha_cita: new Date(cita.fecha_cita),
          fecha_creacion: new Date(cita.fecha_creacion),
        }))

        setCitas(citasConFechas)
      } catch (err) {
        console.error("Error al cargar citas:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCitas()
  }, [user?.paciente?.id_paciente])

  const proximasCitas = [...citas]
    .filter((c) => c.fecha_cita >= new Date())
    .sort((a, b) => a.fecha_cita.getTime() - b.fecha_cita.getTime())
    .slice(0, 3)

  const citasPendientes = citas.filter((c) => c.estado?.nombre === "Pendiente")

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Bienvenido, {user?.persona.nombre} {user?.persona.apellido}
        </h1>
        <p className="text-muted-foreground">Gestiona tus citas médicas y consulta tu historial</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/paciente/nueva-cita">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Agendar Cita</CardTitle>
              <CardDescription>Programa una nueva consulta médica</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/paciente/citas">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Mis Citas</CardTitle>
              <CardDescription>Ver todas tus citas programadas</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/paciente/historial">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Historial</CardTitle>
              <CardDescription>Consulta tu historial médico</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/paciente/perfil">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Mi Perfil</CardTitle>
              <CardDescription>Actualiza tu información personal</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Alertas */}
      {citasPendientes.length > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Tienes {citasPendientes.length} cita{citasPendientes.length > 1 ? "s" : ""} pendiente
                  {citasPendientes.length > 1 ? "s" : ""} de confirmación
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  El médico confirmará tu cita próximamente. Te notificaremos cuando esté confirmada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximas Citas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Próximas Citas</CardTitle>
              <CardDescription>Tus citas médicas programadas</CardDescription>
            </div>
            <Link href="/paciente/citas">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Cargando citas...</p>
            </div>
          ) : proximasCitas.length > 0 ? (
            <div className="space-y-4">
              {proximasCitas.map((cita) => (
                <div key={cita.id_citas} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Dr. {cita.medico?.persona?.nombre} {cita.medico?.persona?.apellido}
                      </p>
                      <p className="text-sm text-muted-foreground">{cita.medico?.especialidad?.nombre}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cita.consultorio?.nombre_sala} - {cita.consultorio?.ubicacion}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {cita.fecha_cita.toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {cita.fecha_cita.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No tienes citas programadas</p>
              <Link href="/paciente/nueva-cita">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agendar Cita
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Especialidades Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Especialidades Disponibles</CardTitle>
          <CardDescription>Nuestros servicios médicos especializados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockEspecialidades.slice(0, 6).map((especialidad) => (
              <div key={especialidad.id_especialidad} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{especialidad.nombre}</p>
                  <p className="text-xs text-muted-foreground">{especialidad.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
