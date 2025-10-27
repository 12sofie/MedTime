"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, Calendar, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const menuItems = [
  { href: "/paciente/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/paciente/medicos", label: "Médicos", icon: Users },
  { href: "/paciente/citas", label: "Mis Citas", icon: Calendar },
]

export function PacienteSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#E2E8F0] w-64">
      <div className="p-6 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#4A9B9B] to-[#3A8B8B] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-[#2C5282]">MedTime</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-[#4A9B9B] text-white" : "text-[#2C5282] hover:bg-[#F0F4F8]",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#E2E8F0] space-y-3">
        <div className="bg-[#F0F4F8] rounded-lg p-3">
          <p className="text-xs font-semibold text-[#2C5282] mb-1">Usuario Actual</p>
          <p className="text-sm text-[#718096]">Cliente</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium w-full"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
