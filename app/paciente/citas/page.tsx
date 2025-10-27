"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, FileText } from "lucide-react"
import { mockCitas } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"

export default function PacienteCitasPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"proximas" | "historial">("proximas")

  const misCitas = mockCitas.filter((c) => c.fk_id_paciente === user?.paciente?.id_paciente)

  const ahora = new Date()
  const proximasCitas = misCitas.filter((cita) => cita.fecha_cita >= ahora)
  const historialCitas = misCitas.filter((cita) => cita.fecha_cita < ahora)

  const citasAMostrar = activeTab === "proximas" ? proximasCitas : historialCitas

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-dark">Mis Citas</h1>
        <p className="text-muted-foreground mt-1">Gestiona tus citas médicas programadas</p>
      </div>

      <div className="flex gap-6 border-b border-border">
        <button
          onClick={() => setActiveTab("proximas")}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === "proximas" ? "text-primary-dark" : "text-muted-foreground hover:text-primary-dark"
          }`}
        >
          Próximas Citas ({proximasCitas.length})
          {activeTab === "proximas" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab("historial")}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === "historial" ? "text-primary-dark" : "text-muted-foreground hover:text-primary-dark"
          }`}
        >
          Historial ({historialCitas.length})
          {activeTab === "historial" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>

      <div className="space-y-4">
        {citasAMostrar.length > 0 ? (
          citasAMostrar.map((cita) => (
            <Card key={cita.id_citas} className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icono de reloj */}
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>

                  {/* Contenido principal */}
                  <div className="flex-1 space-y-4">
                    {/* Header con nombre del médico y badge de estado */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-primary-dark">
                          Dr. {cita.medico?.persona?.nombre} {cita.medico?.persona?.apellido}
                        </h3>
                        <p className="text-muted-foreground">{cita.medico?.especialidad?.nombre}</p>
                      </div>
                      <Badge className="bg-primary text-white hover:bg-primary/90">{cita.estado?.nombre}</Badge>
                    </div>

                    {/* Grid de información de la cita */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                      {/* Fecha */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-primary-dark">
                          {cita.fecha_cita.toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Hora */}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-primary-dark">
                          {cita.fecha_cita.toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Consultorio */}
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-primary-dark">{cita.consultorio?.nombre_sala}</span>
                      </div>

                      {/* Motivo */}
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-primary-dark">{cita.motivo || "Consulta general"}</span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/5 bg-transparent"
                      >
                        Ver detalles
                      </Button>
                      {activeTab === "proximas" && (
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50 bg-transparent"
                        >
                          Cancelar cita
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border border-border">
            <CardContent className="p-12 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {activeTab === "proximas" ? "No tienes citas próximas programadas" : "No tienes citas en el historial"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
