"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EtiquetaEstado } from "./etiqueta-estado"
import { InfoCandidato } from "./detalle-candidato/info-candidato"
import { AccionesCandidato } from "./detalle-candidato/acciones-candidato"
import { EntrevistasTab } from "./detalle-candidato/entrevistas-tab"
import { ComentariosTab } from "./detalle-candidato/comentarios-tab"
import { AnotacionesTab } from "./detalle-candidato/anotaciones-tab"
import type { Candidato, AnotacionPersonal } from "@/types/candidato"

interface DetalleCandidatoProps {
  candidato: Candidato
  onConfirmarEntrevista: () => void
  onMarcarNoAsistio: () => void
  onCancelarEntrevista: () => void
  onContactarCandidato: () => void
  onClose?: () => void
}

export function DetalleCandidato({
  candidato,
  onConfirmarEntrevista,
  onMarcarNoAsistio,
  onCancelarEntrevista,
  onContactarCandidato,
  onClose,
}: DetalleCandidatoProps) {
  const [anotaciones, setAnotaciones] = useState<AnotacionPersonal[]>(candidato.anotacionesPersonales)
  const [activeTab, setActiveTab] = useState("entrevistas")

  const guardarAnotacion = (texto: string) => {
    const nuevaAnotacionObj: AnotacionPersonal = {
      id: Date.now(),
      fecha: new Date(),
      texto,
    }

    setAnotaciones([nuevaAnotacionObj, ...anotaciones])
  }

  const eliminarAnotacion = (id: number) => {
    setAnotaciones(anotaciones.filter((a) => a.id !== id))
  }

  const editarAnotacion = (id: number, texto: string) => {
    setAnotaciones(anotaciones.map((a) => (a.id === id ? { ...a, texto, fecha: new Date() } : a)))
  }

  // Formatear el nombre completo del candidato
  const nombreCompleto = candidato.apellido ? `${candidato.nombre} ${candidato.apellido}` : candidato.nombre

  return (
    <div className="space-y-6 bg-gray-100/40 dark:bg-gray-800/40 p-6 rounded-lg">
      {onClose && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Volver a la lista
          </Button>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">{nombreCompleto}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xl">{candidato.puesto}</p>
        </div>
        <EtiquetaEstado estado={candidato.estado} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCandidato candidato={candidato} />

        <AccionesCandidato
          nombreCandidato={nombreCompleto}
          onContactarCandidato={onContactarCandidato}
          onConfirmarEntrevista={onConfirmarEntrevista}
          onMarcarNoAsistio={onMarcarNoAsistio}
          onCancelarEntrevista={onCancelarEntrevista}
        />
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="entrevistas" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entrevistas">Historial de entrevistas</TabsTrigger>
          <TabsTrigger value="comentarios">Comentarios de reclutadores</TabsTrigger>
          <TabsTrigger value="anotaciones">Mis anotaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="entrevistas" className="mt-6">
          <EntrevistasTab entrevistas={candidato.entrevistas} />
        </TabsContent>

        <TabsContent value="comentarios" className="mt-6">
          <ComentariosTab comentarios={candidato.comentarios} />
        </TabsContent>

        <TabsContent value="anotaciones" className="mt-6">
          <AnotacionesTab
            anotaciones={anotaciones}
            onGuardarAnotacion={guardarAnotacion}
            onEliminarAnotacion={eliminarAnotacion}
            onEditarAnotacion={editarAnotacion}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
