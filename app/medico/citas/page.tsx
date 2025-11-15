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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { Cita } from "@/lib/types"
import { Calendar, CheckCircle, Clock, Eye, FileText, Filter, Mail, MapPin, Phone, Search, User, XCircle } from 'lucide-react'
import { useEffect, useState } from "react"

export default function MedicoCitasPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [citaToReject, setCitaToReject] = useState<number | null>(null)
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)

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
        toast({
          title: "Error",
          description: "No se pudieron cargar las citas",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCitas()
  }, [user?.medico?.id_medico, toast])

  const handleConfirmarCita = async (citaId: number) => {
    try {
      setActionLoading(citaId)
      const response = await fetch("/api/citas", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_citas: citaId,
          fk_id_estado: 2,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al confirmar la cita")
      }

      setCitas((prevCitas) =>
        prevCitas.map((cita) =>
          cita.id_citas === citaId
            ? {
                ...cita,
                fk_id_estado: 2,
                estado: { ...cita.estado, id_estado: 2, nombre: "Confirmada", color: "#22c55e" },
              }
            : cita
        )
      )

      toast({
        title: "Cita confirmada",
        description: "La cita ha sido confirmada exitosamente.",
      })
    } catch (err) {
      console.error("Error al confirmar cita:", err)
      toast({
        title: "Error",
        description: "No se pudo confirmar la cita. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRechazarCita = async () => {
    if (!citaToReject) return

    try {
      setActionLoading(citaToReject)
      const response = await fetch("/api/citas", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_citas: citaToReject,
          fk_id_estado: 5,
          cancelado_por: "medico",
        }),
      })

      if (!response.ok) {
        throw new Error("Error al cancelar la cita")
      }

      setCitas((prevCitas) =>
        prevCitas.map((cita) =>
          cita.id_citas === citaToReject
            ? {
                ...cita,
                fk_id_estado: 5,
                cancelado_por: "medico" as const,
                estado: { ...cita.estado, id_estado: 5, nombre: "Cancelada", color: "#ef4444" },
              }
            : cita
        )
      )

      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada. El paciente será notificado.",
      })

      setCitaToReject(null)
    } catch (err) {
      console.error("Error al rechazar cita:", err)
      toast({
        title: "Error",
        description: "No se pudo cancelar la cita. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const citasFiltradas = citas.filter((cita) => {
    const matchSearch =
      cita.paciente?.persona?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.paciente?.persona?.apellido.toLowerCase().includes(searchTerm.toLowerCase())

    const matchEstado = filterEstado === "todos" || cita.estado?.nombre === filterEstado

    return matchSearch && matchEstado
  })

  const citasPendientes = citas.filter((c) => c.estado?.nombre === "Pendiente")
  const totalPacientesAgendados = new Set(citas.filter(c => c.estado?.nombre !== "Cancelada").map((c) => c.fk_id_paciente)).size

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Citas</h1>
          <p className="text-muted-foreground">Gestiona tus citas médicas programadas</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Cargando citas...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mis Citas</h1>
        <p className="text-muted-foreground">Gestiona tus citas médicas programadas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Citas Pendientes</CardTitle>
            <XCircle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citasPendientes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren confirmación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Citas</CardTitle>
            <Calendar className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citas.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Citas en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pacientes Agendados</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPacientesAgendados}</div>
            <p className="text-xs text-muted-foreground mt-1">Pacientes únicos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Confirmada">Confirmada</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Citas List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Citas ({citasFiltradas.length})</CardTitle>
          <CardDescription>Todas tus citas programadas</CardDescription>
        </CardHeader>
        <CardContent>
          {citasFiltradas.length > 0 ? (
            <div className="space-y-4">
              {citasFiltradas.map((cita) => (
                <div
                  key={cita.id_citas}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {cita.paciente?.persona?.nombre} {cita.paciente?.persona?.apellido}
                        </p>
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
                        {cita.estado?.nombre === "Cancelada" && cita.cancelado_por === "paciente" && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                            Paciente canceló
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{cita.motivo || "Consulta general"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cita.consultorio?.nombre_sala} - {cita.consultorio?.ubicacion}
                      </p>
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
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => setSelectedCita(cita)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    {cita.estado?.nombre === "Pendiente" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 bg-transparent hover:bg-green-50"
                          onClick={() => handleConfirmarCita(cita.id_citas)}
                          disabled={actionLoading === cita.id_citas}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {actionLoading === cita.id_citas ? "Confirmando..." : "Confirmar"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 bg-transparent hover:bg-red-50"
                          onClick={() => setCitaToReject(cita.id_citas)}
                          disabled={actionLoading === cita.id_citas}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No se encontraron citas</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedCita !== null} onOpenChange={() => setSelectedCita(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
            <DialogDescription>Información completa de la cita médica</DialogDescription>
          </DialogHeader>
          
          {selectedCita && (
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
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
                {selectedCita.estado?.nombre === "Cancelada" && selectedCita.cancelado_por === "paciente" && (
                  <Badge variant="outline" className="text-base px-4 py-1 bg-red-50 text-red-700 border-red-300">
                    Cancelada por paciente
                  </Badge>
                )}
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Información del Paciente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Nombre completo</p>
                      <p className="text-sm font-medium">
                        {selectedCita.paciente?.persona?.nombre} {selectedCita.paciente?.persona?.apellido}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="text-sm font-medium">{selectedCita.paciente?.persona?.telefono || "No registrado"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Correo</p>
                      <p className="text-sm font-medium">{selectedCita.paciente?.persona?.correo || "No registrado"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Detalles de la Cita</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha</p>
                      <p className="text-sm font-medium">
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
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Hora</p>
                      <p className="text-sm font-medium">
                        {selectedCita.fecha_cita.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Consultorio</p>
                      <p className="text-sm font-medium">
                        {selectedCita.consultorio?.nombre_sala} - {selectedCita.consultorio?.ubicacion}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Motivo de consulta</p>
                      <p className="text-sm font-medium">{selectedCita.motivo || "Consulta general"}</p>
                    </div>
                  </div>
                  {selectedCita.observaciones && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Observaciones</p>
                        <p className="text-sm font-medium">{selectedCita.observaciones}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedCita.estado?.nombre === "Pendiente" && (
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => {
                      handleConfirmarCita(selectedCita.id_citas)
                      setSelectedCita(null)
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Cita
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => {
                      setCitaToReject(selectedCita.id_citas)
                      setSelectedCita(null)
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar Cita
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={citaToReject !== null} onOpenChange={() => setCitaToReject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Rechazar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas rechazar esta cita? El paciente será notificado de la cancelación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading !== null}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRechazarCita}
              disabled={actionLoading !== null}
              className="bg-red-500 hover:bg-red-600"
            >
              {actionLoading ? "Rechazando..." : "Sí, rechazar cita"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
