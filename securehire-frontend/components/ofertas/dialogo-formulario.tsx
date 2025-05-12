"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XCircleIcon } from "lucide-react"
import type { CampoFormulario, Formulario } from "@/types/ofertas"

interface DialogoFormularioProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formularioExistente: Formulario | null
  onGuardarFormulario: (nombre: string, campos: CampoFormulario[]) => void
}

export function DialogoFormulario({
  open,
  onOpenChange,
  formularioExistente,
  onGuardarFormulario,
}: DialogoFormularioProps) {
  const [nuevoFormulario, setNuevoFormulario] = useState<{
    nombre: string
    campos: CampoFormulario[]
  }>({
    nombre: formularioExistente?.nombre || "",
    campos: formularioExistente?.campos || [],
  })

  const [nuevoCampo, setNuevoCampo] = useState<CampoFormulario>({
    id: "",
    tipo: "texto",
    etiqueta: "",
    esExcluyente: false,
  })

  const agregarCampoFormulario = () => {
    if (!nuevoCampo.etiqueta.trim()) return

    setNuevoFormulario({
      ...nuevoFormulario,
      campos: [
        ...nuevoFormulario.campos,
        {
          ...nuevoCampo,
          id: Date.now().toString(),
        },
      ],
    })

    setNuevoCampo({
      id: "",
      tipo: "texto",
      etiqueta: "",
      esExcluyente: false,
    })
  }

  const eliminarCampo = (idCampo: string) => {
    setNuevoFormulario({
      ...nuevoFormulario,
      campos: nuevoFormulario.campos.filter((campo) => campo.id !== idCampo),
    })
  }

  const handleGuardarFormulario = () => {
    if (!nuevoFormulario.nombre.trim()) return
    onGuardarFormulario(nuevoFormulario.nombre, nuevoFormulario.campos)
    setNuevoFormulario({ nombre: "", campos: [] })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{formularioExistente ? "Editar Formulario" : "Crear Formulario"}</DialogTitle>
          <DialogDescription>
            {formularioExistente
              ? "Modifica el formulario existente para esta oferta"
              : "Crea un formulario personalizado para esta oferta de trabajo"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label htmlFor="nombre-formulario" className="text-sm font-medium">
              Nombre del formulario
            </label>
            <Input
              id="nombre-formulario"
              placeholder="Ej: Formulario para Desarrollador Frontend"
              value={nuevoFormulario.nombre}
              onChange={(e) => setNuevoFormulario({ ...nuevoFormulario, nombre: e.target.value })}
            />
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-4">Campos del formulario</h3>

            {nuevoFormulario.campos.length > 0 && (
              <div className="space-y-4 mb-6">
                {nuevoFormulario.campos.map((campo) => (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => eliminarCampo(campo.id)}
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="etiqueta-campo" className="text-sm font-medium">
                      Etiqueta del campo
                    </label>
                    <Input
                      id="etiqueta-campo"
                      placeholder="Ej: Años de experiencia en React"
                      value={nuevoCampo.etiqueta}
                      onChange={(e) => setNuevoCampo({ ...nuevoCampo, etiqueta: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="tipo-campo" className="text-sm font-medium">
                      Tipo de campo
                    </label>
                    <Select
                      value={nuevoCampo.tipo}
                      onValueChange={(value) => setNuevoCampo({ ...nuevoCampo, tipo: value as any })}
                    >
                      <SelectTrigger id="tipo-campo">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="texto">Texto</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                        <SelectItem value="numero">Número</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {nuevoCampo.tipo === "dropdown" && (
                    <div className="space-y-2">
                      <label htmlFor="opciones-campo" className="text-sm font-medium">
                        Opciones (separadas por comas)
                      </label>
                      <Input
                        id="opciones-campo"
                        placeholder="Ej: Básico, Intermedio, Avanzado, Nativo"
                        onChange={(e) =>
                          setNuevoCampo({
                            ...nuevoCampo,
                            opciones: e.target.value.split(",").map((opt) => opt.trim()),
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="es-excluyente"
                      checked={nuevoCampo.esExcluyente}
                      onCheckedChange={(checked) => setNuevoCampo({ ...nuevoCampo, esExcluyente: checked as boolean })}
                    />
                    <label
                      htmlFor="es-excluyente"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Campo excluyente (obligatorio para el candidato)
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={agregarCampoFormulario}>Agregar Campo</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGuardarFormulario}>Guardar Formulario</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
