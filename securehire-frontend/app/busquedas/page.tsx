"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"

interface JobOffer {
  id: string
  title: string
  phase: string
  phaseColor: string
  candidates: number
  createdAt: string
}

interface ConteoPostulaciones {
  busquedaId: string
  cantidad: number
}

export default function BusquedasPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conteoPostulaciones, setConteoPostulaciones] = useState<ConteoPostulaciones[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      try {
        const endpoint = searchQuery.trim()
          ? `http://localhost:8080/api/busquedas/buscar?titulo=${encodeURIComponent(searchQuery)}`
          : "http://localhost:8080/api/busquedas?page=0&size=100"
  
        const response = await fetch(endpoint, {
          credentials: "include"
        })
  
        if (!response.ok) throw new Error("Error al buscar ofertas")
  
        const data = await response.json()
        const offersArray = Array.isArray(data.content) ? data.content : data
  
        setJobOffers(offersArray.map((offer: any) => ({
          id: offer.id,
          title: offer.titulo,
          phase: offer.faseActual || "Sin candidatos",
          phaseColor: "green",
          candidates: conteoPostulaciones.find(c => c.busquedaId === offer.id)?.cantidad || 0,
          createdAt: new Date(offer.fechaCreacion).toLocaleDateString("es-AR")
        })))
      } catch (err) {
        console.error("Error buscando:", err)
        setError("No se pudieron cargar las ofertas")
      }
    }, 150)
  
    return () => clearTimeout(delayDebounce)
  }, [searchQuery, conteoPostulaciones])
  

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch()
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  useEffect(() => {
    const fetchJobOffers = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/busquedas?page=0&size=100", {
          credentials: "include"
        })
        if (!response.ok) throw new Error("Error al cargar las ofertas")

        const data = await response.json()
        const offersArray = Array.isArray(data.content) ? data.content : []

        const conteoResponse = await fetch("http://localhost:8080/api/postulaciones/conteo-por-busqueda", {
          credentials: "include"
        })
        if (!conteoResponse.ok) throw new Error("Error al cargar el conteo de postulaciones")

        const conteoData = await conteoResponse.json()
        setConteoPostulaciones(conteoData)

        const formattedOffers = offersArray.map((offer: any) => {
          const conteo = conteoData.find((c: ConteoPostulaciones) => c.busquedaId === offer.id)
          return {
            id: offer.id,
            title: offer.titulo,
            phase: offer.faseActual || "Sin candidatos",
            phaseColor: "green",
            candidates: conteo?.cantidad || 0,
            createdAt: new Date(offer.fechaCreacion).toLocaleDateString("es-AR")
          }
        })

        setJobOffers(formattedOffers)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("No se pudieron cargar las ofertas")
        setLoading(false)
      }
    }

    if (user) {
      fetchJobOffers()
    }
  }, [user])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      const response = await fetch(`http://localhost:8080/api/busquedas/buscar?titulo=${encodeURIComponent(searchQuery)}`, {
        credentials: "include"
      })
      if (!response.ok) throw new Error("Error en la búsqueda")

      const data = await response.json()
      const offersArray = Array.isArray(data) ? data : []

      setJobOffers(offersArray.map((offer: any) => ({
        id: offer.id,
        title: offer.titulo,
        phase: offer.faseActual || "Sin candidatos",
        phaseColor: "green",
        candidates: conteoPostulaciones.find(c => c.busquedaId === offer.id)?.cantidad || 0,
        createdAt: new Date(offer.fechaCreacion).toLocaleDateString("es-AR")
      })))
    } catch (err) {
      console.error("Error en la búsqueda:", err)
      setError("Error al realizar la búsqueda")
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const sortedOffers = [...jobOffers].sort((a, b) => {
    if (sortBy === "recent") {
      const dateA = a.createdAt.split("/").reverse().join("")
      const dateB = b.createdAt.split("/").reverse().join("")
      return dateB.localeCompare(dateA)
    } else if (sortBy === "candidates") {
      return b.candidates - a.candidates
    }
    return 0
  })

  const handleJobOfferClick = (id: string) => {
    router.push(`/busquedas/${id}`)
  }

  const handleNewJobOffer = () => {
    router.push("/busquedas/nueva-oferta")
  }

  if (loading) {
    return (
      <Sidebar>
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <p>Cargando...</p>
          </div>
        </DashboardLayout>
      </Sidebar>
    )
  }

  if (error) {
    return (
      <Sidebar>
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <p className="text-red-500">{error}</p>
          </div>
        </DashboardLayout>
      </Sidebar>
    )
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
              className="bg-gray-900 hover:bg-gray-800 h-7 text-xs"
              onClick={handleNewJobOffer}
            >
              <Plus className="mr-1 h-3 w-3" /> Nueva oferta
            </Button>
          </div>
        </div>

        <div className="mt-6"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {sortedOffers.length > 0 ? (
            sortedOffers.map((offer) => (
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
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              No tienes ofertas publicadas. ¡Crea una nueva oferta para comenzar!
            </div>
          )}
        </div>
      </DashboardLayout>
    </Sidebar>
  )
}
