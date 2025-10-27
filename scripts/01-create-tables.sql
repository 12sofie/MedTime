-- Script de creación de tablas para el sistema de citas médicas

-- Tabla de personas (información base compartida)
CREATE TABLE IF NOT EXISTS tbl_persona (
    id_persona INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    apellido VARCHAR(45) NOT NULL,
    dni VARCHAR(45) UNIQUE NOT NULL,
    telefono VARCHAR(45),
    correo VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de roles
CREATE TABLE IF NOT EXISTS tbl_rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS tbl_usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(45) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de relación rol x usuario
CREATE TABLE IF NOT EXISTS tbl_rol_x_usuario (
    fk_id_rol INT NOT NULL,
    fk_id_usuario INT NOT NULL,
    PRIMARY KEY (fk_id_rol, fk_id_usuario),
    FOREIGN KEY (fk_id_rol) REFERENCES tbl_rol(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (fk_id_usuario) REFERENCES tbl_usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de especialidades médicas
CREATE TABLE IF NOT EXISTS tbl_especialidades (
    id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de médicos
CREATE TABLE IF NOT EXISTS tbl_medicos (
    id_medico INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255),
    fk_id_persona INT NOT NULL,
    fk_id_usuario INT NOT NULL,
    fk_id_especialidad INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_id_persona) REFERENCES tbl_persona(id_persona) ON DELETE CASCADE,
    FOREIGN KEY (fk_id_usuario) REFERENCES tbl_usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (fk_id_especialidad) REFERENCES tbl_especialidades(id_especialidad)
);

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS tbl_pacientes (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    fk_id_persona INT NOT NULL,
    fk_id_usuario INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (fk_id_persona) REFERENCES tbl_persona(id_persona) ON DELETE CASCADE,
    FOREIGN KEY (fk_id_usuario) REFERENCES tbl_usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS tbl_administrador (
    id_administrador INT AUTO_INCREMENT PRIMARY KEY,
    fk_id_persona INT NOT NULL,
    fk_id_usuario INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_id_persona) REFERENCES tbl_persona(id_persona) ON DELETE CASCADE,
    FOREIGN KEY (fk_id_usuario) REFERENCES tbl_usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de consultorios
CREATE TABLE IF NOT EXISTS tbl_consultorios (
    id_consultorio INT AUTO_INCREMENT PRIMARY KEY,
    nombre_sala VARCHAR(45) NOT NULL,
    ubicacion VARCHAR(45),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de disponibilidad
CREATE TABLE IF NOT EXISTS tbl_disponibilidad (
    id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana VARCHAR(45) NOT NULL,
    hora_inicio VARCHAR(45) NOT NULL,
    hora_fin VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación médicos x disponibilidad
CREATE TABLE IF NOT EXISTS tbl_medicos_x_disponibilidad (
    fk_id_medico INT NOT NULL,
    fk_id_disponibilidad INT NOT NULL,
    PRIMARY KEY (fk_id_medico, fk_id_disponibilidad),
    FOREIGN KEY (fk_id_medico) REFERENCES tbl_medicos(id_medico) ON DELETE CASCADE,
    FOREIGN KEY (fk_id_disponibilidad) REFERENCES tbl_disponibilidad(id_disponibilidad) ON DELETE CASCADE
);

-- Tabla de estados de citas
CREATE TABLE IF NOT EXISTS tbl_estado (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL UNIQUE,
    color VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS tbl_citas (
    id_citas INT AUTO_INCREMENT PRIMARY KEY,
    fecha_cita DATETIME NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT,
    observaciones TEXT,
    fk_id_medico INT NOT NULL,
    fk_id_paciente INT NOT NULL,
    fk_id_estado INT NOT NULL,
    fk_id_consultorio INT NOT NULL,
    FOREIGN KEY (fk_id_medico) REFERENCES tbl_medicos(id_medico),
    FOREIGN KEY (fk_id_paciente) REFERENCES tbl_pacientes(id_paciente),
    FOREIGN KEY (fk_id_estado) REFERENCES tbl_estado(id_estado),
    FOREIGN KEY (fk_id_consultorio) REFERENCES tbl_consultorios(id_consultorio)
);

-- Tabla de recordatorios
CREATE TABLE IF NOT EXISTS tbl_recordatorios (
    id_recordatorio INT AUTO_INCREMENT PRIMARY KEY,
    medio VARCHAR(45) NOT NULL,
    fecha_envio DATETIME NOT NULL,
    estado_envio VARCHAR(45) DEFAULT 'pendiente',
    mensaje TEXT,
    tbl_citas_id_citas INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tbl_citas_id_citas) REFERENCES tbl_citas(id_citas) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_persona_dni ON tbl_persona(dni);
CREATE INDEX idx_usuario_email ON tbl_usuarios(email);
CREATE INDEX idx_citas_fecha ON tbl_citas(fecha_cita);
CREATE INDEX idx_citas_medico ON tbl_citas(fk_id_medico);
CREATE INDEX idx_citas_paciente ON tbl_citas(fk_id_paciente);
CREATE INDEX idx_citas_estado ON tbl_citas(fk_id_estado);
