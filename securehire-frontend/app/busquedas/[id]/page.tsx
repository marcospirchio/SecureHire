"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { JobOfferHeader } from "@/components/job-offer/JobOfferHeader"
import { CandidateDetails } from "@/components/job-offer/CandidateDetails"
import { CandidateCard } from "@/components/job-offer/candidate-card"
import { InterviewModal } from "@/components/job-offer/interview-modal"
import { jobOfferService } from "@/services/job-offer.service"
import { JobOffer, Candidate, PostulacionRequest } from "@/types/job-offer"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useToast } from "@/components/ui/use-toast"
import { Search } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface EntrevistaConCandidato {
  id: string
  fechaProgramada: string
  horaProgramada: string
  estado: string
  linkEntrevista: string
  nombreCandidato: string
  apellidoCandidato: string
  tituloPuesto: string
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function JobOfferPage({ params }: PageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPhase, setFilterPhase] = useState("all")
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
  const [entrevistas, setEntrevistas] = useState<EntrevistaConCandidato[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [busquedaData, postulacionesData, entrevistasData] = await Promise.all([
          jobOfferService.getJobOffer(resolvedParams.id),
          jobOfferService.getCandidates(resolvedParams.id),
          fetch('http://localhost:8080/api/entrevistas/mis-entrevistas-con-candidato', {
            credentials: "include",
            headers: {
              'Accept': 'application/json'
            }
          }).then(res => res.json())
        ])

        setEntrevistas(entrevistasData)

        const jobOfferData: JobOffer = {
          id: busquedaData.id,
          titulo: busquedaData.titulo,
          faseActual: busquedaData.faseActual || "Sin fase",
          empresa: busquedaData.empresa || "",
          ubicacion: busquedaData.ubicacion || "",
          modalidad: busquedaData.modalidad || "",
          fechaCreacion: busquedaData.fechaCreacion,
          descripcion: busquedaData.descripcion || "",
          beneficios: busquedaData.beneficios || [],
          candidates: postulacionesData.map((p: PostulacionRequest) => {
            const entrevista = entrevistasData.find(
              (e: EntrevistaConCandidato) => 
                e.nombreCandidato === p.candidato.nombre && 
                e.apellidoCandidato === p.candidato.apellido
            )

            return {
              id: p.postulacion.id,
              name: p.candidato.nombre,
              lastName: p.candidato.apellido,
              email: p.candidato.email,
              phone: p.candidato.telefono,
              countryCode: "+54",
              dni: p.candidato.dni,
              gender: p.candidato.genero || "No especificado",
              nationality: p.candidato.nacionalidad,
              residenceCountry: p.candidato.paisResidencia,
              province: p.candidato.provincia,
              address: p.candidato.direccion,
              birthDate: p.candidato.fechaNacimiento,
              age: calcularEdad(p.candidato.fechaNacimiento),
              location: p.candidato.provincia,
              cvUrl: p.candidato.cvUrl || "",
              postulacion: {
                id: p.postulacion.id,
                fase: p.postulacion.fase || "Sin fase",
                requisitosExcluyentes: p.postulacion.requisitosExcluyentes || [],
                notas: p.postulacion.notas || []
              },
              entrevista: entrevista ? {
                id: entrevista.id,
                fechaProgramada: entrevista.fechaProgramada,
                horaProgramada: entrevista.horaProgramada,
                estado: entrevista.estado,
                linkEntrevista: entrevista.linkEntrevista
              } : undefined
            } as Candidate
          })
        }

        setJobOffer(jobOfferData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [resolvedParams.id])

  const handleBack = () => {
    router.back()
  }

  const handleOpenJobDetails = () => {
    router.push(`/busquedas/${resolvedParams.id}/detalles`)
  }

  const handleOpenCV = () => {
    if (selectedCandidate?.cvUrl) {
      window.open(selectedCandidate.cvUrl, "_blank")
    }
  }

  const handleOpenInterview = () => {
    if (selectedCandidate?.entrevista?.linkEntrevista) {
      window.open(selectedCandidate.entrevista.linkEntrevista, "_blank")
    }
  }

  const handleScheduleInterview = () => {
    if (selectedCandidate) {
      router.push(`/busquedas/${resolvedParams.id}/entrevista/${selectedCandidate.id}`)
    }
  }

  const handlePhaseChange = async (newPhase: string) => {
    if (!selectedCandidate) return

    try {
      await jobOfferService.updateCandidateStatus(resolvedParams.id, selectedCandidate.id, newPhase, "")
      
      // Actualizar el estado local
      setJobOffer(prev => {
        if (!prev) return null
        return {
          ...prev,
          candidates: prev.candidates.map(c => 
            c.id === selectedCandidate.id 
              ? { ...c, postulacion: { ...c.postulacion, fase: newPhase } }
              : c
          )
        }
      })

      toast({
        title: "Fase actualizada",
        description: "La fase del candidato ha sido actualizada correctamente.",
      })
    } catch (error) {
      console.error("Error updating phase:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la fase del candidato.",
        variant: "destructive",
      })
    }
  }

  const handleEndProcess = async () => {
    if (!selectedCandidate) return

    try {
      await jobOfferService.updateCandidateStatus(resolvedParams.id, selectedCandidate.id, "Rechazado", "Proceso finalizado")
      
      // Actualizar el estado local
      setJobOffer(prev => {
        if (!prev) return null
        return {
          ...prev,
          candidates: prev.candidates.filter(c => c.id !== selectedCandidate.id)
        }
      })

      setSelectedCandidate(null)
      toast({
        title: "Proceso finalizado",
        description: "El proceso del candidato ha sido finalizado correctamente.",
      })
    } catch (error) {
      console.error("Error ending process:", error)
      toast({
        title: "Error",
        description: "No se pudo finalizar el proceso del candidato.",
        variant: "destructive",
      })
    }
  }

  const handleSidebarToggle = (expanded: boolean) => {
    setIsSidebarExpanded(expanded)
  }

  const handleConfirmInterview = async (date: string, time: string) => {
    if (!selectedCandidate) return

    try {
      // Formatear la fecha para el backend (YYYY-MM-DD)
      const [day, month, year] = date.split("/")
      const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${time}:00.000Z`

      const entrevistaData = {
        busquedaId: resolvedParams.id,
        postulacionId: selectedCandidate.postulacion.id,
        fechaProgramada: formattedDate,
        horaProgramada: time,
        estado: "Pendiente de confirmación",
        linkEntrevista: "https://meet.google.com/xyz-123", // Esto debería venir del backend
        motivoCancelacion: null,
        comentarios: []
      }

      const response = await fetch("http://localhost:8080/api/entrevistas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(entrevistaData)
      })

      if (!response.ok) {
        throw new Error("Error al crear la entrevista")
      }

      const entrevista = await response.json()

      // Actualizar el estado local
      setJobOffer(prev => {
        if (!prev) return null
        return {
          ...prev,
          candidates: prev.candidates.map(c => 
            c.id === selectedCandidate.id 
              ? {
                  ...c,
                  entrevista: {
                    id: entrevista.id,
                    fechaProgramada: date,
                    horaProgramada: time,
                    estado: "Pendiente de confirmación",
                    linkEntrevista: entrevista.linkEntrevista
                  },
                  postulacion: {
                    ...c.postulacion,
                    fase: "Entrevista agendada"
                  }
                }
              : c
          )
        }
      })

      toast({
        title: "Entrevista agendada",
        description: "La entrevista ha sido agendada correctamente.",
      })

      setIsInterviewModalOpen(false)
    } catch (error) {
      console.error("Error al agendar entrevista:", error)
      toast({
        title: "Error",
        description: "No se pudo agendar la entrevista.",
        variant: "destructive",
      })
    }
  }

  const filteredCandidates = jobOffer?.candidates.filter(candidate => {
    const nameMatch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     candidate.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    const phaseMatch = filterPhase === "all" || candidate.postulacion.fase === filterPhase
    return nameMatch && phaseMatch
  }) || []

  if (!jobOffer) {
    return <div>Cargando...</div>
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onToggle={handleSidebarToggle} />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="container mx-auto p-4">
          <JobOfferHeader
            title={jobOffer.titulo}
            phase={jobOffer.faseActual}
            onBack={handleBack}
            onOpenJobDetails={handleOpenJobDetails}
          />

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
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isSelected={selectedCandidate?.id === candidate.id}
                    onClick={setSelectedCandidate}
                  />
                ))}
              </div>
            </div>

            {/* Panel de detalles del candidato */}
            {selectedCandidate && (
              <CandidateDetails
                candidate={selectedCandidate}
                onClose={() => setSelectedCandidate(null)}
                onOpenInterviewModal={() => setIsInterviewModalOpen(true)}
                onOpenFeedbackModal={handleEndProcess}
                onPhaseChange={handlePhaseChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal para agendar entrevista */}
      {selectedCandidate && (
        <InterviewModal
          isOpen={isInterviewModalOpen}
          onClose={() => setIsInterviewModalOpen(false)}
          candidate={selectedCandidate}
          onConfirm={handleConfirmInterview}
        />
      )}
    </div>
  )
}

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date()
  const fechaNac = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - fechaNac.getFullYear()
  const mesActual = hoy.getMonth()
  const mesNacimiento = fechaNac.getMonth()

  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNac.getDate())) {
    edad--
  }

  return edad
}