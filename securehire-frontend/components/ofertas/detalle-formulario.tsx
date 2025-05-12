"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileTextIcon } from "lucide-react"
import type { Formulario } from "@/types/ofertas"

interface DetalleFormularioProps {
  formulario: Formulario | null
  onEditarFormulario: () => void
}

export function DetalleFormulario({ formulario, onEditarFormulario }: DetalleFormularioProps) {
  if (formulario) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">{formulario.nombre}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Este formulario contiene {formulario.campos.length} campos, de los cuales{" "}
            {formulario.campos.filter((campo) => campo.esExcluyente).length} son excluyentes.
          </p>
        </div>

        <div className="space-y-4">
          {formulario.campos.map((campo) => (
            <Card key={campo.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {campo.etiqueta}
                      {campo.esExcluyente && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tipo: {campo.tipo}
                      {campo.esExcluyente && " (Requisito excluyente)"}
                    </p>
                    {campo.tipo === "dropdown" && campo.opciones && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Opciones: {campo.opciones.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
      No hay formulario creado para esta oferta
      <div className="mt-4">
        <Button onClick={onEditarFormulario}>
          <FileTextIcon className="mr-2 h-4 w-4" />
          Crear Formulario
        </Button>
      </div>
    </div>
  )
}
