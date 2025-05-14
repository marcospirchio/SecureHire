"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Tipo para las ofertas de trabajo
interface JobOffer {
  id: string
  title: string
  phase: string
  phaseColor: string
  candidates: number
  createdAt: string
}

export default function BusquedasPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  // Datos de ejemplo para las ofertas de trabajo
  const jobOffers: JobOffer[] = [
    {
      id: "1",
      title: "Product Manager",
      phase: "Sin candidatos",
      phaseColor: "green",
      candidates: 0,
      createdAt: "05/05/2025",
    },
    {
      id: "2",
      title: "Diseñador UX/UI",
      phase: "Pendiente de confirmación",
      phaseColor: "green",
      candidates: 1,
      createdAt: "20/04/2025",
    },
    {
      id: "3",
      title: "Desarrollador Frontend",
      phase: "Entrevista confirmada",
      phaseColor: "green",
      candidates: 2,
      createdAt: "15/04/2025",
    },
  ]

  // Función para manejar el cambio en el campo de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Función para manejar el cambio en el selector de ordenamiento
  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  // Filtrar ofertas según la búsqueda
  const filteredOffers = jobOffers.filter((offer) => offer.title.toLowerCase().includes(searchQuery.toLowerCase()))

  // Ordenar ofertas según el criterio seleccionado
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    if (sortBy === "recent") {
      // Convertir fechas para comparar (formato DD/MM/YYYY)
      const dateA = a.createdAt.split("/").reverse().join("")
      const dateB = b.createdAt.split("/").reverse().join("")
      return dateB.localeCompare(dateA)
    } else if (sortBy === "candidates") {
      return b.candidates - a.candidates
    }
    return 0
  })

  // Función para navegar al detalle de la oferta
  const handleJobOfferClick = (id: string) => {
    router.push(`/busquedas/${id}`)
  }

  // Función para navegar a la página de nueva oferta
  const handleNewJobOffer = () => {
    router.push("/busquedas/nueva-oferta")
  }

  return (
    <Sidebar>
      <DashboardLayout>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-7 w-7 p-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-3 w-3" />
            </Button>
            <div className="relative flex-1 sm:w-[250px]">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar ofertas..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="h-7 w-full rounded-md border border-gray-200 bg-white pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 whitespace-nowrap text-xs">Ordenar por:</span>
              <Select defaultValue="recent" onValueChange={handleSortChange}>
                <SelectTrigger className="w-[120px] h-7 border-gray-200 bg-white text-xs">
                  <SelectValue placeholder="Más recientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="candidates">Más candidatos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              size="sm"
              className="bg-[#111827] hover:bg-gray-800 text-white ml-auto sm:ml-0 h-7 text-xs"
              onClick={handleNewJobOffer}
            >
              <Plus className="mr-1 h-3 w-3" /> Nueva oferta
            </Button>
          </div>
        </div>

        <div className="mt-6"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {sortedOffers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-lg border bg-white p-3 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => handleJobOfferClick(offer.id)}
            >
              <h3 className="text-sm font-bold mb-2">{offer.title}</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fase actual:</span>
                  <span className={`font-medium text-${offer.phaseColor}-600`}>{offer.phase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Candidatos:</span>
                  <span className={`font-medium ${offer.candidates > 0 ? "text-green-600" : ""}`}>
                    {offer.candidates}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Creada el:</span>
                  <span className="font-medium">{offer.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    </Sidebar>
  )
}
