"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchIcon, PlusIcon } from "lucide-react"
import type { OfertaTrabajo } from "@/types/ofertas"

interface ListaOfertasProps {
  ofertas: OfertaTrabajo[]
  ofertaSeleccionada: OfertaTrabajo | null
  onSeleccionarOferta: (oferta: OfertaTrabajo) => void
  onNuevaOferta: () => void
  busqueda: string
  onBusquedaChange: (busqueda: string) => void
  paginaActual: number
  onPaginaChange: (pagina: number) => void
  totalPaginas: number
  elementosPorPagina: number
  onElementosPorPaginaChange: (elementos: number) => void
}

export function ListaOfertas({
  ofertas,
  ofertaSeleccionada,
  onSeleccionarOferta,
  onNuevaOferta,
  busqueda,
  onBusquedaChange,
  paginaActual,
  onPaginaChange,
  totalPaginas,
  elementosPorPagina,
  onElementosPorPaginaChange,
}: ListaOfertasProps) {
  const [ordenarPor, setOrdenarPor] = useState<string>("recientes")

  // Ordenar ofertas según el criterio seleccionado
  const ofertasOrdenadas = [...ofertas].sort((a, b) => {
    if (ordenarPor === "recientes") {
      return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    } else {
      return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
    }
  })

  // Función para determinar la fase actual de una oferta
  const obtenerFaseActual = (oferta) => {
    if (!oferta.candidatos || oferta.candidatos.length === 0) {
      return "Sin candidatos"
    }

    // Contar candidatos por fase
    const fases = oferta.candidatos.map((c) => c.estado)
    const conteoFases = {}
    fases.forEach((fase) => {
      conteoFases[fase] = (conteoFases[fase] || 0) + 1
    })

    // Determinar la fase predominante
    let faseActual = "Recepción de CVs"
    let maxCandidatos = 0

    for (const [fase, cantidad] of Object.entries(conteoFases)) {
      if (cantidad > maxCandidatos) {
        maxCandidatos = cantidad
        faseActual = fase
      }
    }

    return faseActual
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Barra superior con búsqueda y botón nueva oferta */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar"
            className="pl-8"
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Button onClick={onNuevaOferta} className="bg-navy text-white hover:bg-navy/90 ml-auto">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva oferta
          </Button>
        </div>
      </div>

      {/* Ordenar por */}
      <div className="flex justify-end items-center">
        <span className="text-sm text-gray-500 mr-2">Ordenar por:</span>
        <Select value={ordenarPor} onValueChange={setOrdenarPor}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar orden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recientes">Más recientes</SelectItem>
            <SelectItem value="antiguos">Más antiguos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de tarjetas de ofertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ofertasOrdenadas.map((oferta) => (
          <Card
            key={oferta.id}
            className={`cursor-pointer hover:border-gray-400 transition-colors ${
              ofertaSeleccionada?.id === oferta.id ? "border-primary" : ""
            }`}
            onClick={() => onSeleccionarOferta(oferta)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <h3 className="text-xl font-semibold text-center">{oferta.titulo}</h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Fase actual:</span>
                    <span className="text-sm text-green-600">{obtenerFaseActual(oferta)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Candidatos:</span>
                    <span className="text-sm text-green-600 font-medium">{oferta.candidatos.length}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Creada el:</span>
                    <span className="text-sm">{format(oferta.fechaCreacion, "dd/MM/yyyy", { locale: es })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ofertasOrdenadas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No hay ofertas disponibles</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Crea una nueva oferta para comenzar.</p>
          <Button onClick={onNuevaOferta}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva oferta
          </Button>
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
          <div className="text-sm text-gray-500">
            Mostrando {ofertas.length} de {ofertas.length} resultados
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Mostrar:</span>
            <Select
              value={elementosPorPagina.toString()}
              onValueChange={(value) => onElementosPorPaginaChange(Number.parseInt(value))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="5" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
            <Pagination currentPage={paginaActual} totalPages={totalPaginas} onPageChange={onPaginaChange} />
          </div>
        </div>
      )}
    </div>
  )
}
