"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Star, MapPin, Calendar } from "lucide-react"
import { mockMedicos, mockConsultorios } from "@/lib/mock-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Horarios disponibles mock
const horariosDisponibles = [
  { dia: "viernes", hora: "09:00" },
  { dia: "viernes", hora: "10:00" },
  { dia: "domingo", hora: "11:00" },
  { dia: "lunes", hora: "14:00" },
  { dia: "jueves", hora: "14:00" },
  { dia: "viernes", hora: "15:00" },
  { dia: "sábado", hora: "10:00" },
  { dia: "domingo", hora: "10:30" },
  { dia: "sábado", hora: "14:00" },
  { dia: "lunes", hora: "16:00" },
]

const diasMap: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miércoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sábado: "Sábado",
  domingo: "Domingo",
}

export default function MedicosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [especialidadFilter, setEspecialidadFilter] = useState("todas")
  const [selectedMedico, setSelectedMedico] = useState<number | null>(null)
  const [fechaCita, setFechaCita] = useState("")
  const [motivoCita, setMotivoCita] = useState("")

  const filteredMedicos = mockMedicos.filter((medico) => {
    const matchesSearch =
      medico.persona?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.persona?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medico.especialidad?.nombre.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEspecialidad = especialidadFilter === "todas" || medico.especialidad?.nombre === especialidadFilter

    return matchesSearch && matchesEspecialidad
  })

  const handleAgendar = (medicoId: number) => {
    setSelectedMedico(medicoId)
  }

  const handleConfirmarCita = () => {
    console.log("[v0] Agendando cita:", { selectedMedico, fechaCita, motivoCita })
    // Aquí iría la lógica para crear la cita
    setSelectedMedico(null)
    setFechaCita("")
    setMotivoCita("")
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#2C5282]">Médicos Disponibles</h1>
          <p className="text-[#718096]">Encuentra y agenda una cita con nuestros especialistas</p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#718096]" />
            <Input
              placeholder="Buscar médicos o especialidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#E2E8F0] focus:border-[#4A9B9B] focus:ring-[#4A9B9B]"
            />
          </div>
          <Select value={especialidadFilter} onValueChange={setEspecialidadFilter}>
            <SelectTrigger className="w-64 border-[#E2E8F0] focus:border-[#4A9B9B] focus:ring-[#4A9B9B]">
              <SelectValue placeholder="Todas las especialidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las especialidades</SelectItem>
              <SelectItem value="Cardiología">Cardiología</SelectItem>
              <SelectItem value="Pediatría">Pediatría</SelectItem>
              <SelectItem value="Dermatología">Dermatología</SelectItem>
              <SelectItem value="Medicina General">Medicina General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicos.map((medico, index) => {
            const consultorio = mockConsultorios[index % mockConsultorios.length]
            const horariosDelMedico = horariosDisponibles.slice(index * 4, index * 4 + 4)

            return (
              <div
                key={medico.id_medico}
                className="bg-white rounded-lg border border-[#E2E8F0] p-6 space-y-4 hover:shadow-md transition-shadow"
              >
                {/* Nombre y años de experiencia */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#2C5282]">
                      Dr. {medico.persona?.nombre} {medico.persona?.apellido}
                    </h3>
                    <p className="text-sm text-[#718096]">{medico.especialidad?.nombre}</p>
                  </div>
                  <span className="bg-[#48BB78] text-white text-xs font-medium px-3 py-1 rounded-full">
                    {medico.anos_experiencia} años
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-[#ECC94B] text-[#ECC94B]" />
                  <span className="font-semibold text-[#2C5282]">{medico.rating}</span>
                  <span className="text-sm text-[#718096]">({medico.num_resenas} reseñas)</span>
                </div>

                {/* Consultorio */}
                <div className="flex items-center gap-2 text-sm text-[#718096]">
                  <MapPin className="w-4 h-4" />
                  <span>{consultorio.nombre_sala}</span>
                </div>

                {/* Próximos horarios */}
                <div>
                  <p className="text-sm font-medium text-[#2C5282] mb-2">Próximos horarios:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {horariosDelMedico.map((horario, idx) => (
                      <div key={idx} className="bg-[#F0F4F8] rounded px-3 py-2 text-center">
                        <p className="text-sm font-medium text-[#2C5282]">{horario.hora}</p>
                        <p className="text-xs text-[#718096]">{diasMap[horario.dia]}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-[#4A9B9B] text-[#4A9B9B] hover:bg-[#4A9B9B] hover:text-white bg-transparent"
                  >
                    Ver perfil
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="flex-1 bg-[#4A9B9B] hover:bg-[#3A8B8B] text-white"
                        onClick={() => handleAgendar(medico.id_medico)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-[#2C5282]">Agendar Cita</DialogTitle>
                        <DialogDescription className="text-[#718096]">
                          Agendar una cita con Dr. {medico.persona?.nombre} {medico.persona?.apellido} -{" "}
                          {medico.especialidad?.nombre}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="fecha" className="text-[#2C5282]">
                            Fecha
                          </Label>
                          <Input
                            id="fecha"
                            type="date"
                            value={fechaCita}
                            onChange={(e) => setFechaCita(e.target.value)}
                            className="border-[#4A9B9B] focus:border-[#4A9B9B] focus:ring-[#4A9B9B]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motivo" className="text-[#2C5282]">
                            Motivo de la consulta
                          </Label>
                          <Input
                            id="motivo"
                            placeholder="Describe brevemente el motivo de tu consulta"
                            value={motivoCita}
                            onChange={(e) => setMotivoCita(e.target.value)}
                            className="border-[#E2E8F0] focus:border-[#4A9B9B] focus:ring-[#4A9B9B]"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1 bg-transparent">
                            Cancelar
                          </Button>
                        </DialogTrigger>
                        <Button
                          onClick={handleConfirmarCita}
                          className="flex-1 bg-[#4A9B9B] hover:bg-[#3A8B8B] text-white"
                        >
                          Confirmar Cita
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
