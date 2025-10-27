"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  Building2,
  Settings,
  LogOut,
  Activity,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const menuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/citas", label: "Citas", icon: Calendar },
  { href: "/admin/medicos", label: "Médicos", icon: Stethoscope },
  { href: "/admin/pacientes", label: "Pacientes", icon: Users },
  { href: "/admin/consultorios", label: "Consultorios", icon: Building2 },
  { href: "/admin/especialidades", label: "Especialidades", icon: ClipboardList },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex flex-col h-full bg-card border-r">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">MediCitas</h2>
            <p className="text-xs text-muted-foreground">Panel Admin</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {user?.persona.nombre.charAt(0)}
              {user?.persona.apellido.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.persona.nombre} {user?.persona.apellido}
            </p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
