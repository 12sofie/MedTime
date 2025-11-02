import pool from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    console.log("[v0] Login attempt with email/username:", username)

    // Validar que los campos no estén vacíos
    if (!username || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 })
    }

    // Buscar el usuario por email (ya que tbl_usuarios solo tiene email, no username)
    const [rows] = await pool.query(
      `SELECT 
        u.id_usuario,
        u.email,
        u.password,
        u.activo,
        p.id_persona,
        p.nombre,
        p.apellido,
        p.dni
      FROM tbl_usuarios u
      LEFT JOIN tbl_medicos m ON u.id_usuario = m.fk_id_usuario
      LEFT JOIN tbl_pacientes pa ON u.id_usuario = pa.fk_id_usuario
      LEFT JOIN tbl_administrador a ON u.id_usuario = a.fk_id_usuario
      LEFT JOIN tbl_persona p ON (m.fk_id_persona = p.id_persona OR pa.fk_id_persona = p.id_persona OR a.fk_id_persona = p.id_persona)
      WHERE u.email = ? OR p.dni = ? LIMIT 1`,
      [username, username],
    )

    console.log("[v0] Database query result:", rows)

    const users = Array.isArray(rows) ? rows : []
    if (users.length === 0) {
      console.log("[v0] User not found")
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 })
    }

    const user = users[0] as any

    // Verificar que el usuario esté activo
    if (!user.activo) {
      return NextResponse.json({ error: "Usuario inactivo" }, { status: 401 })
    }

    let isValid = false

    // Check if password is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    const isBcryptHash = user.password && user.password.match(/^\$2[aby]\$/)

    if (isBcryptHash) {
      // Password is hashed, use bcrypt comparison
      try {
        isValid = await bcrypt.compare(password, user.password)
      } catch (e) {
        console.error("[v0] Bcrypt comparison error:", e)
        isValid = false
      }
    } else {
      // Password is plain text, use direct comparison
      console.log("[v0] Using plain text password comparison")
      isValid = password === user.password
    }

    if (!isValid) {
      console.log("[v0] Invalid password")
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 })
    }

    const [roleRows] = await pool.query(
      `SELECT r.nombre 
       FROM tbl_rol_x_usuario rxu
       JOIN tbl_rol r ON rxu.fk_id_rol = r.id_rol
       WHERE rxu.fk_id_usuario = ?`,
      [user.id_usuario],
    )

    const roles = Array.isArray(roleRows) ? roleRows : []
    const rol = roles.length > 0 ? roles[0].nombre : "paciente"

    console.log("[v0] Login successful for user:", username, "with rol:", rol)
    return NextResponse.json({
      message: "Inicio de sesión exitoso",
      user: {
        id_usuario: user.id_usuario,
        email: user.email,
        rol: rol,
        persona: {
          id_persona: user.id_persona || 0,
          nombre: user.nombre || "",
          apellido: user.apellido || "",
          dni: user.dni || "",
        },
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor"
    return NextResponse.json({ error: `Error: ${errorMessage}` }, { status: 500 })
  }
}
