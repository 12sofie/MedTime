// Tipos TypeScript para el sistema de citas médicas

export interface Persona {
  id_persona: number
  nombre: string
  apellido: string
  dni: string
  telefono?: string
  correo?: string
  created_at?: Date
  updated_at?: Date
}

export interface Usuario {
  id_usuario: number
  email: string
  password: string
  activo: boolean
  created_at?: Date
  updated_at?: Date
}

export interface Rol {
  id_rol: number
  nombre: "administrador" | "medico" | "paciente"
  created_at?: Date
}

export interface Especialidad {
  id_especialidad: number
  nombre: string
  descripcion?: string
  created_at?: Date
}

export interface Medico {
  id_medico: number
  descripcion?: string
  fk_id_persona: number
  fk_id_usuario: number
  fk_id_especialidad: number
  activo: boolean
  created_at?: Date
  updated_at?: Date
  persona?: Persona
  especialidad?: Especialidad
  disponibilidad?: Disponibilidad[]
  anos_experiencia?: number
  rating?: number
  num_resenas?: number
}

export interface Paciente {
  id_paciente: number
  fk_id_persona: number
  fk_id_usuario: number
  fecha_registro?: Date
  activo: boolean
  persona?: Persona
}

export interface Administrador {
  id_administrador: number
  fk_id_persona: number
  fk_id_usuario: number
  created_at?: Date
  persona?: Persona
}

export interface Consultorio {
  id_consultorio: number
  nombre_sala: string
  ubicacion?: string
  activo: boolean
  created_at?: Date
}

export interface Disponibilidad {
  id_disponibilidad: number
  dia_semana: string
  hora_inicio: string
  hora_fin: string
  created_at?: Date
}

export interface Estado {
  id_estado: number
  nombre: string
  color?: string
  created_at?: Date
}

export interface Cita {
  id_citas: number
  fecha_cita: Date
  fecha_creacion?: Date
  motivo?: string
  observaciones?: string
  fk_id_medico: number
  fk_id_paciente: number
  fk_id_estado: number
  fk_id_consultorio: number
  medico?: Medico
  paciente?: Paciente
  estado?: Estado
  consultorio?: Consultorio
}

export interface Recordatorio {
  id_recordatorio: number
  medio: string
  fecha_envio: Date
  estado_envio: string
  mensaje?: string
  tbl_citas_id_citas: number
  created_at?: Date
}

// Tipos para autenticación
export interface AuthUser {
  id_usuario: number
  email: string
  rol: "administrador" | "medico" | "paciente"
  persona: Persona
  medico?: Medico
  paciente?: Paciente
  administrador?: Administrador
}

// Tipos para formularios
export interface LoginForm {
  email: string
  password: string
}

export interface CitaForm {
  fecha_cita: string
  hora_cita: string
  motivo: string
  fk_id_medico: number
  fk_id_paciente: number
  fk_id_consultorio: number
}

export interface MedicoForm {
  nombre: string
  apellido: string
  dni: string
  telefono: string
  correo: string
  email: string
  password: string
  fk_id_especialidad: number
  descripcion: string
}

export interface PacienteForm {
  nombre: string
  apellido: string
  dni: string
  telefono: string
  correo: string
  email: string
  password: string
}
