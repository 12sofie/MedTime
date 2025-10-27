"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Edit, Trash2, User } from "lucide-react"
import { mockPacientes } from "@/lib/mock-data"

export default function AdminPacientesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const pacientesFiltrados = mockPacientes.filter(
    (paciente) =>
      paciente.persona?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.persona?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.persona?.dni.includes(searchTerm),
  )

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Pacientes</h1>
          <p className="text-muted-foreground">Administra los pacientes registrados en el sistema</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pacientes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes ({pacientesFiltrados.length})</CardTitle>
          <CardDescription>Todos los pacientes registrados en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pacientesFiltrados.map((paciente) => (
              <div
                key={paciente.id_paciente}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">
                        {paciente.persona?.nombre} {paciente.persona?.apellido}
                      </p>
                      <Badge variant={paciente.activo ? "default" : "secondary"}>
                        {paciente.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>DNI: {paciente.persona?.dni}</span>
                      <span>Tel: {paciente.persona?.telefono}</span>
                      <span>{paciente.persona?.correo}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Registrado</p>
                    <p className="text-sm font-medium">
                      {paciente.fecha_registro ? new Date(paciente.fecha_registro).toLocaleDateString("es-ES") : "N/A"}
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
    </div>
  )
}
