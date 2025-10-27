"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { PacienteSidebar } from "@/components/paciente-sidebar"

export default function PacienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["paciente"]}>
      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 flex-shrink-0">
          <PacienteSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
