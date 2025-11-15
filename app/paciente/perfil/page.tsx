'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Calendar, CreditCard, Mail, Pencil, Phone, Save, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PacientePerfil {
  id_paciente: number
  nombre: string
  apellido: string
  dni: string
  telefono: string
  correo: string
  email: string
  fecha_registro: string
}

export default function PerfilPacientePage() {
  const [perfil, setPerfil] = useState<PacientePerfil | null>(null)
  const [editando, setEditando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    correo: ''
  })

  useEffect(() => {
    cargarPerfil()
  }, [])

  const cargarPerfil = async () => {
    try {
      setCargando(true)
      const response = await fetch('/api/pacientes/perfil')
      
      if (!response.ok) {
        throw new Error('Error al cargar el perfil')
      }

      const data = await response.json()
      setPerfil(data)
      setFormData({
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        telefono: data.telefono || '',
        correo: data.correo || ''
      })
    } catch (error) {
      console.error('[v0] Error al cargar perfil:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar tu perfil. Intenta nuevamente.',
        variant: 'destructive'
      })
    } finally {
      setCargando(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleGuardar = async () => {
    try {
      setGuardando(true)

      const response = await fetch('/api/pacientes/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el perfil')
      }

      const data = await response.json()
      setPerfil(data)
      setEditando(false)

      toast({
        title: 'Perfil actualizado',
        description: 'Tus datos se han guardado correctamente.'
      })
    } catch (error) {
      console.error('[v0] Error al guardar perfil:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el perfil',
        variant: 'destructive'
      })
    } finally {
      setGuardando(false)
    }
  }

  const handleCancelar = () => {
    if (perfil) {
      setFormData({
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        dni: perfil.dni,
        telefono: perfil.telefono || '',
        correo: perfil.correo || ''
      })
    }
    setEditando(false)
  }

  const getIniciales = () => {
    if (!perfil) return 'PA'
    return `${perfil.nombre[0]}${perfil.apellido[0]}`.toUpperCase()
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6 max-w-md text-center">
          <p className="text-muted-foreground">No se pudo cargar tu perfil</p>
          <Button onClick={cargarPerfil} className="mt-4">
            Reintentar
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Administra tu información personal y preferencias
        </p>
      </div>

      <Card className="p-6 md:p-8">
        {/* Header con avatar */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
              <span className="text-xl font-semibold">
                {getIniciales()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {perfil.nombre} {perfil.apellido}
              </h2>
              <p className="text-muted-foreground mt-1">Paciente</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Registrado el {new Date(perfil.fecha_registro).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {!editando && (
            <Button
              onClick={() => setEditando(true)}
              variant="outline"
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>

        {/* Formulario de datos */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="flex items-center gap-2 text-slate-700">
                <User className="h-4 w-4 text-teal-600" />
                Nombre
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                disabled={!editando}
                className="disabled:opacity-70"
              />
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <Label htmlFor="apellido" className="flex items-center gap-2 text-slate-700">
                <User className="h-4 w-4 text-teal-600" />
                Apellido
              </Label>
              <Input
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                disabled={!editando}
                className="disabled:opacity-70"
              />
            </div>

            {/* DNI */}
            <div className="space-y-2">
              <Label htmlFor="dni" className="flex items-center gap-2 text-slate-700">
                <CreditCard className="h-4 w-4 text-teal-600" />
                DNI
              </Label>
              <Input
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                disabled={!editando}
                className="disabled:opacity-70"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="flex items-center gap-2 text-slate-700">
                <Phone className="h-4 w-4 text-teal-600" />
                Teléfono
              </Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                disabled={!editando}
                placeholder="Ej: +51 999 999 999"
                className="disabled:opacity-70"
              />
            </div>

            {/* Correo personal */}
            <div className="space-y-2">
              <Label htmlFor="correo" className="flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-teal-600" />
                Correo Personal
              </Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                disabled={!editando}
                placeholder="correo@ejemplo.com"
                className="disabled:opacity-70"
              />
            </div>

            {/* Email de cuenta (no editable) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-teal-600" />
                Email de Cuenta
              </Label>
              <Input
                value={perfil.email}
                disabled
                className="bg-slate-50 text-slate-600"
              />
              <p className="text-xs text-muted-foreground">
                Este es tu email de inicio de sesión y no se puede modificar
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          {editando && (
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                onClick={handleCancelar}
                variant="outline"
                disabled={guardando}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleGuardar}
                disabled={guardando}
                className="gap-2 bg-teal-600 hover:bg-teal-700"
              >
                <Save className="h-4 w-4" />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
