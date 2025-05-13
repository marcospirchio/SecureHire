"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CalendarIcon,
  User,
  Briefcase
} from "lucide-react"
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  getDay,
  parse,
} from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useEntrevistas } from "@/hooks/use-entrevistas"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

interface CalendarEvent {
  id?: string
  date: string
  time: string
  title: string
  person?: string
  link?: string
  candidateName?: string
  jobTitle?: string
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { entrevistas, loading, error } = useEntrevistas()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  const events: CalendarEvent[] = entrevistas.map(entrevista => ({
    id: entrevista.id,
    date: entrevista.fechaProgramada.split('T')[0],
    time: entrevista.horaProgramada || "-",
    title: "Entrevista",
    person: `${entrevista.nombreCandidato} ${entrevista.apellidoCandidato}`,
    link: entrevista.linkEntrevista || "",
    candidateName: `${entrevista.nombreCandidato} ${entrevista.apellidoCandidato}`,
    jobTitle: entrevista.tituloPuesto || "-"
  }))

  const generateCalendarDays = (date: Date) => {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(monthStart)
    const startDate = addDays(monthStart, -getAdjustedDay(monthStart))
    const endDate = addDays(monthEnd, 6 - getAdjustedDay(monthEnd))
    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  const getAdjustedDay = (date: Date) => {
    const day = getDay(date)
    return day === 0 ? 6 : day - 1
  }

  const calendarDays = generateCalendarDays(currentDate)
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  const getEventsForDay = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return events.filter(event => event.date === dateString)
  }

  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1))
  }

  const handleOpenEventDetailsModal = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsEventDetailsModalOpen(true)
  }

  const formatDateInSpanish = (dateStr: string) => {
    const date = parse(dateStr, "yyyy-MM-dd", new Date())
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  }

  const handleCancelInterview = async () => {
    if (!selectedEvent?.id) return

    try {
      const response = await fetch(`http://localhost:8080/api/entrevistas/${selectedEvent.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          estado: "cancelada por el reclutador"
        })
      })

      if (!response.ok) {
        throw new Error("Error al cancelar la entrevista")
      }

      setIsEventDetailsModalOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error al cancelar la entrevista:", error)
      alert("No se pudo cancelar la entrevista.")
    }
  }

  if (loading || authLoading) {
    return (
      <Sidebar>
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <p>Cargando...</p>
          </div>
        </DashboardLayout>
      </Sidebar>
    )
  }

  if (error) {
    return (
      <Sidebar>
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <p className="text-red-500">Error: {error}</p>
          </div>
        </DashboardLayout>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <DashboardLayout>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-7 w-7 p-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-3 w-3" />
            </Button>
            <h1 className="text-lg font-bold">Calendario</h1>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-2 w-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold">{format(currentDate, "MMMM yyyy", { locale: es })}</h2>
            <div className="flex">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth} className="h-6 w-6 p-0 rounded-l-md rounded-r-none">
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth} className="h-6 w-6 p-0 rounded-l-none rounded-r-md">
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, index) => (
              <div key={index} className="bg-white p-1 text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}

            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day)
                const isToday = isSameDay(day, new Date())
                const isCurrentMonth = isSameMonth(day, currentDate)

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`h-20 bg-white p-1 border ${
                      isCurrentMonth ? "text-gray-900" : "text-gray-400"
                    } ${isToday ? "relative" : ""}`}
                  >
                    <div className="flex justify-end">
                      {isToday ? (
                        <div className="flex items-center justify-center h-4 w-4 rounded-full bg-gray-900 text-white text-[10px]">
                          {format(day, "d")}
                        </div>
                      ) : (
                        <span className="text-[10px]">{format(day, "d")}</span>
                      )}
                    </div>

                    <div className="mt-0.5 overflow-y-auto max-h-[calc(100%-16px)]">
                      {dayEvents.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="mt-1 rounded bg-blue-100 p-1 text-[10px] text-blue-700 truncate cursor-pointer hover:bg-blue-200"
                          onClick={() => handleOpenEventDetailsModal(event)}
                        >
                          {event.time} - {event.title}
                          {event.person && `: ${event.person}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <Dialog open={isEventDetailsModalOpen} onOpenChange={setIsEventDetailsModalOpen}>
          <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Entrevista</h2>
              <div className="sr-only">
                <DialogTitle>Detalles de la entrevista</DialogTitle>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-6 w-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-500 font-medium">Fecha y hora</p>
                    <p className="text-gray-700">
                      {selectedEvent && `${formatDateInSpanish(selectedEvent.date)} a las ${selectedEvent.time}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-6 w-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-500 font-medium">Candidato</p>
                    <p className="text-gray-700">{selectedEvent?.candidateName || selectedEvent?.person}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-6 w-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-500 font-medium">Búsqueda</p>
                    <p className="text-gray-700">{selectedEvent?.jobTitle}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Button
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 border-2 border-red-600"
                  onClick={handleCancelInterview}
                >
                  Cancelar entrevista
                </Button>
                <Button variant="outline" onClick={() => setIsEventDetailsModalOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </Sidebar>
  )
}