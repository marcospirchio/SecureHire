"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { AlertTriangleIcon, CheckCircleIcon, XCircleIcon, ChevronDownIcon } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import type { Candidato } from "@/types/candidato"
import type { OfertaTrabajo } from "@/types/ofertas"

interface ListaCandidatosProps {
  candidatos: Candidato[]
  ofertaSeleccionada: OfertaTrabajo
  mostrarSoloExcluyentes: boolean
  setMostrarSoloExcluyentes: (value: boolean) => void
  ordenarPor: string | null
  setOrdenarPor: (value: string | null) => void
  onSelectCandidato: (candidato: Candidato) => void
  onRechazarCandidato: (id: number) => void
  paginaActual: number
  totalPaginas: number
  candidatosPorPagina: number
  totalCandidatos: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
}

export function ListaCandidatos({
  candidatos,
  ofertaSeleccionada,
  mostrarSoloExcluyentes,
  setMostrarSoloExcluyentes,
  ordenarPor,
  setOrdenarPor,
  onSelectCandidato,
  onRechazarCandidato,
  paginaActual,
  totalPaginas,
  candidatosPorPagina,
  totalCandidatos,
  onPageChange,
  onItemsPerPageChange,
}: ListaCandidatosProps) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="mostrar-excluyentes"
              checked={mostrarSoloExcluyentes}
              onCheckedChange={(checked) => setMostrarSoloExcluyentes(checked as boolean)}
            />
            <label htmlFor="mostrar-excluyentes" className="text-sm font-medium cursor-pointer">
              Solo candidatos que cumplen requisitos excluyentes
            </label>
          </div>
        </div>

        <Select value={ordenarPor || ""} onValueChange={(value) => setOrdenarPor(value || null)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reputacion-desc">Reputación (mayor a menor)</SelectItem>
            <SelectItem value="reputacion-asc">Reputación (menor a mayor)</SelectItem>
            <SelectItem value="edad-desc">Edad (mayor a menor)</SelectItem>
            <SelectItem value="edad-asc">Edad (menor a mayor)</SelectItem>
            <SelectItem value="tiempo-respuesta">Tiempo de respuesta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {candidatos.length > 0 ? (
        <div className="space-y-4">
          {candidatos.map((candidato) => (
            <Card
              key={candidato.id}
              className={`${
                !candidato.cumpleRequisitosExcluyentes ? "border-yellow-400 dark:border-yellow-600" : ""
              } cursor-pointer hover:border-primary transition-colors`}
              onClick={() => onSelectCandidato(candidato)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{candidato.nombre}</h3>
                      {!candidato.cumpleRequisitosExcluyentes && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
                        >
                          <AlertTriangleIcon className="h-3 w-3 mr-1" />
                          No cumple requisitos excluyentes
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Edad:</span> {candidato.edad} años
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Sexo:</span> {candidato.sexo}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Reputación:</span> {candidato.reputacion}/5
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Tiempo de respuesta:</span>{" "}
                        {candidato.tiempoRespuesta}
                      </div>
                    </div>

                    {ofertaSeleccionada.formulario && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2">Respuestas al formulario:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {ofertaSeleccionada.formulario.campos.map((campo) => (
                            <div key={campo.id} className="text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                {campo.etiqueta}
                                {campo.esExcluyente && <span className="text-red-500 ml-1">*</span>}:
                              </span>{" "}
                              {campo.tipo === "checkbox" ? (
                                candidato.respuestas[campo.id] ? (
                                  <CheckCircleIcon className="inline h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircleIcon className="inline h-4 w-4 text-red-500" />
                                )
                              ) : (
                                candidato.respuestas[campo.id]
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRechazarCandidato(candidato.id)
                      }}
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <ChevronDownIcon className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectCandidato(candidato)
                          }}
                        >
                          Ver perfil completo
                        </DropdownMenuItem>
                        <DropdownMenuItem>Programar entrevista</DropdownMenuItem>
                        <DropdownMenuItem>Enviar mensaje</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRechazarCandidato(candidato.id)
                          }}
                        >
                          Rechazar candidato
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {totalCandidatos > 0 && (
            <Pagination
              currentPage={paginaActual}
              totalPages={totalPaginas}
              itemsPerPage={candidatosPorPagina}
              totalItems={totalCandidatos}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No hay candidatos para esta oferta</div>
      )}
    </div>
  )
}
