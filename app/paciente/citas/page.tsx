"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { Cita } from "@/lib/types"
import { Calendar, Clock, FileText, MapPin, Stethoscope, User } from 'lucide-react'
import { useEffect, useState } from "react"

export default function PacienteCitasPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"proximas" | "historial">("proximas")
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [citaToCancel, setCitaToCancel] = useState<number | null>(null)
  const [canceling, setCanceling] = useState(false)
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)

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

        const citasConFechas = data.citas.map((cita: any) => ({
          ...cita,
          fecha_cita: new Date(cita.fecha_cita),
          fecha_creacion: new Date(cita.fecha_creacion),
        }))

        setCitas(citasConFechas)
        setError(null)
      } catch (err) {
        console.error("Error al cargar citas:", err)
        setError("No se pudieron cargar las citas")
      } finally {
        setLoading(false)
      }
    }

    fetchCitas()
    
    const interval = setInterval(fetchCitas, 30000)
    
    return () => clearInterval(interval)
  }, [user?.paciente?.id_paciente])

  const handleCancelarCita = async () => {
    if (!citaToCancel) return

    try {
      setCanceling(true)
      console.log("[v0] Cancelando cita:", citaToCancel)
      
      const response = await fetch(`/api/citas/${citaToCancel}?cancelado_por=paciente`, {
        method: "DELETE",
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)
      
      const responseData = await response.json()
      console.log("[v0] Response data:", responseData)

      if (!response.ok) {
        throw new Error(responseData.error || "Error al cancelar la cita")
      }

      setCitas((prevCitas) =>
        prevCitas.map((cita) =>
          cita.id_citas === citaToCancel
            ? {
                ...cita,
                fk_id_estado: 5,
                cancelado_por: "paciente" as const,
                estado: { ...cita.estado, id_estado: 5, nombre: "Cancelada", color: "#ef4444" },
              }
            : cita,
        ),
      )

      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada exitosamente.",
      })

      setCitaToCancel(null)
    } catch (err) {
      console.error("[v0] Error al cancelar cita:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo cancelar la cita. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setCanceling(false)
    }
  }

  const ahora = new Date()
  const proximasCitas = citas.filter((cita) => cita.fecha_cita >= ahora && cita.estado?.nombre !== "Cancelada")
  const historialCitas = citas.filter((cita) => cita.fecha_cita < ahora || cita.estado?.nombre === "Cancelada")

  const citasAMostrar = activeTab === "proximas" ? proximasCitas : historialCitas

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Mis Citas</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus citas médicas programadas</p>
        </div>
        <Card className="border border-border">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Cargando citas...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Mis Citas</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus citas médicas programadas</p>
        </div>
        <Card className="border border-border">
          <CardContent className="p-12 text-center">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-primary-dark">
                          Dr. {cita.medico?.persona?.nombre} {cita.medico?.persona?.apellido}
                        </h3>
                        <p className="text-muted-foreground">{cita.medico?.especialidad?.nombre}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
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
                        {cita.estado?.nombre === "Cancelada" && cita.cancelado_por === "medico" && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                            Cancelada por médico
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
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

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-primary-dark">
                          {cita.fecha_cita.toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-primary-dark">{cita.consultorio?.nombre_sala}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-primary-dark">{cita.motivo || "Consulta general"}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/5 bg-transparent"
                        onClick={() => setSelectedCita(cita)}
                      >
                        Ver detalles
                      </Button>
                      {activeTab === "proximas" && cita.estado?.nombre !== "Cancelada" && (
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50 bg-transparent"
                          onClick={() => setCitaToCancel(cita.id_citas)}
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

      <Dialog open={selectedCita !== null} onOpenChange={() => setSelectedCita(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
            <DialogDescription>Información completa de tu cita médica</DialogDescription>
          </DialogHeader>
          
          {selectedCita && (
            <div className="space-y-4">
              <div className="flex justify-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-base px-4 py-1"
                  style={{
                    backgroundColor: `${selectedCita.estado?.color}20`,
                    color: selectedCita.estado?.color,
                    borderColor: selectedCita.estado?.color,
                  }}
                >
                  {selectedCita.estado?.nombre}
                </Badge>
                {selectedCita.estado?.nombre === "Cancelada" && selectedCita.cancelado_por === "medico" && (
                  <Badge variant="outline" className="text-base px-4 py-1 bg-red-50 text-red-700 border-red-300">
                    Cancelada por el médico
                  </Badge>
                )}
              </div>

              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Médico</p>
                      <p className="font-medium text-lg">
                        Dr. {selectedCita.medico?.persona?.nombre} {selectedCita.medico?.persona?.apellido}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Especialidad</p>
                      <p className="font-medium">{selectedCita.medico?.especialidad?.nombre}</p>
                    </div>
                  </div>
                  {selectedCita.medico?.descripcion && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Acerca del médico</p>
                        <p className="font-medium">{selectedCita.medico.descripcion}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha</p>
                      <p className="font-medium">
                        {selectedCita.fecha_cita.toLocaleDateString("es-ES", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hora</p>
                      <p className="font-medium">
                        {selectedCita.fecha_cita.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Consultorio</p>
                      <p className="font-medium">
                        {selectedCita.consultorio?.nombre_sala}
                      </p>
                      {selectedCita.consultorio?.ubicacion && (
                        <p className="text-sm text-muted-foreground">{selectedCita.consultorio.ubicacion}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Motivo de consulta</p>
                      <p className="font-medium">{selectedCita.motivo || "Consulta general"}</p>
                    </div>
                  </div>
                  {selectedCita.observaciones && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">Observaciones</p>
                        <p className="font-medium">{selectedCita.observaciones}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedCita.estado?.nombre === "Cancelada" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-900 font-medium">
                    {selectedCita.cancelado_por === "medico" 
                      ? "Esta cita fue cancelada por el médico"
                      : "Esta cita ha sido cancelada"}
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Si deseas agendar una nueva cita, dirígete a la sección de médicos disponibles.
                  </p>
                </div>
              )}

              {selectedCita.estado?.nombre === "Confirmada" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900 font-medium">
                    Tu cita ha sido confirmada por el médico
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Te recordaremos antes de tu cita. Por favor, llega 10 minutos antes.
                  </p>
                </div>
              )}

              {selectedCita.estado?.nombre === "Pendiente" && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-900 font-medium">
                    Tu cita está pendiente de confirmación
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    El médico revisará tu solicitud y la confirmará pronto.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={citaToCancel !== null} onOpenChange={() => setCitaToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={canceling}>No, mantener cita</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelarCita}
              disabled={canceling}
              className="bg-red-500 hover:bg-red-600"
            >
              {canceling ? "Cancelando..." : "Sí, cancelar cita"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
