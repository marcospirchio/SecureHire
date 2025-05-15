"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { addDays, format, startOfWeek, endOfWeek, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import type { CalendarEvent } from "@/types/calendar"

interface WeeklyCalendarProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
}

export function WeeklyCalendar({ events, onEventClick }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 })

  const weekDays = []
  for (let i = 0; i < 5; i++) {
    weekDays.push(addDays(startDate, i))
  }

  const goToPreviousWeek = () => setCurrentDate(prev => addDays(prev, -7))
  const goToNextWeek = () => setCurrentDate(prev => addDays(prev, 7))

  const getEventsForDay = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const dayEvents = events.filter(event => event.date === dateString)
    console.log('Eventos para el día', dateString, ':', dayEvents)
    return dayEvents
  }

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
          const isToday = isSameDay(day, new Date())

          return (
            <div key={index} className="flex flex-col">
              <div className={`mb-1 rounded-md p-1 text-center ${isToday ? "bg-blue-500 text-white" : "bg-gray-100"}`}>
                <div className="font-medium text-xs">{format(day, "EEE", { locale: es })}</div>
                <div className="text-base font-bold">{format(day, "d", { locale: es })}</div>
              </div>
              <div className="h-24 rounded-md border p-1 overflow-y-auto">
                {dayEvents.map((event, eventIndex) => {
                  console.log('Renderizando evento:', event)
                  return (
                    <div
                      key={eventIndex}
                      className={`rounded-md p-1.5 text-xs mb-1.5 cursor-pointer ${
                        event.tipo === "evento"
                          ? "bg-blue-100 text-blue-900 hover:bg-blue-200"
                          : event.estado === "Pendiente de confirmación"
                            ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                            : "bg-green-100 text-green-900 hover:bg-green-200"
                      }`}
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="font-medium truncate flex items-center gap-1">
                        {event.time} - {event.title}
                        {event.tipo === "entrevista" && (
                          event.estado === "Pendiente de confirmación" ? (
                            <AlertCircle className="h-3 w-3 stroke-2" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 stroke-2" />
                          )
                        )}
                      </div>
                      {event.person && <div className="text-xs truncate">{event.person}</div>}
                      {event.jobTitle && <div className="text-[11px] text-gray-600">{event.jobTitle}</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
