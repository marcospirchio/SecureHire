"use client"

import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardLayout } from "@/components/dashboard/layout"
import { WeeklyCalendar } from "@/components/dashboard/weekly-calendar"
import { JobListings } from "@/components/dashboard/job-listings"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useEntrevistas } from "@/hooks/use-entrevistas"
import { useEffect, useState } from "react"
import { useBusquedas } from "@/hooks/use-busquedas"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, User, Briefcase } from "lucide-react"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"
import type { CalendarEvent } from "@/types/calendar"

export default function DashboardReclutamiento() {
  const router = useRouter()
  const { user, loading: authLoading, error: authError } = useAuth()
  const { entrevistas, loading: entrevistasLoading, error: entrevistasError } = useEntrevistas()
  const { busquedas, loading: busquedasLoading, error: busquedasError } = useBusquedas()
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [eventos, setEventos] = useState<CalendarEvent[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/calendario/eventos', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          const eventosFormateados = data.map((evento: any) => {
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
              date,
              time,
              description: evento.descripcion || "",
              tipo: evento.tipo || "evento",
              ubicacion: evento.ubicacion || ""
            } as CalendarEvent
          })
          setEventos(eventosFormateados)
        }
      } catch (error) {
        console.error('Error al cargar eventos:', error)
      }
    }
    fetchEventos()
  }, [])

  const calendarEvents: CalendarEvent[] = [
    ...entrevistas.map(entrevista => ({
      id: entrevista.id,
      date: entrevista.fechaProgramada.split('T')[0],
      time: entrevista.horaProgramada ?? "Por confirmar",
      title: "Entrevista",
      person: `${entrevista.nombreCandidato} ${entrevista.apellidoCandidato}`,
      link: entrevista.linkEntrevista ?? undefined,
      candidateName: `${entrevista.nombreCandidato} ${entrevista.apellidoCandidato}`,
      jobTitle: entrevista.tituloPuesto ?? "-",
      estado: entrevista.estado,
      tipo: "entrevista",
      description: "",
      ubicacion: ""
    })),
    ...eventos
  ]

  const jobListings = busquedas
    .slice()
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
    .slice(0, 3)
    .map(b => ({
      title: b.titulo,
      subtitle: b.faseActual ?? "",
      phase: b.faseActual ?? "",
      candidates: b.cantidadCandidatos ?? 0,
      createdAt: new Date(b.fechaCreacion).toLocaleDateString("es-AR"),
    }))

  const handleNewJobOffer = () => {
    router.push("/busquedas/nueva-oferta")
  }

  const handleEventClick = (event: CalendarEvent) => {
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado: "cancelada por el reclutador" })
      })
      if (!response.ok) throw new Error("Error al cancelar la entrevista")
      setIsEventDetailsModalOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error al cancelar la entrevista:", error)
      alert("No se pudo cancelar la entrevista.")
    }
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return
    try {
      const response = await fetch(`http://localhost:8080/api/calendario/eventos/${selectedEvent.id}`, {
        method: "DELETE",
        credentials: "include"
      })
      if (!response.ok) throw new Error("Error al eliminar el evento")
      setIsEventDetailsModalOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error al eliminar el evento:", error)
      alert("No se pudo eliminar el evento.")
    }
  }

  if (authLoading || entrevistasLoading || busquedasLoading) {
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

  if (authError || entrevistasError || busquedasError) {
    return (
      <Sidebar>
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <p className="text-red-500">
              Error: {authError || entrevistasError || busquedasError}
            </p>
          </div>
        </DashboardLayout>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <DashboardLayout>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg sm:text-xl font-bold">
            ¡Bienvenido, {user ? `${user.nombre} ${user.apellido}` : "Usuario"}!
          </h1>
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 h-7 text-xs" onClick={handleNewJobOffer}>
            Nueva oferta
          </Button>
        </div>

        <WeeklyCalendar events={calendarEvents} onEventClick={handleEventClick} />

        <div className="mt-6"></div>

        {jobListings.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="border rounded-lg p-6 flex items-center justify-center text-center text-gray-500 bg-gray-50 h-32"
              >
                ¡No posees búsquedas, crea una!
              </div>
            ))}
          </div>
        ) : (
          <JobListings listings={jobListings} />
        )}

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
