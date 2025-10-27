"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Filter, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { mockCitas } from "@/lib/mock-data"
import { NuevaCitaDialog } from "@/components/nueva-cita-dialog"

export default function AdminCitasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [dialogOpen, setDialogOpen] = useState(false)

  const citasFiltradas = mockCitas.filter((cita) => {
    const matchSearch =
      cita.paciente?.persona?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.paciente?.persona?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.medico?.persona?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.medico?.persona?.apellido.toLowerCase().includes(searchTerm.toLowerCase())

    const matchEstado = filterEstado === "todos" || cita.estado?.nombre === filterEstado

    return matchSearch && matchEstado
  })

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Citas</h1>
          <p className="text-muted-foreground">Administra todas las citas médicas del sistema</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente o médico..."
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

      {/* Citas Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Citas ({citasFiltradas.length})</CardTitle>
          <CardDescription>Todas las citas registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <p className="text-sm text-muted-foreground">
                      Dr. {cita.medico?.persona?.nombre} {cita.medico?.persona?.apellido} -{" "}
                      {cita.medico?.especialidad?.nombre}
                    </p>
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
                  <Button variant="ghost" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
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
        </CardContent>
      </Card>

      <NuevaCitaDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
