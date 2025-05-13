"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Search,
  Settings,
  X,
  Calendar,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

// Tipos para los datos
interface Candidate {
  id: string
  name: string
  lastName: string
  age: number
  gender: string
  location: string
  phase: string
  interview?: {
    date: string
    time: string
  }
  email: string
  phone: string
  countryCode: string
  dni: string
  birthDate: string
  nationality: string
  residenceCountry: string
  province: string
  address: string
  cvUrl: string
  excludingRequirements?: string[]
  notes?: {
    author: string
    company: string
    date: string
    content: string
  }[]
}

interface JobOffer {
  id: string
  title: string
  phase: string
  candidates: Candidate[]
  company: string
  location: string
  workMode: string
  publishedDate: string
  description: string
  benefits: string[]
}

// Componente interno que usa useSidebar
function JobOfferDetail() {
  const params = useParams()
  const router = useRouter()
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPhase, setFilterPhase] = useState("all")
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [feedback, setFeedback] = useState("")
  const [activeTab, setActiveTab] = useState("notes")

  // Datos de ejemplo para la oferta de trabajo
  const jobOffer: JobOffer = {
    id: params.id as string,
    title: "Product Manager",
    phase: "Pendiente de confirmación",
    company: "TechSolutions Inc.",
    location: "Buenos Aires",
    workMode: "Presencial",
    publishedDate: "13/05/2025",
    description:
      "Buscamos un Product Manager con experiencia en desarrollo de productos digitales. Responsable de definir la visión del producto, crear roadmaps y trabajar con equipos multidisciplinarios para entregar soluciones de alta calidad.",
    benefits: [
      "Horario flexible",
      "Trabajo remoto parcial",
      "Seguro médico",
      "Oportunidades de crecimiento profesional",
      "Capacitación continua",
    ],
    candidates: [
      {
        id: "1",
        name: "Elena",
        lastName: "Martín",
        age: 26,
        gender: "Femenino",
        location: "No especificada",
        phase: "Pendiente de confirmación",
        interview: {
          date: "20/05",
          time: "09:30hs",
        },
        email: "elena.martin@gmail.com",
        phone: "2222-3333",
        countryCode: "+54",
        dni: "35789456",
        birthDate: "15/08/1998 (26 años)",
        nationality: "Argentina",
        residenceCountry: "Argentina",
        province: "Buenos Aires",
        address: "Av. Corrientes 1234",
        cvUrl: "https://cv.elena.com",
      },
      {
        id: "2",
        name: "Gonzi",
        lastName: "Caldas",
        age: 30,
        gender: "MASCULINO",
        location: "Buenos Aires",
        phase: "Pendiente de confirmación",
        email: "caldasgonzalo@gmail.com",
        phone: "1111-2222",
        countryCode: "+54",
        dni: "45274631",
        birthDate: "09/04/1995 (30 años)",
        nationality: "Argentina",
        residenceCountry: "Argentina",
        province: "Buenos Aires",
        address: "Av. Rivadavia 456",
        cvUrl: "https://cv.gonzi.com",
        excludingRequirements: ["Conocimiento de TypeScript"],
        notes: [
          {
            author: "Ana Martínez",
            company: "UADE",
            date: "05/02/2025",
            content:
              "El candidato demuestra una sólida comprensión de principios contables y experiencia práctica en conciliaciones bancarias, armado de reportes y manejo de sistemas como Tango avanzado. Durante la entrevista, mostró seguridad al describir sus responsabilidades anteriores y aportó ejemplos concretos de cierres mensuales y trabajo en equipo con auditorías externas.",
          },
        ],
      },
      {
        id: "3",
        name: "Carlos",
        lastName: "Rodríguez",
        age: 28,
        gender: "MASCULINO",
        location: "Córdoba",
        phase: "CV recibido",
        email: "carlos.rodriguez@gmail.com",
        phone: "3333-4444",
        countryCode: "+54",
        dni: "39456123",
        birthDate: "22/11/1997 (28 años)",
        nationality: "Argentina",
        residenceCountry: "Argentina",
        province: "Córdoba",
        address: "Av. Colón 789",
        cvUrl: "https://cv.carlos.com",
      },
    ],
  }

  // Filtrar candidatos según la búsqueda y el filtro de fase
  const filteredCandidates = jobOffer.candidates.filter((candidate) => {
    const fullName = `${candidate.name} ${candidate.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase())
    const matchesPhase = filterPhase === "all" || candidate.phase === filterPhase
    return matchesSearch && matchesPhase
  })

  // Manejar la selección de un candidato
  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  // Manejar el cierre del panel de detalles
  const handleCloseDetails = () => {
    setSelectedCandidate(null)
  }

  // Manejar la apertura del modal de entrevista
  const handleOpenInterviewModal = () => {
    setIsInterviewModalOpen(true)
  }

  // Manejar la apertura del modal de feedback
  const handleOpenFeedbackModal = () => {
    setIsFeedbackModalOpen(true)
  }

  // Manejar la apertura del modal de detalles de la oferta
  const handleOpenJobDetailsModal = () => {
    setIsJobDetailsModalOpen(true)
  }

  // Estado para el mes actual del calendario
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4, 13)) // Mayo 2025

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(newMonth.getMonth() - 1)
      return newMonth
    })
  }

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(newMonth.getMonth() + 1)
      return newMonth
    })
  }

  // Generar días del calendario para el mes actual
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Primer día del mes
    const firstDay = new Date(year, month, 1)
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0)

    // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
    let firstDayOfWeek = firstDay.getDay() - 1
    if (firstDayOfWeek === -1) firstDayOfWeek = 6 // Si es domingo (0), convertir a 6

    const daysInMonth = lastDay.getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days = []

    // Días del mes anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      })
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
      })
    }

    // Días del mes siguiente para completar la última semana
    const remainingDays = 7 - (days.length % 7 || 7)
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      })
    }

    return days
  }

  // Obtener los días para el calendario
  const calendarDays = generateCalendarDays()

  // Formatear el mes y año para mostrar
  const formattedMonthYear = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(currentMonth)

  // Verificar si una fecha es hoy
  const isToday = (day, month, year) => {
    const today = new Date(2025, 4, 13) // Simulamos que hoy es 13 de mayo de 2025
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  // Verificar si una fecha está seleccionada
  const isDateSelected = (day, month, year) => {
    if (!selectedDate) return false

    // Parsear la fecha seleccionada
    const [selectedDay, selectedMonth, selectedYear] = selectedDate.split("/").map(Number)
    return day === selectedDay && month + 1 === selectedMonth && year === selectedYear
  }

  // Manejar la selección de fecha
  const handleDateSelect = (day, month, year) => {
    // Solo permitir seleccionar días del mes actual
    if (month === currentMonth.getMonth() && year === currentMonth.getFullYear()) {
      setSelectedDate(`${day}/${month + 1}/${year}`)
      setSelectedTime(null) // Reiniciar el tiempo cuando se selecciona una nueva fecha
    }
  }

  // Manejar la confirmación de la entrevista
  const handleConfirmInterview = () => {
    if (selectedDate && selectedTime && selectedCandidate) {
      // Extraer día y mes de la fecha seleccionada
      const [day, month, year] = selectedDate.split("/")

      // Aquí iría la lógica para guardar la entrevista
      // Por ahora, simulamos actualizar el candidato con la nueva fecha de entrevista
      const updatedCandidates = jobOffer.candidates.map((candidate) => {
        if (candidate.id === selectedCandidate.id) {
          return {
            ...candidate,
            interview: {
              date: `${day}/${month}`,
              time: `${selectedTime}hs`,
            },
            phase: "Entrevista agendada",
          }
        }
        return candidate
      })

      // Actualizar el estado
      // En una aplicación real, esto sería una llamada a la API
      console.log(`Entrevista agendada: ${day}/${month} a las ${selectedTime}hs`)

      setIsInterviewModalOpen(false)
      setSelectedDate(null)
      setSelectedTime(null)
    }
  }

  // Manejar la finalización del proceso
  const handleFinishProcess = () => {
    // Aquí iría la lógica para finalizar el proceso
    setIsFeedbackModalOpen(false)
    setFeedback("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-32px)]">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-7 w-7 p-0"
            onClick={() => router.push("/busquedas")}
          >
            <ArrowLeft className="h-3 w-3" />
          </Button>
          <div>
            <h1
              className="text-lg font-bold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleOpenJobDetailsModal}
            >
              {jobOffer.title}
            </h1>
            <p className="text-xs text-gray-500">{jobOffer.phase}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Settings className="mr-1 h-3 w-3" /> Gestionar fases
          </Button>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px] h-7 text-xs">
              <SelectValue placeholder="Todas las fases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fases</SelectItem>
              <SelectItem value="Pendiente de confirmación">Pendiente de confirmación</SelectItem>
              <SelectItem value="CV recibido">CV recibido</SelectItem>
              <SelectItem value="Entrevista agendada">Entrevista agendada</SelectItem>
              <SelectItem value="Proceso finalizado">Proceso finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* Lista de candidatos */}
        <div
          className={`flex flex-col ${selectedCandidate ? "w-1/2" : "w-full"} bg-white rounded-lg border p-3 overflow-hidden`}
        >
          <div className="mb-3 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Búsqueda de candidatos"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-md border border-gray-200 bg-white pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-200"
              />
            </div>
            <Select defaultValue="all" onValueChange={setFilterPhase}>
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue placeholder="Todos los..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los...</SelectItem>
                <SelectItem value="Pendiente de confirmación">Pendiente de confirmación</SelectItem>
                <SelectItem value="CV recibido">CV recibido</SelectItem>
                <SelectItem value="Entrevista agendada">Entrevista agendada</SelectItem>
                <SelectItem value="Proceso finalizado">Proceso finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`rounded-lg border p-3 cursor-pointer hover:border-gray-300 transition-colors ${
                  selectedCandidate?.id === candidate.id ? "border-blue-300 bg-blue-50" : ""
                }`}
                onClick={() => handleCandidateClick(candidate)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold">
                    {candidate.name} {candidate.lastName}
                  </h3>
                  {candidate.interview && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      ENTREVISTA {candidate.interview.date} | {candidate.interview.time}
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex gap-1">
                    <span className="text-gray-500">Edad:</span>
                    <span>{candidate.age} años</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-gray-500">Sexo:</span>
                    <span>{candidate.gender}</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-gray-500">Localidad:</span>
                    <span>{candidate.location}</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-gray-500">Fase:</span>
                    <span className="font-medium">{candidate.phase}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de detalles del candidato */}
        {selectedCandidate && (
          <div className="w-1/2 bg-white rounded-lg border p-3 overflow-y-auto relative">
            <button onClick={handleCloseDetails} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-xl font-bold mb-4">
              {selectedCandidate.name} {selectedCandidate.lastName}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <div className="text-gray-400 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Teléfono:</div>
                  <div className="text-sm font-medium">
                    {selectedCandidate.countryCode} {selectedCandidate.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="text-gray-400 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email:</div>
                  <div className="text-sm font-medium">{selectedCandidate.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="text-gray-400 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500">DNI:</div>
                  <div className="text-sm font-medium">{selectedCandidate.dni}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="text-gray-400 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Fecha de nacimiento:</div>
                  <div className="text-sm font-medium">{selectedCandidate.birthDate}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="text-gray-400 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Género:</div>
                  <div className="text-sm font-medium">{selectedCandidate.gender}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="text-gray-400 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Nacionalidad:</div>
                  <div className="text-sm font-medium">{selectedCandidate.nationality}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2">
              <div className="text-gray-400 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500">Dirección:</div>
                <div className="text-sm font-medium">
                  {selectedCandidate.address}, {selectedCandidate.province}, {selectedCandidate.residenceCountry}
                </div>
              </div>
            </div>

            <div className="mt-4 border-t pt-4"></div>

            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-gray-500">Fase actual:</div>
              <div className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {selectedCandidate.phase}
              </div>
            </div>

            {selectedCandidate.excludingRequirements && selectedCandidate.excludingRequirements.length > 0 && (
              <div className="mt-4 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      El candidato no cumple con el/los siguientes requisitos excluyentes:
                    </p>
                    <ul className="mt-2 ml-5 list-disc">
                      {selectedCandidate.excludingRequirements.map((req, index) => (
                        <li key={index} className="text-sm text-amber-700">
                          - {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Select defaultValue="phase">
                <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                  <SelectValue placeholder="Cambiar fase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phase">Cambiar fase</SelectItem>
                  <SelectItem value="cv">CV recibido</SelectItem>
                  <SelectItem value="interview">Entrevista agendada</SelectItem>
                  <SelectItem value="pending">Pendiente de confirmación</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="hired">Contratado</SelectItem>
                </SelectContent>
              </Select>

              <Button className="h-9 text-xs bg-green-600 hover:bg-green-700" onClick={handleOpenInterviewModal}>
                <Calendar className="mr-1 h-3 w-3" /> Agendar Entrevista
              </Button>

              <Button variant="destructive" className="h-9 text-xs" onClick={handleOpenFeedbackModal}>
                Finalizar proceso
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button className="h-8 text-xs flex items-center gap-1 mb-4" variant="outline">
                <FileText className="h-3 w-3" /> Ver CV
              </Button>

              <Tabs defaultValue="notes" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="notes">Mis anotaciones</TabsTrigger>
                  <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
                </TabsList>
                <TabsContent value="notes" className="mt-4">
                  {selectedCandidate.notes && selectedCandidate.notes.length > 0 ? (
                    <div className="space-y-4">
                      {selectedCandidate.notes.map((note, index) => (
                        <div key={index} className="border-b pb-4">
                          <div className="flex justify-between mb-2">
                            <div className="font-medium">
                              {note.author} <span className="text-gray-500 font-normal">Trabaja en {note.company}</span>
                            </div>
                            <div className="text-gray-500 text-sm">{note.date}</div>
                          </div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No hay anotaciones disponibles.</p>
                  )}
                </TabsContent>
                <TabsContent value="feedbacks" className="mt-4">
                  <p className="text-gray-500 text-sm">No hay feedbacks disponibles.</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>

      {/* Modal para agendar entrevista */}
      <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-y-auto max-h-[85vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Agendar entrevista</DialogTitle>
              <DialogDescription>
                Seleccione una fecha y horario para la entrevista con {selectedCandidate?.name}{" "}
                {selectedCandidate?.lastName}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {/* Encabezado del calendario con navegación */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">{formattedMonthYear}</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 p-0" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 p-0" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Calendario */}
              <div className="border rounded-lg overflow-hidden">
                {/* Días de la semana */}
                <div className="grid grid-cols-7 text-center border-b">
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, i) => (
                    <div key={i} className="py-2 text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 text-center">
                  {calendarDays.map((date, index) => (
                    <div
                      key={index}
                      className={`py-2 ${
                        !date.isCurrentMonth
                          ? "text-gray-400"
                          : isToday(date.day, date.month, date.year)
                            ? "border border-gray-900 rounded-md"
                            : isDateSelected(date.day, date.month, date.year)
                              ? "bg-blue-100"
                              : "hover:bg-gray-50"
                      } ${date.isCurrentMonth ? "cursor-pointer" : ""}`}
                      onClick={() => date.isCurrentMonth && handleDateSelect(date.day, date.month, date.year)}
                    >
                      {date.day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selección de horario */}
              {selectedDate && (
                <div className="mt-6">
                  <h4 className="flex items-center text-base font-medium mb-4">
                    <Clock className="mr-2 h-5 w-5" />
                    Horario para el{" "}
                    {new Date(
                      selectedDate.split("/")[2],
                      selectedDate.split("/")[1] - 1,
                      selectedDate.split("/")[0],
                    ).toLocaleDateString("es-ES", { weekday: "long" })}{" "}
                    {selectedDate.split("/")[0]} de{" "}
                    {new Date(selectedDate.split("/")[2], selectedDate.split("/")[1] - 1, 1).toLocaleDateString(
                      "es-ES",
                      { month: "long" },
                    )}
                    :
                  </h4>

                  <div className="pr-2">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        "09:00",
                        "09:30",
                        "10:00",
                        "10:30",
                        "11:00",
                        "11:30",
                        "12:00",
                        "12:30",
                        "13:00",
                        "13:30",
                        "14:00",
                        "14:30",
                        "15:00",
                        "15:30",
                        "16:00",
                        "16:30",
                        "17:00",
                        "17:30",
                        "18:00",
                        "18:30",
                        "19:00",
                        "19:30",
                      ].map((time) => (
                        <button
                          key={time}
                          className={`py-3 px-4 border rounded-md text-center hover:bg-gray-50 ${
                            selectedTime === time ? "border-blue-500 bg-blue-50" : "border-gray-200"
                          }`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6 mt-6 border-t">
              <Button variant="outline" onClick={() => setIsInterviewModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmInterview} disabled={!selectedDate || !selectedTime}>
                Agendar entrevista
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para finalizar proceso */}
      <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Finalizar proceso de {selectedCandidate?.name} {selectedCandidate?.lastName}
            </DialogTitle>
            <DialogDescription>
              Por favor, ingrese su feedback sobre el candidato antes de finalizar el proceso. Este feedback se agregará
              a la sección de feedbacks del perfil.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ingrese su feedback sobre el candidato..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsFeedbackModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFinishProcess} disabled={!feedback.trim()} className="bg-red-500 hover:bg-red-600">
              Finalizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para detalles de la oferta */}
      <Dialog open={isJobDetailsModalOpen} onOpenChange={setIsJobDetailsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalles de la Oferta</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <h2 className="text-xl font-bold mb-1">{jobOffer.title}</h2>
            <p className="text-gray-500 mb-4">
              {jobOffer.company} - {jobOffer.location} ({jobOffer.workMode})
            </p>

            <div className="border-t border-gray-200 my-4"></div>

            <div className="flex justify-between mb-4">
              <span className="font-medium">Publicado el:</span>
              <span>{jobOffer.publishedDate}</span>
            </div>

            <h3 className="font-medium mb-2">Descripción del puesto:</h3>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-sm">{jobOffer.description}</p>
            </div>

            <h3 className="font-medium mb-2">Beneficios:</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <ul className="list-none">
                {jobOffer.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm mb-1">
                    - {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsJobDetailsModalOpen(false)} className="bg-gray-900 hover:bg-gray-800">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente principal que envuelve todo con Sidebar
export default function JobOfferDetailPage() {
  return (
    <Sidebar>
      <DashboardLayout>
        <JobOfferDetail />
      </DashboardLayout>
    </Sidebar>
  )
}
