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

interface DialogoNuevaOfertaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCrearOferta: (titulo: string, descripcion: string) => void
}

export function DialogoNuevaOferta({ open, onOpenChange, onCrearOferta }: DialogoNuevaOfertaProps) {
  const [nuevaOferta, setNuevaOferta] = useState({ titulo: "", descripcion: "" })

  const handleCrearOferta = () => {
    if (!nuevaOferta.titulo.trim()) return
    onCrearOferta(nuevaOferta.titulo, nuevaOferta.descripcion)
    setNuevaOferta({ titulo: "", descripcion: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Nueva Oferta de Trabajo</DialogTitle>
          <DialogDescription id="dialog-description">
            Crea una nueva oferta de trabajo para comenzar a recibir candidatos
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="titulo" className="text-sm font-medium">
              Título de la oferta
            </label>
            <Input
              id="titulo"
              placeholder="Ej: Desarrollador Frontend"
              value={nuevaOferta.titulo}
              onChange={(e) => setNuevaOferta({ ...nuevaOferta, titulo: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="descripcion" className="text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="descripcion"
              placeholder="Describe los detalles de la oferta..."
              className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={nuevaOferta.descripcion}
              onChange={(e) => setNuevaOferta({ ...nuevaOferta, descripcion: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCrearOferta}>Crear Oferta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
