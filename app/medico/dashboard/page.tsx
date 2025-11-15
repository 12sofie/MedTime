"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import type { Cita } from "@/lib/types"
import { AlertCircle, Calendar, CheckCircle, Clock, Users } from 'lucide-react'
import { useEffect, useState } from "react"

export default function MedicoDashboardPage() {
  const { user } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCitas = async () => {
      if (!user?.medico?.id_medico) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/citas?medico_id=${user.medico.id_medico}`)

        if (!response.ok) {
          throw new Error("Error al cargar las citas")
        }

        const data = await response.json()

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
    
    const interval = setInterval(fetchCitas, 30000)
    
    return () => clearInterval(interval)
  }, [user?.medico?.id_medico])

  const citasHoy = citas.filter((c) => {
    const hoy = new Date()
    return c.fecha_cita.toDateString() === hoy.toDateString()
  })
  const citasPendientes = citas.filter((c) => c.estado?.nombre === "Pendiente")
  const citasConfirmadas = citas.filter((c) => c.estado?.nombre === "Confirmada")
  const citasCanceladas = citas.filter((c) => c.estado?.nombre === "Cancelada")
  
  const totalPacientes = new Set(
    citas
      .filter(c => c.estado?.nombre !== "Cancelada")
      .map((c) => c.fk_id_paciente)
  ).size

  const proximasCitas = [...citas]
    .filter((c) => c.fecha_cita >= new Date())
    .sort((a, b) => a.fecha_cita.getTime() - b.fecha_cita.getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Bienvenido, Dr. {user?.persona.nombre} {user?.persona.apellido}
          </h1>
          <p className="text-muted-foreground">{user?.medico?.especialidad?.nombre}</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Cargando datos...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            <div className="text-2xl font-bold">{totalPacientes}</div>
            <p className="text-xs text-muted-foreground mt-1">Pacientes agendados</p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Citas */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Citas</CardTitle>
          <CardDescription>Tus citas programadas con estado actualizado</CardDescription>
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
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {cita.paciente?.persona?.nombre} {cita.paciente?.persona?.apellido}
                        </p>
                        {cita.estado?.nombre === "Cancelada" && cita.cancelado_por === "paciente" && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                            Cancelada por paciente
                          </Badge>
                        )}
                      </div>
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
