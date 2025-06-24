"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

interface DashboardLayoutProps {
  children: ReactNode,
  customHeader?: ReactNode
}

export function DashboardLayout({ children, customHeader }: DashboardLayoutProps) {
  const { collapsed, hidden } = useSidebar()
  const pathname = usePathname()

  // Determinar si estamos en la página de inicio
  const isHomePage = pathname === "/"

  
  const getMaxWidth = () => {
    if (hidden) {
      return "100vw"
    } else if (collapsed) {
      return "calc(100vw - 70px)"
    } else {
      return "calc(100vw - 250px)"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div
        className={`transition-all duration-300 ease-in-out ${
          hidden ? "ml-0" : collapsed ? "ml-[70px]" : "ml-[250px]"
        }`}
        style={{
          width: getMaxWidth(),
          maxWidth: "100vw",
          overflowX: "hidden"
        }}
      >
        {/* HEADER: custom o global solo en home */}
        {customHeader ? customHeader : isHomePage && <Header />}
        <main
          className="flex flex-1 flex-col gap-4 p-3 md:p-4 pb-16"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%"
          }}
        >
          <div className="w-full transition-all duration-300 ease-in-out min-h-[calc(100vh-120px)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
