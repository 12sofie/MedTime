"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { MedicoSidebar } from "@/components/medico-sidebar"

export default function MedicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["medico"]}>
      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 flex-shrink-0">
          <MedicoSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
