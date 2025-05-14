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
  Trash
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
  parse
} from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEntrevistas } from "@/hooks/use-entrevistas"
import { useEventosCalendario } from "@/hooks/use-evento_calendario"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CalendarEvent {
  id?: string
  date: string
  time: string
  title: string
  person?: string
  link?: string
  description?: string
  tipo?: string
  ubicacion?: string
}

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { user, loading: authLoading } = useAuth()
  const { entrevistas } = useEntrevistas()
  const { eventos } = useEventosCalendario()
  const router = useRouter()

  const [eventosCalendario, setEventosCalendario] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false)
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    date: format(currentDate, "yyyy-MM-dd"),
    time: "09:00",
    tipo: "evento"
  })

  useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [authLoading, user, router])

  useEffect(() => {
    const mappedEntrevistas = entrevistas.map((e) => ({
      id: e.id,
      date: e.fechaProgramada.split("T")[0],
      time: e.horaProgramada || "Por confirmar",
      title: "Entrevista",
      person: `${e.nombreCandidato} ${e.apellidoCandidato}`,
      link: e.linkEntrevista || "",
      tipo: "entrevista"
    }))

    const mappedEventos = eventos.map((e) => ({
      id: e.id,
      date: e.fechaHora.split("T")[0],
      time: e.fechaHora.split("T")[1]?.substring(0, 5) || "Por confirmar",
      title: e.titulo,
      description: e.descripcion,
      tipo: "evento"
    }))

    setEventosCalendario([...mappedEntrevistas, ...mappedEventos])
  }, [entrevistas, eventos])

  const handleOpenEventDetailsModal = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsEventDetailsModalOpen(true)
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id || selectedEvent.tipo !== "evento") return

    try {
      const res = await fetch(`http://localhost:8080/api/calendario/eventos/${selectedEvent.id}`, {
        method: "DELETE",
        credentials: "include"
      })
      if (!res.ok) throw new Error("Error al eliminar evento")
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert("No se pudo eliminar el evento")
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
    if (!newEvent.title || !newEvent.date || !newEvent.time) return

    try {
      const fechaHora = `${newEvent.date}T${newEvent.time}:00.000+00:00`
      
      const response = await fetch("http://localhost:8080/api/calendario/eventos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          titulo: newEvent.title,
          descripcion: newEvent.description,
          tipo: newEvent.tipo,
          fechaHora: fechaHora,
          ubicacion: newEvent.ubicacion
        })
      })

      if (!response.ok) {
        throw new Error("Error al crear el evento")
      }

      setIsNewEventModalOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error al crear el evento:", error)
      alert("No se pudo crear el evento.")
    }
  }

  const getEventsForDay = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd")
    return eventosCalendario.filter(e => e.date === dateString)
  }

  const generateCalendarDays = (date: Date) => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const startDate = addDays(start, -getAdjustedDay(start))
    const endDate = addDays(end, 6 - getAdjustedDay(end))
    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  const getAdjustedDay = (date: Date) => {
    const day = getDay(date)
    return day === 0 ? 6 : day - 1
  }

  const weeks = []
  const calendarDays = generateCalendarDays(currentDate)
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return (
    <Sidebar>
      <DashboardLayout>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="rounded-full h-7 w-7 p-0" onClick={() => router.back()}>
              <ArrowLeft className="h-3 w-3" />
            </Button>
            <h1 className="text-2xl font-bold">Calendario</h1>
          </div>
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 h-7 text-xs" onClick={handleOpenNewEventModal}>
            <Plus className="mr-1 h-3 w-3" /> Nuevo Evento
          </Button>
        </div>

        <div className="flex justify-end mb-2">
          <div className="flex gap-2">
            <Button size="icon" variant="outline" className="h-6 w-6 p-0" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button size="icon" variant="outline" className="h-6 w-6 p-0" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, i) => (
            <div key={i} className="text-center text-xs font-bold text-gray-600 bg-white p-1">{day}</div>
          ))}

          {weeks.map((week, i) =>
            week.map((day, j) => {
              const events = getEventsForDay(day)
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = isSameMonth(day, currentDate)
              return (
                <div
                  key={`${i}-${j}`}
                  className={`h-20 p-1 border text-[10px] ${isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}`}
                >
                  <div className="flex justify-end">
                    {isToday ? (
                      <div className="flex items-center justify-center h-4 w-4 rounded-full bg-black text-white text-[10px]">
                        {format(day, "d")}
                      </div>
                    ) : (
                      <span>{format(day, "d")}</span>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-[calc(100%-16px)]">
                    {events.map((e, idx) => (
                      <div
                        key={idx}
                        className="mt-1 p-1 rounded bg-blue-100 text-blue-800 truncate hover:bg-blue-200 cursor-pointer"
                        onClick={() => handleOpenEventDetailsModal(e)}
                      >
                        {e.time} - {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <Dialog open={isNewEventModalOpen} onOpenChange={setIsNewEventModalOpen}>
          <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Nuevo Evento</h2>
              <div className="sr-only">
                <DialogTitle>Crear nuevo evento</DialogTitle>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newEvent.title || ""}
                    onChange={(e) => handleNewEventChange("title", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date || ""}
                    onChange={(e) => handleNewEventChange("date", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time || ""}
                    onChange={(e) => handleNewEventChange("time", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description || ""}
                    onChange={(e) => handleNewEventChange("description", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={newEvent.ubicacion || ""}
                    onChange={(e) => handleNewEventChange("ubicacion", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsNewEventModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateEvent}>
                  Crear Evento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEventDetailsModalOpen} onOpenChange={setIsEventDetailsModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <div className="p-4">
              <DialogTitle className="text-xl font-bold mb-4">Detalle del Evento</DialogTitle>
              <p><strong>Título:</strong> {selectedEvent?.title}</p>
              <p><strong>Fecha:</strong> {selectedEvent?.date}</p>
              <p><strong>Hora:</strong> {selectedEvent?.time}</p>
              {selectedEvent?.person && <p><strong>Persona:</strong> {selectedEvent.person}</p>}
              {selectedEvent?.description && <p><strong>Descripción:</strong> {selectedEvent.description}</p>}
              <div className="flex justify-between mt-6">
                {selectedEvent?.tipo === "evento" && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteEvent}>
                    <Trash className="w-4 h-4 mr-1" /> Eliminar
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsEventDetailsModalOpen(false)}>
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
