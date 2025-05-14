"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addDays, format, startOfWeek, endOfWeek, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, User, Briefcase } from "lucide-react"

interface CalendarEvent {
  date: string
  time: string | null
  title: string
  person?: string
  link?: string
  description?: string
  candidateName?: string
  jobTitle?: string
  id?: string
  type?: string // evento o entrevista
}

interface WeeklyCalendarProps {
  events: CalendarEvent[]
}

export function WeeklyCalendar({ events }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    return events.filter(event => event.date === dateString)
  }

  const formattedStartDate = format(startDate, "d MMM", { locale: es })
  const formattedEndDate = format(endDate, "d MMM", { locale: es })

  const handleClickEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

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
                    onClick={() => handleClickEvent(event)}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    {event.person && <div className="text-xs truncate">{event.person}</div>}
                    <div className="text-[11px]">{event.time ?? "Por confirmar"}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
          {selectedEvent && (
            <div className="p-6 space-y-5">
              <DialogTitle className="text-xl font-bold">{selectedEvent.title}</DialogTitle>

              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-500 text-sm">Fecha y hora</p>
                  <p className="text-gray-700">{selectedEvent.date} a las {selectedEvent.time}</p>
                </div>
              </div>

              {selectedEvent.person && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-500 text-sm">Persona / descripción</p>
                    <p className="text-gray-700">{selectedEvent.person}</p>
                  </div>
                </div>
              )}

              {selectedEvent.jobTitle && (
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-500 text-sm">Puesto</p>
                    <p className="text-gray-700">{selectedEvent.jobTitle}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
