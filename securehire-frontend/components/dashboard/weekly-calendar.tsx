"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addDays, format, startOfWeek, endOfWeek, isSameDay } from "date-fns"
import { es } from "date-fns/locale"

interface CalendarEvent {
  date: string // formato ISO: "2025-05-15"
  time: string
  title: string
  person?: string
  link?: string
}

interface WeeklyCalendarProps {
  events: CalendarEvent[]
}

export function WeeklyCalendar({ events }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calcular el inicio y fin de la semana actual
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }) // Lunes como inicio de semana
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 }) // Domingo como fin de semana

  // Generar los días de la semana (lunes a viernes)
  const weekDays = []
  for (let i = 0; i < 5; i++) {
    weekDays.push(addDays(startDate, i))
  }

  // Navegación de semanas
  const goToPreviousWeek = () => setCurrentDate(prev => addDays(prev, -7))
  const goToNextWeek = () => setCurrentDate(prev => addDays(prev, 7))

  // Obtener eventos del día
  const getEventsForDay = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return events.filter(event => {
      const eventDate = event.date.split("T")[0]
      return eventDate === dateString
    })
  }

  // Fechas para mostrar en el header
  const formattedStartDate = format(startDate, "d MMM", { locale: es })
  const formattedEndDate = format(endDate, "d MMM", { locale: es })

  return (
    <div className="rounded-lg border bg-white p-3 w-full">
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Calendario Semanal</h2>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">
            {formattedStartDate} - {formattedEndDate}
          </span>
          <div className="flex">
            <button className="rounded-l-md border p-1 hover:bg-gray-100" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button className="rounded-r-md border border-l-0 p-1 hover:bg-gray-100" onClick={goToNextWeek}>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, currentDate)

          return (
            <div key={index} className="flex flex-col">
              <div className={`mb-1 rounded-md p-1 text-center ${isToday ? "bg-blue-500 text-white" : "bg-gray-100"}`}>
                <div className="font-medium text-xs">{format(day, "EEE", { locale: es })}</div>
                <div className="text-base font-bold">{format(day, "d", { locale: es })}</div>
              </div>
              <div className="h-24 rounded-md border p-1 overflow-y-auto">
                {dayEvents.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className="rounded-md bg-blue-100 p-1.5 text-xs mb-1.5 cursor-pointer hover:bg-blue-200"
                    onClick={() => event.link && window.open(event.link, "_blank")}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    {event.person && <div className="text-xs truncate">{event.person}</div>}
                    {event.time && <div className="text-[11px]">{event.time}</div>}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
