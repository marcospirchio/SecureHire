"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Moon, Sun, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-white dark:bg-gray-950 dark:border-gray-800 px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menú</span>
      </Button>

      <Link href="/" className="lg:hidden flex items-center gap-2 font-semibold" prefetch={false}>
        <img src="/Logo SecureHire.png" alt="SecureHire Logo" className="h-8 w-auto" />
        <span className="font-bold">SecureHire</span>
      </Link>
      <div className="w-full flex items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Cambiar tema</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-gray-200 dark:border-gray-800 w-8 h-8"
              >
                <img
                  src="/diverse-avatars.png"
                  width="32"
                  height="32"
                  className="rounded-full"
                  alt="Avatar"
                  style={{ aspectRatio: "32/32", objectFit: "cover" }}
                />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
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

      {/* Sidebar móvil */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <Sidebar />
        </SheetContent>
      </Sheet>
    </header>
  )
}
