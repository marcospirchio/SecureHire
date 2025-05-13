"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ArrowLeft, Plus, CalendarIcon, Clock, User, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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

// Tipo para los eventos del calendario
interface CalendarEvent {
  id: string
  date: string // formato ISO: "2025-05-15"
  time: string
  title: string
  description?: string
  candidateName?: string
  jobTitle?: string
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 13)) // 13 de mayo de 2025
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false)
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    date: format(currentDate, "yyyy-MM-dd"),
    time: "09:00",
  })

  // Eventos de ejemplo
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      date: "2025-05-15",
      time: "10:00",
      title: "Entrevista",
      candidateName: "María Pérez",
      jobTitle: "Product Manager",
    },
    {
      id: "2",
      date: "2025-05-18",
      time: "15:30",
      title: "Entrevista",
      candidateName: "Juan López",
      jobTitle: "Desarrollador Frontend",
    },
    {
      id: "3",
      date: "2025-05-20",
      time: "09:00",
      title: "Entrevista",
      candidateName: "Ana García",
      jobTitle: "Diseñador UX/UI",
    },
    {
      id: "4",
      date: "2025-05-22",
      time: "11:00",
      title: "Entrevista",
      candidateName: "Carlos Rodríguez",
      jobTitle: "Contador Senior",
    },
    {
      id: "5",
      date: "2025-05-25",
      time: "16:00",
      title: "Entrevista",
      candidateName: "Laura Martínez",
      jobTitle: "Secretario",
    },
    // Eventos para meses adyacentes para probar la navegación
    {
      id: "6",
      date: "2025-04-28",
      time: "14:00",
      title: "Entrevista",
      candidateName: "Pedro López",
      jobTitle: "Pasantía",
    },
    {
      id: "7",
      date: "2025-06-05",
      time: "13:30",
      title: "Entrevista",
      candidateName: "Sofía Ramírez",
      jobTitle: "Diseñador UX/UI",
    },
  ])

  // Función para generar los días del calendario
  const generateCalendarDays = (date: Date) => {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    const startDate = addDays(monthStart, -getAdjustedDay(monthStart))
    const endDate = addDays(monthEnd, 6 - getAdjustedDay(monthEnd))

    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  // Ajustar el día de la semana (0 = lunes, 6 = domingo)
  const getAdjustedDay = (date: Date) => {
    const day = getDay(date)
    return day === 0 ? 6 : day - 1 // Convertir domingo (0) a 6, y restar 1 al resto
  }

  // Generar los días del calendario
  const calendarDays = generateCalendarDays(currentDate)

  // Agrupar días en semanas
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  // Función para obtener eventos de un día específico
  const getEventsForDay = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return events.filter((event) => {
      const eventDate = event.date.split("T")[0] // En caso de que venga con hora
      return eventDate === dateString
    })
  }

  // Función para navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1))
  }

  // Función para navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1))
  }

  // Función para abrir el modal de nuevo evento
  const handleOpenNewEventModal = () => {
    setNewEvent({
      date: format(currentDate, "yyyy-MM-dd"),
      time: "09:00",
    })
    setIsNewEventModalOpen(true)
  }

  // Función para manejar cambios en el formulario de nuevo evento
  const handleNewEventChange = (field: string, value: string) => {
    setNewEvent((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Función para crear un nuevo evento
  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      const newEventComplete: CalendarEvent = {
        id: `event-${Date.now()}`,
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        description: newEvent.description,
        // Eliminamos los campos que ya no usamos
      }
      setEvents([...events, newEventComplete])
      setIsNewEventModalOpen(false)
    }
  }

  // Función para abrir el modal de detalles del evento
  const handleOpenEventDetailsModal = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsEventDetailsModalOpen(true)
  }

  // Función para cancelar una entrevista
  const handleCancelInterview = () => {
    if (selectedEvent) {
      // Aquí podrías implementar la lógica para cancelar la entrevista
      // Por ahora, simplemente eliminamos el evento del calendario
      setEvents(events.filter((event) => event.id !== selectedEvent.id))
      setIsEventDetailsModalOpen(false)
    }
  }

  // Función para formatear la fecha en español
  const formatDateInSpanish = (dateStr: string) => {
    const date = parse(dateStr, "yyyy-MM-dd", new Date())
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  }

  return (
    <Sidebar>
      <DashboardLayout>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="rounded-full h-7 w-7 p-0">
              <ArrowLeft className="h-3 w-3" />
            </Button>
            <h1 className="text-lg font-bold">Calendario</h1>
          </div>
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 h-7 text-xs" onClick={handleOpenNewEventModal}>
            <Plus className="mr-1 h-3 w-3" /> Nuevo Evento
          </Button>
        </div>

        <div className="rounded-lg border bg-white p-2 w-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold">{format(currentDate, "MMMM yyyy", { locale: es })}</h2>
            <div className="flex">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMonth}
                className="h-6 w-6 p-0 rounded-l-md rounded-r-none"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMonth}
                className="h-6 w-6 p-0 rounded-l-none rounded-r-md"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {/* Encabezados de días de la semana */}
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, index) => (
              <div key={index} className="bg-white p-1 text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}

            {/* Días del calendario */}
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day)
                const isToday = isSameDay(day, new Date(2025, 4, 13)) // Asumiendo que hoy es 13 de mayo de 2025
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
                          {event.candidateName && `: ${event.candidateName}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }),
            )}
          </div>
        </div>

        {/* Modal para crear nuevo evento */}
        <Dialog open={isNewEventModalOpen} onOpenChange={setIsNewEventModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Crear Nuevo Evento</DialogTitle>
              <DialogDescription>Complete los detalles para crear un nuevo evento en el calendario.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="font-medium">
                  Título
                </label>
                <input
                  id="title"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newEvent.title || ""}
                  onChange={(e) => handleNewEventChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="date" className="font-medium">
                  Fecha
                </label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                  <input
                    id="date"
                    type="date"
                    className="flex-1 bg-transparent outline-none"
                    value={newEvent.date}
                    onChange={(e) => handleNewEventChange("date", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="time" className="font-medium">
                  Hora
                </label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm items-center">
                  <Clock className="mr-2 h-4 w-4 opacity-50" />
                  <input
                    id="time"
                    type="time"
                    className="flex-1 bg-transparent outline-none"
                    value={newEvent.time}
                    onChange={(e) => handleNewEventChange("time", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="font-medium">
                  Descripción
                </label>
                <Textarea
                  id="description"
                  rows={4}
                  value={newEvent.description || ""}
                  onChange={(e) => handleNewEventChange("description", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="bg-gray-900 hover:bg-gray-800" onClick={handleCreateEvent}>
                Crear Evento
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal para ver detalles del evento */}
        <Dialog open={isEventDetailsModalOpen} onOpenChange={setIsEventDetailsModalOpen}>
          <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Entrevista</h2>

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
                    <p className="text-gray-700">{selectedEvent?.candidateName}</p>
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
