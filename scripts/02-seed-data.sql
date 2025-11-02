use medtime;
-- Script de datos iniciales para el sistema de citas médicas

-- Insertar roles
-- Eliminado rol 'recepcionista'
INSERT INTO tbl_rol (nombre) VALUES 
('administrador'),
('medico'),
('paciente');

-- Insertar estados de citas
INSERT INTO tbl_estado (nombre) VALUES 
('Pendiente'),
('Confirmada'),
('Programada'),
('En Proceso'),
('Completada'),
('Cancelada'),
('No Asistió');

-- Insertar especialidades médicas
INSERT INTO tbl_especialidades (nombre) VALUES 
('Medicina General'),
('Cardiología'),
('Pediatría'),
('Dermatología'),
('Traumatología'),
('Ginecología'),
('Oftalmología'),
('Neurología'),
('Psiquiatría'),
('Odontología');

-- Insertar consultorios
INSERT INTO tbl_consultorios (nombre_sala, ubicacion) VALUES 
('Consultorio 1', 'Piso 1 - Ala A'),
('Consultorio 2', 'Piso 1 - Ala A'),
('Consultorio 3', 'Piso 1 - Ala B'),
('Consultorio 4', 'Piso 2 - Ala A'),
('Consultorio 5', 'Piso 2 - Ala B');

-- Insertar disponibilidad horaria
INSERT INTO tbl_disponibilidad (dia_semana, hora_inicio, hora_fin) VALUES 
('Lunes', '08:00', '12:00'),
('Lunes', '14:00', '18:00'),
('Martes', '08:00', '12:00'),
('Martes', '14:00', '18:00'),
('Miércoles', '08:00', '12:00'),
('Miércoles', '14:00', '18:00'),
('Jueves', '08:00', '12:00'),
('Jueves', '14:00', '18:00'),
('Viernes', '08:00', '12:00'),
('Viernes', '14:00', '18:00'),
('Sábado', '08:00', '12:00'),
('Domingo', '08:00', '12:00');

-- ============================================
-- USUARIOS Y PERSONAS
-- ============================================

-- Administrador
INSERT INTO tbl_persona (nombre, apellido, dni, telefono, correo) VALUES 
('Carlos', 'Ramírez', '12345678', '999111222', 'admin@medtime.com');

INSERT INTO tbl_usuarios (email, password) VALUES 
('admin@medtime.com', '123456');

INSERT INTO tbl_administrador (fk_id_persona, fk_id_usuario) VALUES 
(1, 1);

INSERT INTO tbl_rol_x_usuario (fk_id_rol, fk_id_usuario) VALUES 
(1, 1);

-- Médico 1: Dr. Juan Pérez - Cardiología
INSERT INTO tbl_persona (nombre, apellido, dni, telefono, correo) VALUES 
('Juan', 'Pérez', '23456789', '999222333', 'juan.perez@medtime.com');

INSERT INTO tbl_usuarios (email, password) VALUES 
('juan.perez@medtime.com', '123456');

INSERT INTO tbl_medicos (descripcion, fk_id_persona, fk_id_usuario, fk_id_especialidad) VALUES 
('Cardiólogo con 15 años de experiencia', 2, 2, 2);

INSERT INTO tbl_rol_x_usuario (fk_id_rol, fk_id_usuario) VALUES 
(2, 2);

-- Asignar disponibilidad al Dr. Juan Pérez (Lunes, Miércoles, Viernes)
INSERT INTO tbl_medicos_x_disponibilidad (fk_id_medico, fk_id_disponibilidad) VALUES 
(1, 1), (1, 2), (1, 5), (1, 6), (1, 9), (1, 10);

-- Médico 2: Dra. María López - Pediatría
INSERT INTO tbl_persona (nombre, apellido, dni, telefono, correo) VALUES 
('María', 'López', '34567890', '999333444', 'maria.lopez@medtime.com');

INSERT INTO tbl_usuarios (email, password) VALUES 
('maria.lopez@medtime.com', '123456');

INSERT INTO tbl_medicos (descripcion, fk_id_persona, fk_id_usuario, fk_id_especialidad) VALUES 
('Pediatra especializada en neonatología con 12 años de experiencia', 3, 3, 3);

INSERT INTO tbl_rol_x_usuario (fk_id_rol, fk_id_usuario) VALUES 
(2, 3);

-- Asignar disponibilidad a Dra. María López (Martes, Jueves, Sábado)
INSERT INTO tbl_medicos_x_disponibilidad (fk_id_medico, fk_id_disponibilidad) VALUES 
(2, 3), (2, 4), (2, 7), (2, 8), (2, 11);

-- Médico 3: Dr. Carlos García - Dermatología
INSERT INTO tbl_persona (nombre, apellido, dni, telefono, correo) VALUES 
('Carlos', 'García', '45678901', '999444555', 'carlos.garcia@medtime.com');

INSERT INTO tbl_usuarios (email, password) VALUES 
('carlos.garcia@medtime.com', '123456');

