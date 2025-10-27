"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { mockCitas } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"

export default function MedicoDashboardPage() {
  const { user } = useAuth()

  // Filtrar citas del médico actual
  const misCitas = mockCitas.filter((c) => c.fk_id_medico === user?.medico?.id_medico)
  const citasHoy = misCitas.filter((c) => {
    const hoy = new Date()
    return c.fecha_cita.toDateString() === hoy.toDateString()
  })
  const citasPendientes = misCitas.filter((c) => c.estado?.nombre === "Pendiente")
  const citasConfirmadas = misCitas.filter((c) => c.estado?.nombre === "Confirmada")

  // Próximas citas
  const proximasCitas = [...misCitas]
    .filter((c) => c.fecha_cita >= new Date())
    .sort((a, b) => a.fecha_cita.getTime() - b.fecha_cita.getTime())
    .slice(0, 5)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Bienvenido, Dr. {user?.persona.nombre} {user?.persona.apellido}
        </h1>
        <p className="text-muted-foreground">{user?.medico?.especialidad?.nombre}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Citas Hoy</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citasHoy.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Programadas para hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citasPendientes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Por confirmar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmadas</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citasConfirmadas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Listas para atender</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pacientes</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(misCitas.map((c) => c.fk_id_paciente)).size}</div>
            <p className="text-xs text-muted-foreground mt-1">Pacientes atendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Citas */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Citas</CardTitle>
          <CardDescription>Tus citas programadas más cercanas</CardDescription>
        </CardHeader>
        <CardContent>
          {proximasCitas.length > 0 ? (
            <div className="space-y-4">
              {proximasCitas.map((cita) => (
                <div key={cita.id_citas} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {cita.paciente?.persona?.nombre} {cita.paciente?.persona?.apellido}
                      </p>
                      <p className="text-sm text-muted-foreground">{cita.motivo || "Consulta general"}</p>
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
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tienes citas programadas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas */}
      {citasPendientes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Tienes {citasPendientes.length} cita{citasPendientes.length > 1 ? "s" : ""} pendiente
                  {citasPendientes.length > 1 ? "s" : ""} de confirmación
                </p>
                <p className="text-xs text-orange-700 mt-1">Revisa y confirma tus citas programadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
