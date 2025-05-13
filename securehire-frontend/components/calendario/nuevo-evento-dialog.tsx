"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface NuevoEventoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | undefined
  setSelectedDate: (date: Date | undefined) => void
  selectedTime: string
  setSelectedTime: (time: string) => void
  eventTitle: string
  setEventTitle: (title: string) => void
  eventDescription: string
  setEventDescription: (description: string) => void
  onCreateEvent: () => void
}

export function NuevoEventoDialog({
  open,
  onOpenChange,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  eventTitle,
  setEventTitle,
  eventDescription,
  setEventDescription,
  onCreateEvent,
}: NuevoEventoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="event-dialog-description">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
          <DialogDescription id="event-dialog-description">
            Complete los detalles para crear un nuevo evento en el calendario.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-title" className="text-right">
              Título
            </Label>
            <Input
              id="event-title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className="col-span-3 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-time" className="text-right">
              Hora
            </Label>
            <Input
              id="event-time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="event-description" className="text-right">
              Descripción
            </Label>
            <Textarea
              id="event-description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onCreateEvent}>
            Crear Evento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
