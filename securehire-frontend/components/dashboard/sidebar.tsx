"use client"

import Link from "next/link"
import { Calendar, Home, Package2Icon, Settings, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed top-0 left-0 h-full w-[280px] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 z-30 flex flex-col">
      <div className="flex h-16 items-center border-b border-gray-200 dark:border-gray-800 shrink-0 px-4 justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold" prefetch={false}>
          <Package2Icon className="h-6 w-6" />
          <span className="">SecureHire</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="flex flex-col gap-1 px-4 text-sm font-medium">
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
              pathname === "/"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                : "text-gray-500 dark:text-gray-400"
            }`}
            prefetch={false}
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/calendario"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
              pathname === "/calendario"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                : "text-gray-500 dark:text-gray-400"
            }`}
            prefetch={false}
          >
            <Calendar className="h-4 w-4" />
            Calendario
          </Link>
          <Link
            href="/ofertas"
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
              pathname === "/ofertas"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Mis búsquedas</span>
          </Link>
          <Link
            href="/configuracion"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
              pathname === "/configuracion"
                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                : "text-gray-500 dark:text-gray-400"
            }`}
            prefetch={false}
          >
            <Settings className="h-4 w-4" />
            Configuración
          </Link>
        </nav>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <img src="/diverse-avatars.png" width="32" height="32" alt="Avatar" className="rounded-full" />
            </div>
            <span className="ml-2 text-sm font-medium">Carlos Rodríguez</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Abrir menú</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/configuracion">Configuración</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Soporte</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
