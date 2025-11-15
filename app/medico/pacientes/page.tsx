"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CreditCard, Mail, Phone, Search, Users } from 'lucide-react'
import { useEffect, useState } from "react"

interface Paciente {
  id_paciente: number
  fk_id_persona: number
  activo: boolean
  persona: {
    nombre: string
    apellido: string
    dni: string
    telefono: string
    correo: string
  }
}

export default function MedicoPacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarPacientes()
  }, [])

  const cargarPacientes = async () => {
    try {
      const response = await fetch("/api/pacientes")
      if (response.ok) {
        const data = await response.json()
        setPacientes(data)
      }
    } catch (error) {
      console.error("[v0] Error al cargar pacientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const pacientesFiltrados = pacientes.filter(
    (paciente) =>
      paciente.persona.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      paciente.persona.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      paciente.persona.dni.includes(busqueda),
  )

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Pacientes</h1>
          <p className="text-muted-foreground">Consulta la información de tus pacientes</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            {pacientesFiltrados.length} Pacientes
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o DNI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pacientes List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes ({pacientesFiltrados.length})</CardTitle>
          <CardDescription>Pacientes que han agendado citas contigo</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Cargando pacientes...</p>
            </div>
          ) : pacientesFiltrados.length > 0 ? (
            <div className="space-y-3">
              {pacientesFiltrados.map((paciente) => (
                <div key={paciente.id_paciente} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {paciente.persona.nombre.charAt(0)}
                        {paciente.persona.apellido.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {paciente.persona.nombre} {paciente.persona.apellido}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CreditCard className="w-3 h-3" />
                          {paciente.persona.dni}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {paciente.persona.telefono}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {paciente.persona.correo}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge variant={paciente.activo ? "default" : "secondary"}>
                    {paciente.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No se encontraron pacientes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
