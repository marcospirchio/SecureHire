"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock } from "lucide-react"

interface AccionesCandidatoProps {
  nombreCandidato: string
  onContactarCandidato: () => void
  onConfirmarEntrevista: () => void
  onMarcarNoAsistio: () => void
  onCancelarEntrevista: () => void
}

export function AccionesCandidato({
  nombreCandidato,
  onContactarCandidato,
  onConfirmarEntrevista,
  onMarcarNoAsistio,
  onCancelarEntrevista,
}: AccionesCandidatoProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-xl">Acciones</h3>
      <div className="grid grid-cols-1 gap-3">
        <Button variant="outline" onClick={onContactarCandidato} className="justify-center">
          Contactar candidato
        </Button>

        <Button variant="default" onClick={onConfirmarEntrevista} className="justify-center">
          Confirmar entrevista
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="justify-center">
              Reprogramar entrevista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reprogramar entrevista</DialogTitle>
              <DialogDescription id="dialog-description">
                Selecciona una nueva fecha y hora para la entrevista con {nombreCandidato}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Clock className="h-4 w-4 text-gray-500" />
                <input
                  type="time"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button>Guardar cambios</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={onMarcarNoAsistio} className="justify-center">
          Marcar como no asistió
        </Button>

        <Button variant="destructive" onClick={onCancelarEntrevista} className="justify-center">
          Cancelar entrevista
        </Button>
      </div>
    </div>
  )
}
