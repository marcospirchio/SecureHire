"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PlusIcon, SearchIcon, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormularioNuevaOferta } from "@/components/ofertas/formulario-nueva-oferta"
import { VistaCandidatos } from "@/components/ofertas/vista-candidatos"
import { useOfertas } from "@/hooks/use-ofertas"
import { ofertasEjemplo } from "@/data/ofertas"

export default function MisBusquedasPage() {
  const {
    ofertasFiltradas,
    ofertaSeleccionada,
    setOfertaSeleccionada,
    busquedaOfertas,
    setBusquedaOfertas,
    crearNuevaOferta,
    guardarFormulario,
  } = useOfertas(ofertasEjemplo)

  const [ordenarPor, setOrdenarPor] = useState<string>("recientes")
  const [mostrarFormularioNuevaOferta, setMostrarFormularioNuevaOferta] = useState(false)

  // Detectar parámetro de URL para mostrar el formulario de nueva oferta
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("nuevaOferta") === "true") {
      setMostrarFormularioNuevaOferta(true)
    }
  }, [])

  // Ordenar ofertas según el criterio seleccionado
  const ofertasOrdenadas = [...ofertasFiltradas].sort((a, b) => {
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

  const handleCrearOfertaConFormulario = (titulo, descripcion, preguntas) => {
    // Convertir las preguntas al formato esperado por el backend
    const camposFormulario = preguntas.map((pregunta) => ({
      id: pregunta.id,
      tipo: pregunta.tipo === "opcion_multiple" ? "dropdown" : pregunta.tipo === "checkbox" ? "checkbox" : "texto",
      etiqueta: pregunta.texto,
      esExcluyente: pregunta.esExcluyente,
      opciones: pregunta.opciones?.map((opt) => opt.texto) || [],
    }))

    // Crear la oferta con el formulario
    crearNuevaOferta(titulo, descripcion)

    // Cerrar el formulario
    setMostrarFormularioNuevaOferta(false)
  }

  // Si estamos mostrando el formulario de nueva oferta
  if (mostrarFormularioNuevaOferta) {
    return (
      <FormularioNuevaOferta
        onVolver={() => setMostrarFormularioNuevaOferta(false)}
        onGuardar={handleCrearOfertaConFormulario}
      />
    )
  }

  // Si hay una oferta seleccionada, mostrar la vista de candidatos
  if (ofertaSeleccionada) {
    return <VistaCandidatos oferta={ofertaSeleccionada} onVolver={() => setOfertaSeleccionada(null)} />
  }

  // Si no hay oferta seleccionada, mostrar la lista de ofertas
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Barra superior con búsqueda y botón nueva oferta */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center w-full sm:w-auto">
            <Link href="/">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
            <div className="relative w-full sm:w-96">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar"
                className="pl-8"
                value={busquedaOfertas}
                onChange={(e) => setBusquedaOfertas(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button
              onClick={() => setMostrarFormularioNuevaOferta(true)}
              className="bg-navy text-white hover:bg-navy/90 ml-auto"
            >
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
              className="cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => setOfertaSeleccionada(oferta)}
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
            <Button onClick={() => setMostrarFormularioNuevaOferta(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva oferta
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
