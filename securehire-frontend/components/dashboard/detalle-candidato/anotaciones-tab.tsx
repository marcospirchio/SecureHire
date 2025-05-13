"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2 } from "lucide-react"
import type { AnotacionPersonal } from "@/types/candidato"

interface AnotacionesTabProps {
  anotaciones: AnotacionPersonal[]
  onGuardarAnotacion: (texto: string) => void
  onEliminarAnotacion: (id: number) => void
  onEditarAnotacion: (id: number, texto: string) => void
}

export function AnotacionesTab({
  anotaciones,
  onGuardarAnotacion,
  onEliminarAnotacion,
  onEditarAnotacion,
}: AnotacionesTabProps) {
  const [nuevaAnotacion, setNuevaAnotacion] = useState("")
  const [editandoAnotacion, setEditandoAnotacion] = useState<number | null>(null)
  const [textoEditado, setTextoEditado] = useState("")

  const handleGuardarAnotacion = () => {
    if (nuevaAnotacion.trim() === "") return
    onGuardarAnotacion(nuevaAnotacion)
    setNuevaAnotacion("")
  }

  const iniciarEdicion = (anotacion: AnotacionPersonal) => {
    setEditandoAnotacion(anotacion.id)
    setTextoEditado(anotacion.texto)
  }

  const guardarEdicion = () => {
    if (editandoAnotacion === null) return
    onEditarAnotacion(editandoAnotacion, textoEditado)
    setEditandoAnotacion(null)
    setTextoEditado("")
  }

  const cancelarEdicion = () => {
    setEditandoAnotacion(null)
    setTextoEditado("")
  }

  return (
    <>
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Añadir nueva anotación</h3>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Escribe tus anotaciones personales sobre este candidato..."
              value={nuevaAnotacion}
              onChange={(e) => setNuevaAnotacion(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleGuardarAnotacion}>Guardar anotación</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 mt-4">
        {anotaciones.map((anotacion) => (
          <Card key={anotacion.id} className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(anotacion.fecha, "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => iniciarEdicion(anotacion)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => onEliminarAnotacion(anotacion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {editandoAnotacion === anotacion.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      className="w-full min-h-[80px] p-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={cancelarEdicion}>
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={guardarEdicion}>
                        Guardar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm">{anotacion.texto}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {anotaciones.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">No hay anotaciones personales</div>
        )}
      </div>
    </>
  )
}
