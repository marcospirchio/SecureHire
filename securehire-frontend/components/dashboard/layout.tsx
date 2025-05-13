"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { collapsed, hidden } = useSidebar()
  const pathname = usePathname()

  // Determinar si estamos en la página de inicio
  const isHomePage = pathname === "/"

  // Calcular el ancho máximo del contenido basado en el estado de la sidebar
  const getMaxWidth = () => {
    if (hidden) {
      return "calc(100vw - 16px)" // Reducido de 20px a 16px
    } else if (collapsed) {
      return "calc(100vw - 80px)" // Reducido de 90px a 80px
    } else {
      return "calc(100vw - 260px)" // Reducido de 270px a 260px
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div
        className={`transition-all duration-300 ease-in-out ${
          hidden ? "ml-0" : collapsed ? "ml-[70px]" : "ml-[250px]"
        }`}
      >
        {/* Mostrar el Header solo en la página de inicio */}
        {isHomePage && <Header />}
        <main
          className="flex flex-1 flex-col gap-4 p-3 md:p-4 pb-16 overflow-x-hidden"
          style={{ maxWidth: getMaxWidth() }}
        >
          <div
            className="w-full transition-all duration-300 ease-in-out min-h-[calc(100vh-120px)]"
            style={{
              maxWidth: hidden ? "1400px" : collapsed ? "1300px" : "1200px",
              margin: "0 auto",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
