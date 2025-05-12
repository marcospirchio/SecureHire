"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { HomeIcon, PackageIcon, LineChartIcon, UsersIcon, Package2Icon, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarInput,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AppSidebar() {
  const [mostrarCandidatos, setMostrarCandidatos] = useState(false)
  const [filtroReputacion, setFiltroReputacion] = useState<number | null>(null)
  const [filtroPuesto, setFiltroPuesto] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()

  const puestosDisponibles = ["Diseñador UX", "Desarrollador Frontend", "Product Manager", "Desarrollador Backend"]

  const filtrarCandidatos = () => {
    // Esta función se llamará cuando se cambien los filtros
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex h-16 items-center px-4 justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2Icon className="h-6 w-6" />
            <span className="">SecureHire</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Cambiar tema</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-4 py-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive>
              <Link href="#">
                <HomeIcon className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#">
                <PackageIcon className="h-4 w-4" />
                <span>Alertas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/ofertas">
                <UsersIcon className="h-4 w-4" />
                <span>Mis búsquedas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        <SidebarGroup className="px-4">
          <SidebarGroupLabel
            onClick={() => setMostrarCandidatos(!mostrarCandidatos)}
            className="cursor-pointer hover:text-foreground"
          >
            CANDIDATOS
          </SidebarGroupLabel>

          <SidebarGroupContent
            className={`overflow-hidden transition-all duration-300 ${
              mostrarCandidatos ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            {/* Filtros */}
            <div className="space-y-4 mb-4">
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Puesto solicitado</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-xs h-8">
                      {filtroPuesto || "Todos los puestos"}
                      <span className="ml-2">▼</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                    <DropdownMenuItem
                      onClick={() => {
                        setFiltroPuesto(null)
                        filtrarCandidatos()
                      }}
                    >
                      Todos los puestos
                    </DropdownMenuItem>
                    {puestosDisponibles.map((puesto) => (
                      <DropdownMenuItem
                        key={puesto}
                        onClick={() => {
                          setFiltroPuesto(puesto)
                          filtrarCandidatos()
                        }}
                      >
                        {puesto}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Reputación</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between text-xs h-8">
                      {filtroReputacion !== null ? `${filtroReputacion} estrellas` : "Todas las reputaciones"}
                      <span className="ml-2">▼</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                    <DropdownMenuItem
                      onClick={() => {
                        setFiltroReputacion(null)
                        filtrarCandidatos()
                      }}
                    >
                      Todas las reputaciones
                    </DropdownMenuItem>
                    {[1, 2, 3, 4, 5].map((valor) => (
                      <DropdownMenuItem
                        key={valor}
                        onClick={() => {
                          setFiltroReputacion(valor)
                          filtrarCandidatos()
                        }}
                      >
                        {valor} {valor === 1 ? "estrella" : "estrellas"}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Lista de candidatos */}
            <div className="mt-2">
              <SidebarInput placeholder="Buscar candidatos..." className="mb-2" />
              <ScrollArea className="h-[calc(100vh-22rem)]">
                <div className="candidate-list space-y-2 pr-2">
                  {/* Placeholder para candidatos */}
                  {[1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="p-2 rounded-md border border-border bg-card hover:border-primary cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm">Candidato {index}</h3>
                          <p className="text-xs text-muted-foreground">Puesto ejemplo</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Pendiente
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarMenu className="px-4 py-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#">
                <LineChartIcon className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <img
                src="/placeholder.svg?height=32&width=32"
                width="32"
                height="32"
                alt="Avatar"
                className="rounded-full"
              />
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
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
