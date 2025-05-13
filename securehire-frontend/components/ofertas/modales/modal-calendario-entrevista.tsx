"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ModalCalendarioEntrevistaProps {
  isOpen: boolean
  onClose: () => void
  candidatoId: string
  candidatoNombre: string
  onSchedule: (fecha: Date, hora: string) => void
}

export function ModalCalendarioEntrevista({
  isOpen,
  onClose,
  candidatoId,
  candidatoNombre,
  onSchedule,
}: ModalCalendarioEntrevistaProps) {
  const [fecha, setFecha] = useState<Date | undefined>(undefined)
  const [hora, setHora] = useState("")

  const horasDisponibles = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ]

  const handleSubmit = () => {
    if (fecha && hora) {
      onSchedule(fecha, hora)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Programar entrevista con {candidatoNombre}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={fecha}
              onSelect={setFecha}
              locale={es}
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < today || date.getDay() === 0 || date.getDay() === 6
              }}
              className="rounded-md border"
            />
          </div>

          {fecha && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecciona una hora:</label>
              <Select value={hora} onValueChange={setHora}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona hora" />
                </SelectTrigger>
                <SelectContent>
                  {horasDisponibles.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {fecha && (
            <div className="text-sm">
              <p>
                Fecha seleccionada: <span className="font-medium">{format(fecha, "PPP", { locale: es })}</span>
              </p>
              {hora && (
                <p>
                  Hora seleccionada: <span className="font-medium">{hora}</span>
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!fecha || !hora}>
            Programar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
