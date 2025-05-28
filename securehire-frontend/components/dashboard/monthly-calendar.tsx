import React, { useState } from "react"
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarEvent {
  id?: string
  date: string
  time: string
  title: string
  person?: string
  link?: string
  candidateName?: string
  jobTitle?: string
  estado?: string
}

interface MonthlyCalendarProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
}

export function MonthlyCalendar({ events, onEventClick }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const rows: React.ReactElement[] = []
  let days: React.ReactElement[] = []
  let day = startDate

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const getEventsForDay = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const dayEvents = events.filter(event => event.date === dateString)
    console.log('Eventos para el día', dateString, ':', dayEvents) 
    return dayEvents
  }

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const dayEvents = getEventsForDay(day)
      const isToday = isSameDay(day, new Date())
      const isCurrentMonth = isSameMonth(day, monthStart)

      days.push(
        <div
          className={`border min-h-[80px] flex flex-col p-1 rounded-md ${
            !isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white"
          }`}
          key={day.toISOString()}
        >
          <div className="text-xs font-semibold text-center">
            {isToday ? (
              <span className="text-black">{format(day, "d")}</span>
            ) : (
              format(day, "d")
            )}
          </div>
          <div className="flex-1">
            {dayEvents.map((event, idx) => {
              console.log('Renderizando evento:', event) 
              return (
              <div
                key={idx}
                  className={`rounded-md p-1 mb-1 text-xs cursor-pointer ${
                    event.estado?.toLowerCase().includes("cancelada")
                      ? "bg-red-100 text-red-900 hover:bg-red-200"
                      : event.estado === "Pendiente de confirmación" 
                        ? "bg-amber-100 text-amber-900 hover:bg-amber-200" 
                        : "bg-green-100 text-green-900 hover:bg-green-200"
                  }`}
                onClick={() => onEventClick?.(event)}
              >
                  <div className="font-medium truncate">{event.time} - {event.title}{event.person ? `: ${event.person}` : ''}</div>
                {event.jobTitle && <div className="text-[11px] text-gray-600">{event.jobTitle}</div>}
              </div>
              )
            })}
          </div>
        </div>
      )
      day = addDays(day, 1)
    }
    rows.push(
      <div className="grid grid-cols-7 gap-1" key={day.toISOString()}>
        {days}
      </div>
    )
    days = []
  }

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: es })

  return (
    <div className="rounded-lg border bg-white p-3 w-full">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Calendario Mensual</h2>
        <div className="flex items-center gap-2">
          <button className="rounded-l-md border p-1 hover:bg-gray-100" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-gray-700 font-semibold">{monthLabel}</span>
          <button className="rounded-r-md border p-1 hover:bg-gray-100" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} className="text-xs font-bold text-center py-1">{d}</div>
        ))}
      </div>
      {rows}
    </div>
  )
}
