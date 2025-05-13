"use client"

import Link from "next/link"
import { CalendarioMensual } from "@/components/calendario/calendario-mensual"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, PlusCircle } from "lucide-react"
import { useCalendario } from "@/hooks/use-calendario"
import { NuevoEventoDialog } from "@/components/calendario/nuevo-evento-dialog"
import { ProximosEventos } from "@/components/calendario/proximos-eventos"

// Datos de ejemplo para eventos
const eventosEjemplo = [
  {
    id: 1,
    titulo: "Entrevista",
    fecha: new Date(2025, 4, 15, 10, 0),
    candidato: "María Pérez",
  },
  {
    id: 2,
    titulo: "Entrevista",
    fecha: new Date(2025, 4, 18, 15, 30),
    candidato: "Javier González",
  },
  {
    id: 3,
    titulo: "Entrevista",
    fecha: new Date(2025, 4, 20, 9, 0),
    candidato: "Elena Martín",
  },
  {
    id: 4,
    titulo: "Entrevista",
    fecha: new Date(2025, 4, 22, 11, 0),
    candidato: "Carlos Rodríguez",
  },
  {
    id: 5,
    titulo: "Entrevista",
    fecha: new Date(2025, 4, 25, 16, 0),
    candidato: "Ana López",
  },
]

export default function CalendarioPage() {
  const {
    eventos,
    activeTab,
    setActiveTab,
    showNewEventDialog,
    setShowNewEventDialog,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    eventTitle,
    setEventTitle,
    eventDescription,
    setEventDescription,
    handleCreateEvent,
    getProximosEventos,
    formatEventDate,
  } = useCalendario(eventosEjemplo)

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Calendario de Entrevistas</h1>
        </div>
        <Button onClick={() => setShowNewEventDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      <Tabs defaultValue="calendario" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="proximas">Próximas Entrevistas</TabsTrigger>
        </TabsList>

        <TabsContent value="calendario">
          <CalendarioMensual eventos={eventos} />
        </TabsContent>

        <TabsContent value="proximas">
          <ProximosEventos eventos={getProximosEventos()} formatEventDate={formatEventDate} />
        </TabsContent>
      </Tabs>

      <NuevoEventoDialog
        open={showNewEventDialog}
        onOpenChange={setShowNewEventDialog}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        eventTitle={eventTitle}
        setEventTitle={setEventTitle}
        eventDescription={eventDescription}
        setEventDescription={setEventDescription}
        onCreateEvent={handleCreateEvent}
      />
    </div>
  )
}
