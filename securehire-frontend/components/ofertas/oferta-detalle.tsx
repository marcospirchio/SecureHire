"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, FileTextIcon, EditIcon } from "lucide-react"
import { ListaCandidatos } from "@/components/ofertas/lista-candidatos"
import { DetalleFormulario } from "@/components/ofertas/detalle-formulario"
import type { OfertaTrabajo } from "@/types/ofertas"
import type { Candidato } from "@/types/candidato"

interface OfertaDetalleProps {
  ofertaSeleccionada: OfertaTrabajo
  mostrarSoloExcluyentes: boolean
  setMostrarSoloExcluyentes: (value: boolean) => void
  ordenarPor: string | null
  setOrdenarPor: (value: string | null) => void
  busquedaCandidatos: string
  setBusquedaCandidatos: (value: string) => void
  candidatosFiltrados: Candidato[]
  onSelectCandidato: (candidato: Candidato) => void
  onRechazarCandidato: (id: number) => void
  setMostrarDialogoFormulario: (value: boolean) => void
}

export function OfertaDetalle({
  ofertaSeleccionada,
  mostrarSoloExcluyentes,
  setMostrarSoloExcluyentes,
  ordenarPor,
  setOrdenarPor,
  busquedaCandidatos,
  setBusquedaCandidatos,
  candidatosFiltrados,
  onSelectCandidato,
  onRechazarCandidato,
  setMostrarDialogoFormulario,
}: OfertaDetalleProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{ofertaSeleccionada.titulo}</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ofertaSeleccionada.descripcion}</p>
          </div>
          <div className="flex gap-2">
            {!ofertaSeleccionada.formulario ? (
              <Button onClick={() => setMostrarDialogoFormulario(true)}>
                <FileTextIcon className="mr-2 h-4 w-4" />
                Crear Formulario
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setMostrarDialogoFormulario(true)}>
                <EditIcon className="mr-2 h-4 w-4" />
                Editar Formulario
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <Tabs defaultValue="candidatos">
          <TabsList className="mb-4">
            <TabsTrigger value="candidatos">Candidatos</TabsTrigger>
            <TabsTrigger value="formulario">Formulario</TabsTrigger>
          </TabsList>

          <TabsContent value="candidatos">
            <div className="relative mb-4">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar candidatos por nombre..."
                value={busquedaCandidatos}
                onChange={(e) => setBusquedaCandidatos(e.target.value)}
                className="pl-8"
              />
            </div>
            <ListaCandidatos
              candidatos={candidatosFiltrados}
              ofertaSeleccionada={ofertaSeleccionada}
              mostrarSoloExcluyentes={mostrarSoloExcluyentes}
              setMostrarSoloExcluyentes={setMostrarSoloExcluyentes}
              ordenarPor={ordenarPor}
              setOrdenarPor={setOrdenarPor}
              onSelectCandidato={onSelectCandidato}
              onRechazarCandidato={onRechazarCandidato}
            />
          </TabsContent>

          <TabsContent value="formulario">
            <DetalleFormulario
              formulario={ofertaSeleccionada.formulario}
              onEditarFormulario={() => setMostrarDialogoFormulario(true)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
