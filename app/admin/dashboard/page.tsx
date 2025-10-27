"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Stethoscope, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { mockCitas, mockMedicos, mockPacientes } from "@/lib/mock-data"

export default function AdminDashboardPage() {
  // Calcular estadísticas
  const totalCitas = mockCitas.length
  const citasPendientes = mockCitas.filter((c) => c.estado?.nombre === "Pendiente").length
  const citasConfirmadas = mockCitas.filter((c) => c.estado?.nombre === "Confirmada").length
  const citasCompletadas = mockCitas.filter((c) => c.estado?.nombre === "Completada").length
  const totalMedicos = mockMedicos.length
  const totalPacientes = mockPacientes.length

  // Citas recientes
  const citasRecientes = [...mockCitas].sort((a, b) => b.fecha_cita.getTime() - a.fecha_cita.getTime()).slice(0, 5)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema de citas médicas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Citas</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCitas}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+12%</span> vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Médicos Activos</CardTitle>
            <Stethoscope className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMedicos}</div>
            <p className="text-xs text-muted-foreground mt-1">En {mockMedicos.length} especialidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pacientes Registrados</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPacientes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+8%</span> este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Asistencia</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+2.1%</span> vs promedio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Citas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{citasPendientes}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{citasConfirmadas}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{citasCompletadas}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Citas Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Citas Recientes</CardTitle>
          <CardDescription>Últimas citas registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {citasRecientes.map((cita) => (
              <div key={cita.id_citas} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {cita.paciente?.persona?.nombre} {cita.paciente?.persona?.apellido}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dr. {cita.medico?.persona?.nombre} {cita.medico?.persona?.apellido} -{" "}
                      {cita.medico?.especialidad?.nombre}
                    </p>
                  </div>
                </div>
                <div className="text-right">
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
                <div>
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${cita.estado?.color}20`,
                      color: cita.estado?.color,
                    }}
                  >
                    {cita.estado?.nombre}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas y Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas del Sistema</CardTitle>
          <CardDescription>Notificaciones importantes que requieren atención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  {citasPendientes} citas pendientes de confirmación
                </p>
                <p className="text-xs text-orange-700 mt-1">Revisa y confirma las citas programadas</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Sistema funcionando correctamente</p>
                <p className="text-xs text-blue-700 mt-1">Todos los servicios operativos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
