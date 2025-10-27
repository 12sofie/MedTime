"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Edit, Trash2, Stethoscope } from "lucide-react"
import { mockMedicos } from "@/lib/mock-data"

export default function AdminMedicosPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const medicosFiltrados = mockMedicos.filter(
    (medico) =>
      medico.persona?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.persona?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.especialidad?.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Médicos</h1>
          <p className="text-muted-foreground">Administra el personal médico del sistema</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Médico
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar médico por nombre o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Médicos Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {medicosFiltrados.map((medico) => (
          <Card key={medico.id_medico} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Dr. {medico.persona?.nombre} {medico.persona?.apellido}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {medico.especialidad?.nombre}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DNI:</span>
                  <span className="font-medium">{medico.persona?.dni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span className="font-medium">{medico.persona?.telefono}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-xs">{medico.persona?.correo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge variant={medico.activo ? "default" : "secondary"}>
                    {medico.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Descripción:</p>
                <p className="text-sm">{medico.descripcion}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
