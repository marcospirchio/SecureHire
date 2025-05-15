"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Calendar, Users, Bell, MoreVertical, ChevronLeft, ChevronRight, Menu, User, LogOut } from "lucide-react"
import React from "react"
import Image from "next/image"

// Crear contexto para el estado de la sidebar
interface SidebarContextType {
  collapsed: boolean
  hidden: boolean
  toggleCollapse: () => void
  toggleVisibility: () => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProps {
  children?: React.ReactNode
  onToggle?: (expanded: boolean) => void
}

export function Sidebar({ children, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setCollapsed(true)
        setHidden(true)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const toggleCollapse = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    onToggle?.(!newCollapsed)
  }

  const toggleVisibility = () => {
    setHidden(!hidden)
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById("user-menu")
      if (menu && !menu.contains(event.target as Node) && !(event.target as Element).closest("button")) {
        menu.classList.add("hidden")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    // Redirigir al usuario a la página de login
    router.push("/login")
  }

  return (
    <SidebarContext.Provider value={{ collapsed, hidden, toggleCollapse, toggleVisibility }}>
      {/* Mobile menu button */}
      <button
        onClick={toggleVisibility}
        className={`fixed left-4 top-4 z-50 rounded-md bg-white p-2 shadow-md md:hidden ${hidden ? "block" : "hidden"}`}
      >
        <Menu className="h-5 w-5 text-gray-500" />
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
          hidden ? "-translate-x-full" : "translate-x-0"
        } ${collapsed ? "w-[70px]" : "w-[250px]"}`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="h-8 w-8 relative">
                <Image src="/logo-securehire.png" alt="SecureHire Logo" fill style={{ objectFit: "contain" }} />
              </div>
              <span>SecureHire</span>
            </Link>
          ) : (
            <Link href="/" className="mx-auto">
              <div className="h-8 w-8 relative">
                <Image src="/logo-securehire.png" alt="SecureHire Logo" fill style={{ objectFit: "contain" }} />
              </div>
            </Link>
          )}
          <button onClick={toggleVisibility} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 md:hidden">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col overflow-y-auto p-3">
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                isActive("/") ? "bg-gray-100 font-medium text-gray-900" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Home className="h-5 w-5" />
              {!collapsed && <span>Inicio</span>}
            </Link>
            <Link
              href="/calendario"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                isActive("/calendario") ? "bg-gray-100 font-medium text-gray-900" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Calendar className="h-5 w-5" />
              {!collapsed && <span>Calendario</span>}
            </Link>
            <Link
              href="/busquedas"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                isActive("/busquedas") ? "bg-gray-100 font-medium text-gray-900" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Users className="h-5 w-5" />
              {!collapsed && <span>Mis ofertas de trabajo</span>}
            </Link>
            <Link
              href="/notificaciones"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                isActive("/notificaciones") ? "bg-gray-100 font-medium text-gray-900" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Bell className="h-5 w-5" />
              {!collapsed && <span>Notificaciones</span>}
            </Link>
          </nav>
        </div>

        {/* Footer with user info */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                <img src="/diverse-avatars.png" alt="Carlos Rodríguez" className="h-full w-full object-cover" />
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm font-medium">Carlos Rodríguez</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="relative">
                <button
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    const menu = document.getElementById("user-menu")
                    menu?.classList.toggle("hidden")
                  }}
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                <div
                  id="user-menu"
                  className="hidden absolute right-0 bottom-10 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                >
                  <Link href="/perfil" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi perfil</span>
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapse/Expand button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm hover:bg-gray-50"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>
      {children}
    </SidebarContext.Provider>
  )
}
