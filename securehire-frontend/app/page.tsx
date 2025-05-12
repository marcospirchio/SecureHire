"use client"

import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { DetalleCandidato } from "@/components/dashboard/detalle-candidato"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import type { Candidato, EventoReciente } from "@/types/candidato"

// Datos de ejemplo
const candidatosEjemplo: Candidato[] = [
  {
    id: 1,
    _id: "1",
    nombre: "María",
    apellido: "Pérez",
    dni: "12345678A",
    edad: 28,
    sexo: "Femenino",
    puesto: "Diseñador UX",
    reputacion: 4,
    estado: "Entrevista confirmada",
    email: "maria.perez@ejemplo.com",
    telefono: "+34 612 345 678",
    tiempoRespuesta: "24 horas",
    entrevistas: [
      {
        fecha: new Date(2025, 4, 15, 10, 0),
        estado: "Entrevista confirmada",
        notas: "Candidata muy interesada en el puesto. Tiene experiencia relevante en diseño de interfaces.",
      },
    ],
    comentarios: [
      {
        reclutador: "Carlos Rodríguez",
        fecha: new Date(2025, 4, 10),
        texto: "Excelente comunicación. Portafolio impresionante con proyectos relevantes.",
      },
    ],
    anotacionesPersonales: [
      {
        id: 1,
        fecha: new Date(2025, 4, 11),
        texto:
          "Candidata muy prometedora. Preguntar sobre su experiencia con herramientas de diseño específicas en la próxima entrevista.",
      },
    ],
    respuestas: {},
    cumpleRequisitosExcluyentes: true,
  },
  // ... otros candidatos
]

// Datos de ejemplo para eventos recientes
const eventosRecientes: EventoReciente[] = [
  {
    id: 1,
    candidato: "María Pérez",
    accion: "confirmó entrevista",
    fecha: new Date(2025, 4, 20),
    tipo: "confirmacion",
  },
  {
    id: 2,
    candidato: "Pablo Sánchez",
    accion: "canceló entrevista",
    fecha: new Date(2025, 4, 19),
    tipo: "cancelacion",
  },
  {
    id: 3,
    candidato: "Javier González",
    accion: "fue añadido como candidato",
    fecha: new Date(2025, 4, 18),
    tipo: "nuevo",
  },
]

// Datos de ejemplo para entrevistas
const entrevistasEjemplo = [
  {
    id: 1,
    titulo: "Entrevista",
    fecha: new Date(2025, 4, 15, 10, 0),
    candidato: "María Pérez",
  },
  // ... otras entrevistas
]

// Datos de ejemplo para últimas ofertas
const ultimasOfertasEjemplo = [
  {
    id: "1",
    titulo: "Desarrollador Frontend",
    descripcion: "Buscamos desarrollador frontend con experiencia en React y TypeScript",
  },
  {
    id: "2",
    titulo: "Diseñador UX/UI",
    descripcion: "Buscamos diseñador UX/UI con experiencia en Figma y diseño de interfaces móviles",
  },
]

export default function DashboardReclutamiento() {
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<Candidato | null>(null)
  const [mostrarDetalles, setMostrarDetalles] = useState(false)
  const [usuarioLogueado, setUsuarioLogueado] = useState("Carlos Rodríguez")
  const { toast } = useToast()
  const isMobile = useMobile()

  const seleccionarCandidato = (candidato: Candidato) => {
    setCandidatoSeleccionado(candidato)
    if (isMobile) {
      setMostrarDetalles(true)
    }
  }

  const confirmarEntrevista = () => {
    if (!candidatoSeleccionado) return

    toast({
      title: "Entrevista confirmada",
      description: `La entrevista con ${candidatoSeleccionado.nombre} ha sido confirmada.`,
      variant: "default",
    })
  }

  const marcarNoAsistio = () => {
    if (!candidatoSeleccionado) return

    toast({
      title: "Candidato no asistió",
      description: `Se ha registrado que ${candidatoSeleccionado.nombre} no asistió a la entrevista.`,
      variant: "destructive",
    })
  }

  const cancelarEntrevista = () => {
    if (!candidatoSeleccionado) return

    toast({
      title: "Entrevista cancelada",
      description: `La entrevista con ${candidatoSeleccionado.nombre} ha sido cancelada.`,
      variant: "destructive",
    })
  }

  const contactarCandidato = () => {
    if (!candidatoSeleccionado) return

    toast({
      title: "Contactando candidato",
      description: `Se ha enviado un mensaje a ${candidatoSeleccionado.nombre}.`,
      variant: "default",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:ml-[280px]">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
          {candidatoSeleccionado ? (
            <DetalleCandidato
              candidato={candidatoSeleccionado}
              onConfirmarEntrevista={confirmarEntrevista}
              onMarcarNoAsistio={marcarNoAsistio}
              onCancelarEntrevista={cancelarEntrevista}
              onContactarCandidato={contactarCandidato}
              onClose={() => setCandidatoSeleccionado(null)}
            />
          ) : (
            <DashboardContent
              usuarioLogueado={usuarioLogueado}
              eventosRecientes={eventosRecientes}
              ultimasOfertas={ultimasOfertasEjemplo}
              entrevistas={entrevistasEjemplo}
            />
          )}
        </main>
      </div>

      {/* Modal para móvil */}
      {isMobile && (
        <Sheet open={mostrarDetalles} onOpenChange={setMostrarDetalles}>
          <SheetContent side="bottom" className="h-[90%] pt-10">
            {candidatoSeleccionado && (
              <DetalleCandidato
                candidato={candidatoSeleccionado}
                onConfirmarEntrevista={confirmarEntrevista}
                onMarcarNoAsistio={marcarNoAsistio}
                onCancelarEntrevista={cancelarEntrevista}
                onContactarCandidato={contactarCandidato}
              />
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
