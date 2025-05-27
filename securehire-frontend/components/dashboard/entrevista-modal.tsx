// Ruta sugerida: components/dashboard/entrevista-modal.tsx

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CalendarIcon, UserIcon, BriefcaseIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import React from "react"

interface EntrevistaModalProps {
  open: boolean
  onClose: () => void
  onCancel: () => void
  entrevista: {
    fecha: string // formato ISO ("2025-05-15")
    hora: string  // formato "HH:mm"
    candidato: string
    puesto: string
    estado?: string
  } | null
}

export function EntrevistaModal({ open, onClose, onCancel, entrevista }: EntrevistaModalProps) {
  if (!entrevista) return null

  const fechaFormateada = format(new Date(entrevista.fecha + "T" + entrevista.hora), "PPPP 'a las' HH:mm", { locale: es })
  const isCanceled = entrevista.estado?.toLowerCase().includes("cancelada")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Entrevista</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex gap-3 items-start">
            <CalendarIcon className="text-gray-500 w-5 h-5 mt-1" />
            <div>
              <div className="text-sm font-medium text-gray-600">Fecha y hora</div>
              <div className="text-sm text-gray-900">{fechaFormateada}</div>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <UserIcon className="text-gray-500 w-5 h-5 mt-1" />
            <div>
              <div className="text-sm font-medium text-gray-600">Candidato</div>
              <div className="text-sm text-gray-900">{entrevista.candidato}</div>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <BriefcaseIcon className="text-gray-500 w-5 h-5 mt-1" />
            <div>
              <div className="text-sm font-medium text-gray-600">Búsqueda</div>
              <div className="text-sm text-gray-900">{entrevista.puesto}</div>
            </div>
          </div>

          {isCanceled && (
            <div className="flex gap-3 items-start">
              <div className="text-sm font-medium text-red-600">Entrevista cancelada</div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          {!isCanceled && (
            <Button variant="destructive" onClick={onCancel} className="px-4">Cancelar entrevista</Button>
          )}
          <Button variant="outline" onClick={onClose} className="px-4">Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}