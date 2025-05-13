"use client"

import { useMemo } from "react"
import { format, isToday, isSameMonth, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

interface CalendarioGridProps {
  currentDate: Date
  calendarDays: Date[]
  events: {
    id: string
    title: string
    date: string
    time?: string
    type?: string
  }[]
  onSelectDay: (date: Date) => void
  onSelectEvent: (event: any) => void
}

export function CalendarioGrid({ currentDate, calendarDays, events, onSelectDay, onSelectEvent }: CalendarioGridProps) {
  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  const eventsByDate = useMemo(() => {
    const eventMap = {}

    events.forEach((event) => {
      const dateKey = format(parseISO(event.date), "yyyy-MM-dd")
      if (!eventMap[dateKey]) {
        eventMap[dateKey] = []
      }
      eventMap[dateKey].push(event)
    })

    return eventMap
  }, [events])

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Cabecera de días de la semana */}
      {diasSemana.map((dia) => (
        <div key={dia} className="text-center py-2 text-sm font-medium">
          {dia}
        </div>
      ))}

      {/* Días del calendario */}
      {calendarDays.map((day, i) => {
        const dateKey = format(day, "yyyy-MM-dd")
        const dayEvents = eventsByDate[dateKey] || []
        const isCurrentMonth = isSameMonth(day, currentDate)

        return (
          <div
            key={i}
            className={cn(
              "min-h-[100px] p-1 border border-border rounded-md",
              !isCurrentMonth && "opacity-40 bg-muted/30",
              isToday(day) && "bg-primary/5 border-primary/30",
            )}
            onClick={() => onSelectDay(day)}
          >
            <div className="text-right">
              <span
                className={cn(
                  "inline-block w-7 h-7 rounded-full text-center leading-7 text-sm",
                  isToday(day) && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </span>
            </div>

            <div className="mt-1 space-y-1">
              {dayEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "text-xs p-1 rounded truncate cursor-pointer",
                    event.type === "entrevista"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : event.type === "reunion"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectEvent(event)
                  }}
                >
                  {event.time && `${event.time} - `}
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">+{dayEvents.length - 3} más</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
