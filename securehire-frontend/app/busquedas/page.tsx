"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Search, Archive, ArchiveRestore } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"

interface JobOffer {
  id: string
  title: string
  createdAt: string
  candidates: number
  archivada: boolean
}

interface BusquedaData {
  id: string
  titulo: string
  fechaCreacion: string
  archivada: boolean
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

interface CampoAdicional {
  nombre: string;
  tipo: "texto" | "select" | "checkbox";
  esExcluyente: boolean;
  opciones: string[];
  valoresExcluyentes: string[];
  obligatorio: boolean;
}

export default function BusquedasPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [showArchived, setShowArchived] = useState(false)
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    const fetchJobOffers = async () => {
      try {
        console.log('Iniciando fetchJobOffers...')
        
        const [busquedasRes, conteoRes] = await Promise.all([
          fetch("http://localhost:8080/api/busquedas", { credentials: "include" }),
          fetch("http://localhost:8080/api/postulaciones/conteo-por-busqueda", { credentials: "include" }),
        ])

        if (!busquedasRes.ok || !conteoRes.ok) throw new Error("Error al obtener datos")

        const busquedasData = await busquedasRes.json()
        const conteoData: { busquedaId: string; cantidad: number; estado: string }[] = await conteoRes.json()

        console.log('=== DATOS DEL BACKEND ===')
        console.log('Busquedas recibidas:')
        console.table(busquedasData)
        console.log('Conteo de postulaciones:')
        console.table(conteoData)

        // Filtrar solo las postulaciones activas (no finalizadas)
        const conteoActivos = conteoData.reduce((acc, curr) => {
          if (curr.estado?.toUpperCase() !== "FINALIZADA") {
            acc[curr.busquedaId] = (acc[curr.busquedaId] || 0) + curr.cantidad
          }
          return acc
        }, {} as Record<string, number>)

        console.log('=== CONTEOS ACTIVOS ===')
        console.table(conteoActivos)

        // Asegurarnos de que busquedasData sea un array
        const busquedasArray = Array.isArray(busquedasData) ? busquedasData : 
                             Array.isArray(busquedasData.content) ? busquedasData.content : 
                             [busquedasData]

        console.log('=== BÚSQUEDAS PROCESADAS ===')
        console.table(busquedasArray.map((b: { _id?: string; id?: string; titulo: string; fechaCreacion: string; usuarioId: string }) => ({
          id: b._id || b.id,
          titulo: b.titulo,
          fechaCreacion: b.fechaCreacion,
          usuarioId: b.usuarioId
        })))

        const offers: JobOffer[] = busquedasArray.map((b: any) => ({
          id: b._id || b.id,
          title: b.titulo || "",
          createdAt: new Date(b.fechaCreacion).toLocaleDateString("es-AR"),
          candidates: conteoActivos[b._id || b.id] || 0,
          archivada: b.archivada || false
        }))

        console.log('=== OFERTAS FINALES ===')
        console.table(offers)
        setJobOffers(offers)
        // Resetear a la primera página cuando se cargan nuevos datos
        setCurrentPage(1)
      } catch (err) {
        console.error("Error al cargar búsquedas:", err)
        toast({
          title: "Error",
          description: "No se pudieron cargar las búsquedas. Por favor, intente nuevamente.",
          variant: "destructive",
        })
      }
    }

    fetchJobOffers()
  }, [toast])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const handleArchiveToggle = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:8080/api/busquedas/${id}/archivar?archivar=${!currentStatus}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include"
      })

      if (!response.ok) throw new Error("Error al actualizar el estado de archivo")

      // Actualizar el estado local
      setJobOffers(prev => prev.map(offer => 
        offer.id === id 
          ? { ...offer, archivada: !currentStatus }
          : offer
      ))

      toast({
        title: currentStatus ? "Búsqueda desarchivada" : "Búsqueda archivada",
        description: currentStatus 
          ? "La búsqueda ha sido desarchivada correctamente."
          : "La búsqueda ha sido archivada correctamente.",
      })
    } catch (error) {
      console.error("Error al archivar/desarchivar búsqueda:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la búsqueda.",
        variant: "destructive",
      })
    }
  }

  // Aplicar filtros y ordenamiento
  const filteredOffers = useMemo(() => {
    return jobOffers
      .filter((offer) => offer.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((offer) => offer.archivada === showArchived)
      .sort((a, b) => {
        if (sortBy === "recent") {
          const dateA = a.createdAt.split("/").reverse().join("")
          const dateB = b.createdAt.split("/").reverse().join("")
          return dateB.localeCompare(dateA)
        } else if (sortBy === "candidates") {
          return b.candidates - a.candidates
        }
        return 0
      })
  }, [jobOffers, searchQuery, showArchived, sortBy])

  // Calcular paginación
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOffers = filteredOffers.slice(startIndex, endIndex)

  // Asegurarse de que la página actual sea válida
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? (
                <>
                  <ArchiveRestore className="mr-1 h-3 w-3" /> Ver activas
                </>
              ) : (
                <>
                  <Archive className="mr-1 h-3 w-3" /> Ver archivadas
                </>
              )}
            </Button>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentOffers.map((offer) => (
            <div
              key={offer.id}
              className="rounded-lg border bg-white p-5 hover:shadow-sm transition-shadow cursor-pointer relative group min-h-[160px] flex flex-col"
              onClick={() => handleJobOfferClick(offer.id)}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-3 right-3 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArchiveToggle(offer.id, offer.archivada)
                      }}
                    >
                      {offer.archivada ? (
                        <ArchiveRestore className="h-3 w-3" />
                      ) : (
                        <Archive className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{offer.archivada ? "Desarchivar búsqueda" : "Archivar búsqueda"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <h2 className="text-xl font-bold mb-6 pr-10 line-clamp-2">{offer.title}</h2>
              <div className="space-y-5 text-sm mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Candidatos:</span>
                  <span className={`font-medium ${offer.candidates > 0 ? "text-green-600" : ""}`}>
                    {offer.candidates}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Creada el:</span>
                  <span className="font-medium">{offer.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8"
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {filteredOffers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron búsquedas que coincidan con los criterios seleccionados.
          </div>
        )}
      </DashboardLayout>
    </Sidebar>
  )
}