"use client"

import { Button } from "@/components/ui/button"
import { FolderPlusIcon, Package2Icon } from "lucide-react"

interface OfertaVaciaProps {
  onNuevaOferta: () => void
}

export function OfertaVacia({ onNuevaOferta }: OfertaVaciaProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      <Package2Icon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h2 className="text-xl font-medium mb-2">Selecciona una oferta</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Selecciona una oferta de trabajo para ver sus detalles o crea una nueva
      </p>
      <Button onClick={onNuevaOferta}>
        <FolderPlusIcon className="mr-2 h-4 w-4" />
        Nueva Oferta
      </Button>
    </div>
  )
}
