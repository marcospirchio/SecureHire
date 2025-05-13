"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

interface ListaCandidatosFiltrableProps {
  candidatos: any[]
  onSelectCandidato: (candidato: any) => void
  selectedCandidatoId: string | null
  renderCandidato: (candidato: any, isSelected: boolean) => React.ReactNode
}

export function ListaCandidatosFiltrable({
  candidatos = [], // Proporcionar un array vacío como valor predeterminado
  onSelectCandidato,
  selectedCandidatoId,
  renderCandidato,
}: ListaCandidatosFiltrableProps) {
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  // Verificar que candidatos sea un array antes de filtrar
  const candidatosFiltrados = Array.isArray(candidatos)
    ? candidatos.filter((candidato) => {
        // Verificar que candidato tenga las propiedades necesarias
        const nombre = candidato?.nombre || ""
        const email = candidato?.email || ""
        const estado = candidato?.estado || ""

        const coincideBusqueda =
          nombre.toLowerCase().includes(busqueda.toLowerCase()) || email.toLowerCase().includes(busqueda.toLowerCase())

        const coincideEstado = filtroEstado === "todos" || estado === filtroEstado

        return coincideBusqueda && coincideEstado
      })
    : []

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar candidatos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Nuevo">Nuevos</SelectItem>
              <SelectItem value="En proceso">En proceso</SelectItem>
              <SelectItem value="Entrevistado">Entrevistados</SelectItem>
              <SelectItem value="Aprobado">Aprobados</SelectItem>
              <SelectItem value="Rechazado">Rechazados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {candidatosFiltrados.length > 0 ? (
          candidatosFiltrados.map((candidato) => (
            <div key={candidato.id} onClick={() => onSelectCandidato(candidato)}>
              {renderCandidato(candidato, candidato.id === selectedCandidatoId)}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron candidatos</p>
            {(busqueda || filtroEstado !== "todos") && (
              <Button
                variant="link"
                onClick={() => {
                  setBusqueda("")
                  setFiltroEstado("todos")
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
