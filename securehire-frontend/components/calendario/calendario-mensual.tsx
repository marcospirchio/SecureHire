"use client"

import { useState, useEffect } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  format,
} from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

// Importamos los componentes refactorizados
import { CalendarioGrid } from "./componentes/calendario-grid"
import { ModalDetalleEvento } from "./modales/modal-detalle-evento"

interface CalendarioMensualProps {
  events: any[]
  onAddEvent?: () => void
  onCancelEvent?: (eventId: string) => void
}

export function CalendarioMensual({ events, onAddEvent, onCancelEvent }: CalendarioMensualProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Date[]>([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  useEffect(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = eachDayOfInterval({ start: startDate, end: endDate })
    setCalendarDays(days)
  }, [currentDate])

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const handleSelectDay = (day: Date) => {
    console.log("Día seleccionado:", day)
    // Aquí podría ir lógica adicional al seleccionar un día
  }

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy", { locale: es })}</h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {onAddEvent && (
          <Button onClick={onAddEvent} size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Nuevo evento
          </Button>
        )}
      </div>

      <CalendarioGrid
        currentDate={currentDate}
        calendarDays={calendarDays}
        events={events}
        onSelectDay={handleSelectDay}
        onSelectEvent={handleSelectEvent}
      />

      <ModalDetalleEvento
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        evento={selectedEvent}
        onCancelar={onCancelEvent}
      />
    </div>
  )
}