INSERT INTO tbl_medicos (descripcion, fk_id_persona, fk_id_usuario, fk_id_especialidad) VALUES 
('Dermatólogo especializado en dermatología estética con 8 años de experiencia', 4, 4, 4);

INSERT INTO tbl_rol_x_usuario (fk_id_rol, fk_id_usuario) VALUES 
(2, 4);

-- Asignar disponibilidad a Dr. Carlos García (Lunes, Miércoles, Viernes, Sábado)
INSERT INTO tbl_medicos_x_disponibilidad (fk_id_medico, fk_id_disponibilidad) VALUES 
(3, 1), (3, 2), (3, 5), (3, 6), (3, 9), (3, 10), (3, 11);

-- Médico 4: Dra. Ana Martín - Medicina General
INSERT INTO tbl_persona (nombre, apellido, dni, telefono, correo) VALUES 
('Ana', 'Martín', '56789012', '999555666', 'ana.martin@medtime.com');

INSERT INTO tbl_usuarios (email, password) VALUES 
('ana.martin@medtime.com', '123456');

INSERT INTO tbl_medicos (descripcion, fk_id_persona, fk_id_usuario, fk_id_especialidad) VALUES 
('Médico general con 10 años de experiencia en atención primaria', 5, 5, 1);

INSERT INTO tbl_rol_x_usuario (fk_id_rol, fk_id_usuario) VALUES 
(2, 5);

-- Asignar disponibilidad a Dra. Ana Martín (Todos los días)
INSERT INTO tbl_medicos_x_disponibilidad (fk_id_medico, fk_id_disponibilidad) VALUES 
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8), (4, 9), (4, 10);

-- Paciente 1
INSERT INTO tbl_persona (nombre, apellido, dni, telefono, correo) VALUES 
('Pedro', 'González', '67890123', '999666777', 'pedro.gonzalez@medtime.com');

INSERT INTO tbl_usuarios (email, password) VALUES 
('pedro.gonzalez@medtime.com', '123456');

INSERT INTO tbl_pacientes (fk_id_persona, fk_id_usuario) VALUES 
(6, 6);

INSERT INTO tbl_rol_x_usuario (fk_id_rol, fk_id_usuario) VALUES 
(3, 6);

-- Paciente 2
INSERT INTO tbl_persona (nombre, apellido, dni, telefono, correo) VALUES 
('Laura', 'Martínez', '78901234', '999777888', 'laura.martinez@medtime.com');

INSERT INTO tbl_usuarios (email, password) VALUES 
('laura.martinez@medtime.com', '123456');

INSERT INTO tbl_pacientes (fk_id_persona, fk_id_usuario) VALUES 
(7, 7);

INSERT INTO tbl_rol_x_usuario (fk_id_rol, fk_id_usuario) VALUES 
(3, 7);

-- Eliminados datos de recepcionista (persona, usuario y relación rol)

-- ============================================
-- CITAS DE EJEMPLO
-- ============================================

-- Cita 1: Pedro González con Dr. Juan Pérez (Programada)
INSERT INTO tbl_citas (fecha_cita, motivo, fk_id_medico, fk_id_paciente, fk_id_estado, fk_id_consultorio)
VALUES ('2024-10-04 09:00:00', 'Consulta de control cardiológico', 1, 1, 3, 1);

-- Cita 2: Laura Martínez con Dra. María López (Confirmada)
INSERT INTO tbl_citas (fecha_cita, motivo, fk_id_medico, fk_id_paciente, fk_id_estado, fk_id_consultorio)
VALUES ('2024-10-05 14:00:00', 'Control pediátrico de rutina', 2, 2, 2, 2);

-- Cita 3: Pedro González con Dr. Carlos García (Pendiente)
INSERT INTO tbl_citas (fecha_cita, motivo, fk_id_medico, fk_id_paciente, fk_id_estado, fk_id_consultorio)
VALUES ('2024-10-10 10:30:00', 'Revisión dermatológica', 3, 1, 1, 3);

-- Cita 4: Laura Martínez con Dra. Ana Martín (Completada - Historial)
INSERT INTO tbl_citas (fecha_cita, motivo, fk_id_medico, fk_id_paciente, fk_id_estado, fk_id_consultorio)
VALUES ('2024-09-15 11:00:00', 'Consulta general por gripe', 4, 2, 5, 1);

-- ============================================
-- RECORDATORIOS DE EJEMPLO
-- ============================================

INSERT INTO tbl_recordatorios (medio, fecha_envio, estado_envio, mensaje, tbl_citas_id_citas) VALUES 
('Email', '2024-10-03 08:00:00', 'Enviado', 'Recordatorio: Tiene una cita mañana a las 09:00 con Dr. Juan Pérez', 1),
('SMS', '2024-10-04 08:00:00', 'Enviado', 'Recordatorio: Tiene una cita hoy a las 14:00 con Dra. María López', 2);