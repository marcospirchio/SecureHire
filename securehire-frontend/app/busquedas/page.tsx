"use client"

import { useState } from "react"
import { PlusIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogoNuevaOferta } from "@/components/ofertas/dialogo-nueva-oferta"
import { ofertasEjemplo } from "@/data/ofertas"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function MisBusquedasPage() {
  const [busqueda, setBusqueda] = useState("")
  const [ordenarPor, setOrdenarPor] = useState("recientes")
  const [mostrarDialogoNuevaOferta, setMostrarDialogoNuevaOferta] = useState(false)

  // Filtrar ofertas por búsqueda
  const ofertasFiltradas = ofertasEjemplo.filter((oferta) =>
    oferta.titulo.toLowerCase().includes(busqueda.toLowerCase()),
  )

  // Ordenar ofertas
  const ofertasOrdenadas = [...ofertasFiltradas].sort((a, b) => {
    if (ordenarPor === "antiguos") {
      return a.fechaCreacion.getTime() - b.fechaCreacion.getTime()
    } else {
      return b.fechaCreacion.getTime() - a.fechaCreacion.getTime()
    }
  })

  // Función para determinar el color de la fase
  const getColorFase = (fase: string) => {
    return "text-green-600"
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Barra superior con búsqueda, filtro y botón nueva oferta */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-96">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar"
              className="pl-8"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm whitespace-nowrap">Ordenar por:</span>
              <Select value={ordenarPor} onValueChange={setOrdenarPor}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Más recientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recientes">Más recientes</SelectItem>
                  <SelectItem value="antiguos">Más antiguos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setMostrarDialogoNuevaOferta(true)} className="ml-auto md:ml-0">
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva oferta
            </Button>
          </div>
        </div>

        {/* Grid de tarjetas de ofertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ofertasOrdenadas.map((oferta) => (
            <Card key={oferta.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <h3 className="text-xl font-semibold mb-1">{oferta.titulo}</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Fase actual:</span>
                    <span className={`text-sm ${getColorFase(oferta.estado)}`}>
                      {oferta.estado === "Activa"
                        ? "Webinar informativo"
                        : oferta.estado === "Cerrada"
                          ? "Entrevistas finales"
                          : oferta.estado === "Pausada"
                            ? "Filtrado de cv"
                            : oferta.estado === "Borrador"
                              ? "Psicotecnicos"
                              : "Entrevistas 1v1"}
                    </span>
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <DialogoNuevaOferta
        open={mostrarDialogoNuevaOferta}
        onOpenChange={setMostrarDialogoNuevaOferta}
        onGuardar={(nuevaOferta) => {
          // Aquí iría la lógica para guardar la nueva oferta
          setMostrarDialogoNuevaOferta(false)
        }}
      />
    </div>
  )
}
