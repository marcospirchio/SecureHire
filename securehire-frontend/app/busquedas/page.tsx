"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface JobOffer {
  id: string
  title: string
  phase: string
  createdAt: string
  candidates: number
}

interface BusquedaData {
  id: string
  titulo: string
  faseActual?: string
  fechaCreacion: string
}

interface Postulacion {
  id: string
  candidatoId: string
  busquedaId: string
  fase: string
  estado: string
  fechaPostulacion: string
  candidato: {
    id: string
    nombre: string
    apellido: string
    email: string
  }
}

export default function BusquedasPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([])

  useEffect(() => {
    const fetchJobOffers = async () => {
      try {
        const [busquedasRes, conteoRes] = await Promise.all([
          fetch("http://localhost:8080/api/busquedas", { credentials: "include" }),
          fetch("http://localhost:8080/api/postulaciones/conteo-por-busqueda", { credentials: "include" }),
        ])

        if (!busquedasRes.ok || !conteoRes.ok) throw new Error("Error al obtener datos")

        const busquedasData = await busquedasRes.json()
        const conteoData: { busquedaId: string; cantidad: number }[] = await conteoRes.json()

        const conteoMap = new Map(conteoData.map(c => [c.busquedaId, c.cantidad]))

        const offers: JobOffer[] = (Array.isArray(busquedasData.content) ? busquedasData.content : busquedasData).map((b: BusquedaData) => ({
          id: b.id,
          title: b.titulo,
          phase: b.faseActual || "Sin fase",
          createdAt: new Date(b.fechaCreacion).toLocaleDateString("es-AR"),
          candidates: conteoMap.get(b.id) || 0,
        }))

        setJobOffers(offers)
      } catch (err) {
        console.error("Error al cargar búsquedas:", err)
      }
    }

    fetchJobOffers()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const filteredOffers = jobOffers.filter((offer) => offer.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const sortedOffers = [...filteredOffers].sort((a, b) => {
    if (sortBy === "recent") {
      const dateA = a.createdAt.split("/").reverse().join("")
      const dateB = b.createdAt.split("/").reverse().join("")
      return dateB.localeCompare(dateA)
    } else if (sortBy === "candidates") {
      return b.candidates - a.candidates
    }
    return 0
  })

  const handleJobOfferClick = async (id: string) => {
    try {
      const [busquedaRes, postulacionesRes] = await Promise.all([
        fetch(`http://localhost:8080/api/busquedas/${id}`, { credentials: "include" }),
        fetch(`http://localhost:8080/api/postulaciones/busqueda/${id}`, { credentials: "include" })
      ]);

      if (!busquedaRes.ok || !postulacionesRes.ok) {
        throw new Error("Error al obtener los datos");
      }

      const busquedaData = await busquedaRes.json();
      const postulacionesData = await postulacionesRes.json();

      // Guardar los datos en el estado global o en localStorage para usarlos en la siguiente página
      localStorage.setItem('busquedaSeleccionada', JSON.stringify(busquedaData));
      localStorage.setItem('postulacionesSeleccionadas', JSON.stringify(postulacionesData));

      // Navegar a la página de detalle
      router.push(`/busquedas/${id}`);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }

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
                  <span className="font-medium text-blue-600">{offer.phase}</span>
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