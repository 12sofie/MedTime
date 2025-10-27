"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["administrador"]}>
      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 flex-shrink-0">
          <AdminSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
