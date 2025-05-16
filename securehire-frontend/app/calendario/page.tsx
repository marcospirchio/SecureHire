"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CalendarIcon,
  User,
  Briefcase,
  Plus,
  Clock
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
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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
  estado?: string
  description?: string
  tipo?: string
  ubicacion?: string
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { entrevistas, loading, error } = useEntrevistas()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    date: format(currentDate, "yyyy-MM-dd"),
    time: "09:00",
    tipo: "evento"
  })
  const [eventos, setEventos] = useState<CalendarEvent[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  // Cargar eventos del calendario
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/calendario/eventos', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          // Transformar los eventos al formato esperado por el calendario
          const eventosFormateados = data.map((evento: any) => {
            // Validar que fechaHora existe y tiene el formato correcto
            let date = ""
            let time = ""
            if (evento.fechaHora) {
              const [fecha, hora] = evento.fechaHora.split('T')
              date = fecha
              time = hora ? hora.substring(0, 5) : "00:00"
            }

            return {
              id: evento.id,
              title: evento.titulo,
              date: date,
              time: time,
              description: evento.descripcion || "",
              tipo: evento.tipo || "evento",
              ubicacion: evento.ubicacion || ""
            }
          })
          setEventos(eventosFormateados)
        }
      } catch (error) {
        console.error('Error al cargar eventos:', error)
      }
    }
    fetchEventos()
  }, [])

  const events: CalendarEvent[] = [
    ...entrevistas.map(entrevista => ({
      id: entrevista.id,
      date: entrevista.fechaProgramada.split('T')[0],
      time: entrevista.horaProgramada || "-",
      title: "Entrevista",
      person: `${entrevista.nombreCandidato} ${entrevista.apellidoCandidato}`,
      link: entrevista.linkEntrevista || "",
      candidateName: `${entrevista.nombreCandidato} ${entrevista.apellidoCandidato}`,
      jobTitle: entrevista.tituloPuesto || "-",
      estado: entrevista.estado,
      tipo: "entrevista"
    })),
    ...eventos
  ]

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

  const handleOpenNewEventModal = () => {
    setNewEvent({
      date: format(currentDate, "yyyy-MM-dd"),
      time: "09:00",
      tipo: "evento"
    })
    setIsNewEventModalOpen(true)
  }

  const handleNewEventChange = (field: string, value: string) => {
    setNewEvent((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCreateEvent = async () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      try {
        // Combinar fecha y hora en formato ISO
        const fechaHora = new Date(`${newEvent.date}T${newEvent.time}:00Z`).toISOString()

        const eventoData = {
          titulo: newEvent.title,
          descripcion: newEvent.description || "",
          tipo: "evento",
          fechaHora: fechaHora,
          ubicacion: "Oficina" // Valor por defecto, podríamos añadir un campo para esto si es necesario
        }

        const response = await fetch('http://localhost:8080/api/calendario/eventos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(eventoData)
        })

        if (response.ok) {
          const createdEvent = await response.json()
          setEventos([...eventos, createdEvent])
          setIsNewEventModalOpen(false)
  }
      } catch (error) {
        console.error('Error al crear evento:', error)
      }
    }
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return

    try {
      const response = await fetch(`http://localhost:8080/api/calendario/eventos/${selectedEvent.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setEventos(eventos.filter(e => e.id !== selectedEvent.id))
      setIsEventDetailsModalOpen(false)
    }
    } catch (error) {
      console.error('Error al eliminar evento:', error)
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
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 h-7 text-xs" onClick={handleOpenNewEventModal}>
            <Plus className="mr-1 h-3 w-3" /> Nuevo Evento
          </Button>
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
                          className={`mt-1 rounded p-1 text-[10px] truncate cursor-pointer ${
                            event.tipo === "evento"
                              ? "bg-blue-100 text-blue-900 hover:bg-blue-200"
                              : event.estado === "Pendiente de confirmación"
                                ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                                : "bg-green-100 text-green-900 hover:bg-green-200"
                          }`}
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

        {/* Modal de detalles del evento */}
        <Dialog open={isEventDetailsModalOpen} onOpenChange={setIsEventDetailsModalOpen}>
          <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">{selectedEvent?.title}</h2>
              <div className="sr-only">
                <DialogTitle>Detalles del evento</DialogTitle>
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
                {selectedEvent?.description && (
                  <div className="flex items-start gap-3">
                    <div>
                      <p className="text-gray-500 font-medium">Descripción</p>
                      <p className="text-gray-700">{selectedEvent.description}</p>
                    </div>
                  </div>
                )}
                {selectedEvent?.tipo === "entrevista" && (
                  <>
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
                  </>
                )}
              </div>
              <div className="flex justify-between mt-8">
                {selectedEvent?.tipo === "evento" ? (
                  <Button
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 border-2 border-red-600"
                    onClick={handleDeleteEvent}
                  >
                    Eliminar evento
                  </Button>
                ) : (
                <Button
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 border-2 border-red-600"
                  onClick={handleCancelInterview}
                >
                  Cancelar entrevista
                </Button>
                )}
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