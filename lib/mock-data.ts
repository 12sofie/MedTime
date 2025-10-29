// Datos mock para desarrollo sin base de datos
import type { Especialidad, Medico, Paciente, Cita, Estado, Consultorio, Persona, Disponibilidad } from "./types"

export const mockEspecialidades: Especialidad[] = [
  { id_especialidad: 1, nombre: "Medicina General", descripcion: "Atención médica general y preventiva" },
  { id_especialidad: 2, nombre: "Cardiología", descripcion: "Especialista en enfermedades del corazón" },
  { id_especialidad: 3, nombre: "Pediatría", descripcion: "Atención médica para niños y adolescentes" },
  { id_especialidad: 4, nombre: "Dermatología", descripcion: "Especialista en enfermedades de la piel" },
  {
    id_especialidad: 5,
    nombre: "Traumatología",
    descripcion: "Especialista en lesiones del sistema musculoesquelético",
  },
]

export const mockPersonas: Persona[] = [
  {
    id_persona: 1,
    nombre: "Juan",
    apellido: "Pérez",
    dni: "12345678",
    telefono: "987654321",
    correo: "juan.perez@medtime.com", // Actualizado dominio a medtime.com
  },
  {
    id_persona: 2,
    nombre: "María",
    apellido: "García",
    dni: "87654321",
    telefono: "987654322",
    correo: "maria.garcia@medtime.com", // Actualizado dominio a medtime.com
  },
  {
    id_persona: 3,
    nombre: "Carlos",
    apellido: "López",
    dni: "11223344",
    telefono: "987654323",
    correo: "carlos.lopez@medtime.com", // Actualizado dominio a medtime.com
  },
  {
    id_persona: 4,
    nombre: "Ana",
    apellido: "Martínez",
    dni: "44332211",
    telefono: "987654324",
    correo: "ana.martinez@medtime.com", // Actualizado dominio a medtime.com
  },
]

export const mockMedicos: Medico[] = [
  {
    id_medico: 1,
    descripcion: "Cardiólogo con 15 años de experiencia",
    fk_id_persona: 1,
    fk_id_usuario: 1,
    fk_id_especialidad: 2,
    activo: true,
    persona: { ...mockPersonas[0], nombre: "Juan", apellido: "Pérez" },
    especialidad: mockEspecialidades[1],
    anos_experiencia: 15,
    rating: 4.8,
    num_resenas: 124,
  },
  {
    id_medico: 2,
    descripcion: "Pediatra especializada en atención infantil",
    fk_id_persona: 2,
    fk_id_usuario: 2,
    fk_id_especialidad: 3,
    activo: true,
    persona: { ...mockPersonas[1], nombre: "María", apellido: "López" },
    especialidad: mockEspecialidades[2],
    anos_experiencia: 12,
    rating: 4.9,
    num_resenas: 89,
  },
  {
    id_medico: 3,
    descripcion: "Dermatólogo con amplia experiencia",
    fk_id_persona: 3,
    fk_id_usuario: 3,
    fk_id_especialidad: 4,
    activo: true,
    persona: { ...mockPersonas[2], nombre: "Carlos", apellido: "García" },
    especialidad: mockEspecialidades[3],
    anos_experiencia: 8,
    rating: 4.7,
    num_resenas: 67,
  },
  {
    id_medico: 4,
    descripcion: "Médico general con enfoque preventivo",
    fk_id_persona: 4,
    fk_id_usuario: 4,
    fk_id_especialidad: 1,
    activo: true,
    persona: { ...mockPersonas[3], nombre: "Ana", apellido: "Martín" },
    especialidad: mockEspecialidades[0],
    anos_experiencia: 10,
    rating: 4.6,
    num_resenas: 52,
  },
]

export const mockPacientes: Paciente[] = [
  {
    id_paciente: 1,
    fk_id_persona: 3,
    fk_id_usuario: 3,
    activo: true,
    persona: mockPersonas[2],
  },
  {
    id_paciente: 2,
    fk_id_persona: 4,
    fk_id_usuario: 4,
    activo: true,
    persona: mockPersonas[3],
  },
]

export const mockEstados: Estado[] = [
  { id_estado: 1, nombre: "Pendiente", color: "#FFA500" },
  { id_estado: 2, nombre: "Confirmada", color: "#4CAF50" },
  { id_estado: 3, nombre: "En Proceso", color: "#2196F3" },
  { id_estado: 4, nombre: "Completada", color: "#9E9E9E" },
  { id_estado: 5, nombre: "Cancelada", color: "#F44336" },
]

export const mockConsultorios: Consultorio[] = [
  { id_consultorio: 1, nombre_sala: "Consultorio 1", ubicacion: "Piso 1 - Ala A", activo: true },
  { id_consultorio: 2, nombre_sala: "Consultorio 2", ubicacion: "Piso 1 - Ala A", activo: true },
  { id_consultorio: 3, nombre_sala: "Consultorio 3", ubicacion: "Piso 1 - Ala B", activo: true },
  { id_consultorio: 4, nombre_sala: "Consultorio 4", ubicacion: "Piso 2 - Ala A", activo: true },
]

export const mockDisponibilidad: Disponibilidad[] = [
  { id_disponibilidad: 1, dia_semana: "Lunes", hora_inicio: "08:00", hora_fin: "12:00" },
  { id_disponibilidad: 2, dia_semana: "Lunes", hora_inicio: "14:00", hora_fin: "18:00" },
  { id_disponibilidad: 3, dia_semana: "Martes", hora_inicio: "08:00", hora_fin: "12:00" },
  { id_disponibilidad: 4, dia_semana: "Miércoles", hora_inicio: "08:00", hora_fin: "12:00" },
  { id_disponibilidad: 5, dia_semana: "Jueves", hora_inicio: "14:00", hora_fin: "18:00" },
  { id_disponibilidad: 6, dia_semana: "Viernes", hora_inicio: "08:00", hora_fin: "12:00" },
]

export const mockCitas: Cita[] = [
  {
    id_citas: 1,
    fecha_cita: new Date("2025-01-15T09:00:00"),
    motivo: "Consulta general",
    observaciones: "Paciente presenta síntomas de gripe",
    fk_id_medico: 1,
    fk_id_paciente: 1,
    fk_id_estado: 2,
    fk_id_consultorio: 1,
    medico: mockMedicos[0],
    paciente: mockPacientes[0],
    estado: mockEstados[1],
    consultorio: mockConsultorios[0],
  },
  {
    id_citas: 2,
    fecha_cita: new Date("2025-01-16T10:30:00"),
    motivo: "Control cardiológico",
    observaciones: "Control de rutina",
    fk_id_medico: 2,
    fk_id_paciente: 2,
    fk_id_estado: 1,
    fk_id_consultorio: 2,
    medico: mockMedicos[1],
    paciente: mockPacientes[1],
    estado: mockEstados[0],
    consultorio: mockConsultorios[1],
  },
  {
    id_citas: 3,
    fecha_cita: new Date("2025-01-14T14:00:00"),
    motivo: "Revisión médica",
    observaciones: "Completada exitosamente",
    fk_id_medico: 1,
    fk_id_paciente: 1,
    fk_id_estado: 4,
    fk_id_consultorio: 1,
    medico: mockMedicos[0],
    paciente: mockPacientes[0],
    estado: mockEstados[3],
    consultorio: mockConsultorios[0],
  },
]
