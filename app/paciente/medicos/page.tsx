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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

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
  const [horaCita, setHoraCita] = useState("")
  const [motivoCita, setMotivoCita] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { user } = useAuth()
  const router = useRouter()

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
    setFechaCita("")
    setHoraCita("")
    setMotivoCita("")
    setError(null)
    setSuccess(false)
    setDialogOpen(true)
  }

  const handleConfirmarCita = async () => {
    if (!fechaCita || !horaCita || !motivoCita) {
      setError("Por favor completa todos los campos requeridos")
      return
    }

    if (!user?.paciente?.id_paciente) {
      setError("No se pudo identificar al paciente. Por favor inicia sesión nuevamente.")
      return
    }

    if (!selectedMedico) {
      setError("No se seleccionó un médico")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const consultorioId = mockConsultorios[0]?.id_consultorio || 1

      console.log("[v0] ===== FRONTEND DEBUG =====")
      console.log("[v0] Fecha seleccionada (input date):", fechaCita)
      console.log("[v0] Hora seleccionada (input time):", horaCita)

      const fechaHora = `${fechaCita} ${horaCita}:00`
      console.log("[v0] Fecha y hora concatenadas:", fechaHora)
      console.log("[v0] Tipo de dato:", typeof fechaHora)
      console.log("[v0] ===== FIN FRONTEND DEBUG =====")

      const response = await fetch("/api/citas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fk_id_medico: selectedMedico,
          fk_id_paciente: user.paciente.id_paciente,
          fk_id_consultorio: consultorioId,
          fecha_cita: fechaHora,
          motivo: motivoCita,
          observaciones: "",
        }),
      })

      const data = await response.json()

      console.log("[v0] Respuesta del API:", data)

      if (!response.ok) {
        setError(data.error || "Error al crear la cita")
        return
      }

      setSuccess(true)

      setTimeout(() => {
        setDialogOpen(false)
        setSelectedMedico(null)
        setFechaCita("")
        setHoraCita("")
        setMotivoCita("")
        setSuccess(false)
        router.push("/paciente/citas")
      }, 1500)
    } catch (err) {
      console.error("[v0] Error al crear cita:", err)
      setError("Error de conexión. Por favor intenta nuevamente.")
    } finally {
      setLoading(false)
    }
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

                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-[#ECC94B] text-[#ECC94B]" />
                  <span className="font-semibold text-[#2C5282]">{medico.rating}</span>
                  <span className="text-sm text-[#718096]">({medico.num_resenas} reseñas)</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#718096]">
                  <MapPin className="w-4 h-4" />
                  <span>{consultorio.nombre_sala}</span>
                </div>

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

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-[#4A9B9B] text-[#4A9B9B] hover:bg-[#4A9B9B] hover:text-white bg-transparent"
                  >
                    Ver perfil
                  </Button>
                  <Dialog open={dialogOpen && selectedMedico === medico.id_medico} onOpenChange={setDialogOpen}>
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
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        {success && (
                          <Alert className="bg-green-50 text-green-800 border-green-200">
                            <AlertDescription>¡Cita creada exitosamente! Redirigiendo...</AlertDescription>
                          </Alert>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="fecha" className="text-[#2C5282]">
                            Fecha
                          </Label>
                          <Input
                            id="fecha"
                            type="date"
                            value={fechaCita}
                            onChange={(e) => setFechaCita(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="border-[#4A9B9B] focus:border-[#4A9B9B] focus:ring-[#4A9B9B]"
                            disabled={loading || success}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hora" className="text-[#2C5282]">
                            Hora
                          </Label>
                          <Input
                            id="hora"
                            type="time"
                            value={horaCita}
                            onChange={(e) => setHoraCita(e.target.value)}
                            className="border-[#4A9B9B] focus:border-[#4A9B9B] focus:ring-[#4A9B9B]"
                            disabled={loading || success}
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
                            disabled={loading || success}
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => setDialogOpen(false)}
                          disabled={loading || success}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleConfirmarCita}
                          className="flex-1 bg-[#4A9B9B] hover:bg-[#3A8B8B] text-white"
                          disabled={loading || success}
                        >
                          {loading ? "Creando..." : success ? "¡Cita Creada!" : "Confirmar Cita"}
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
