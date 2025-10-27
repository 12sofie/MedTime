"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Filter, Eye, CheckCircle, XCircle } from "lucide-react"
import { mockCitas } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"

export default function MedicoCitasPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")

  // Filtrar citas del médico actual
  const misCitas = mockCitas.filter((c) => c.fk_id_medico === user?.medico?.id_medico)

  const citasFiltradas = misCitas.filter((cita) => {
    const matchSearch =
      cita.paciente?.persona?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.paciente?.persona?.apellido.toLowerCase().includes(searchTerm.toLowerCase())

    const matchEstado = filterEstado === "todos" || cita.estado?.nombre === filterEstado

    return matchSearch && matchEstado
  })

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mis Citas</h1>
        <p className="text-muted-foreground">Gestiona tus citas médicas programadas</p>
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
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    {cita.estado?.nombre === "Pendiente" && (
                      <>
                        <Button variant="outline" size="sm" className="text-green-600 border-green-600 bg-transparent">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmar
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-600 bg-transparent">
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancelar
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
    </div>
  )
}
