"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, MapPin, User, Briefcase, X } from "lucide-react"

interface ModalDetalleEventoProps {
  isOpen: boolean
  onClose: () => void
  evento: {
    id: string
    title: string
    date: string
    time?: string
    type?: string
    description?: string
    location?: string
    candidato?: string
    oferta?: string
  } | null
  onCancelar?: (eventoId: string) => void
}

export function ModalDetalleEvento({ isOpen, onClose, evento, onCancelar }: ModalDetalleEventoProps) {
  if (!evento) return null

  const fechaFormateada = format(parseISO(evento.date), "PPPP", { locale: es })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{evento.title}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{fechaFormateada}</span>
          </div>

          {evento.time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{evento.time}</span>
            </div>
          )}

          {evento.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{evento.location}</span>
            </div>
          )}

          {evento.candidato && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{evento.candidato}</span>
            </div>
          )}

          {evento.oferta && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{evento.oferta}</span>
            </div>
          )}

          {evento.description && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-1">Descripción</h4>
              <p className="text-sm">{evento.description}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          {onCancelar && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onCancelar(evento.id)
                onClose()
              }}
              className="flex items-center gap-1"
            >
              <X size={16} />
              Cancelar evento
            </Button>
          )}
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
