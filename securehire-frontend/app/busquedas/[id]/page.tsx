"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { JobOfferHeader } from "@/components/job-offer/JobOfferHeader"
import { CandidateDetails } from "@/components/job-offer/CandidateDetails"
import { CandidateCard } from "@/components/job-offer/candidate-card"
import { InterviewModal } from "@/components/job-offer/interview-modal"
import { CandidatesList } from "@/components/job-offer/candidates-list"
import { jobOfferService } from "@/services/job-offer.service"
import { JobOffer, Candidate, PostulacionRequest } from "@/types/job-offer"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useToast } from "@/components/ui/use-toast"
import { Search } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/layout"
import { useEntrevistas } from "@/hooks/use-entrevistas"

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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("notes")
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [finalizationReason, setFinalizationReason] = useState("")
  const { entrevistas: entrevistasHook, loading: entrevistasLoading } = useEntrevistas();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Primero obtener la búsqueda
        const busquedaResponse = await fetch(`http://localhost:8080/api/busquedas/${resolvedParams.id}`, {
          credentials: "include",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!busquedaResponse.ok) {
          throw new Error(`Error al obtener la búsqueda: ${busquedaResponse.status}`);
        }

        const busquedaData = await busquedaResponse.json();

        // Luego obtener las postulaciones
        const postulacionesResponse = await fetch(`http://localhost:8080/api/postulaciones/busqueda/${resolvedParams.id}`, {
          credentials: "include",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!postulacionesResponse.ok) {
          throw new Error(`Error al obtener las postulaciones: ${postulacionesResponse.status}`);
        }

        const postulacionesData = await postulacionesResponse.json();

        // Usar entrevistasHook en vez de fetch manual
        const entrevistasData = entrevistasHook;

        // Asegura que busquedaData puede tener _id y fechaCreacion.$date
        const busqId = busquedaData.id || busquedaData._id || "";
        const busqFecha = busquedaData.fechaCreacion?.$date || busquedaData.fechaCreacion || "";

        // Obtener los datos completos de cada candidato para cada postulación
        const candidates = await Promise.all(
          (Array.isArray(postulacionesData) ? postulacionesData : []).map(async (p: any) => {
            try {
              // Fetch candidato
              const candidatoRes = await fetch(`http://localhost:8080/api/candidatos/${p.candidatoId}`, {
                credentials: "include",
                headers: { 
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                }
              });

              if (!candidatoRes.ok) {
                console.warn(`No se pudo obtener el candidato ${p.candidatoId}:`, candidatoRes.status);
                // Retornar un objeto con datos mínimos en lugar de undefined
                return {
                  id: p.id,
                  name: "Candidato no disponible",
                  lastName: "",
                  email: p.email || "",
                  phone: "",
        countryCode: "+54",
                  dni: "",
                  gender: "No especificado",
                  nationality: "",
                  residenceCountry: "",
                  province: "",
                  address: "",
                  birthDate: "",
                  age: 0,
                  location: "",
                  cvUrl: "",
                  postulacion: {
                    id: p.id,
                    candidatoId: p.candidatoId,
                    busquedaId: p.busquedaId,
                    estado: p.estado || "",
                    requisitosExcluyentes: [],
                    notas: p.notas || [],
                    ...(p as any).resumenCv && { resumenCv: (p as any).resumenCv },
                    respuestas: p.respuestas || []
                  },
                  entrevista: undefined
                } as Candidate;
              }

              const candidato = await candidatoRes.json();

              // Buscar entrevista correspondiente SOLO si está pendiente o confirmada
              const entrevista = Array.isArray(entrevistasData)
                ? entrevistasData.find(
                    (e: any) =>
                      e.candidatoId === p.candidatoId &&
                      ["pendiente de confirmación", "confirmada"].includes((e.estado || "").toLowerCase())
                  )
                : undefined;

              // Calcular requisitos excluyentes no cumplidos
              let requisitosExcluyentes: { campo: string, respuesta: string | string[] }[] = [];
              if (busquedaData.camposAdicionales && Array.isArray(busquedaData.camposAdicionales)) {
                requisitosExcluyentes = busquedaData.camposAdicionales
                  .filter((campo: any) => campo.valoresExcluyentes && campo.valoresExcluyentes.length > 0)
                  .map((campo: any) => {
                    const respuesta = (p.respuestas || []).find((r: any) => r.campo === campo.nombre);
                    if (!respuesta) return { campo: campo.nombre, respuesta: "No respondió" };
                    if (campo.tipo === "checkbox") {
                      const respuestasCandidato = Array.isArray(respuesta.respuesta) ? respuesta.respuesta : [respuesta.respuesta];
                      const valoresExcluyentes = campo.valoresExcluyentes || [];
                      const noCumple = valoresExcluyentes.some((valor: string) => !respuestasCandidato.includes(valor));
                      if (noCumple) {
                        return { campo: campo.nombre, respuesta: respuestasCandidato.join(", ") };
                      }
                    } else {
                      const valoresExcluyentes = campo.valoresExcluyentes || [];
                      if (valoresExcluyentes.length > 0 && !valoresExcluyentes.includes(respuesta.respuesta)) {
                        return { campo: campo.nombre, respuesta: respuesta.respuesta };
                      }
                    }
                    return null;
                  })
                  .filter((req: { campo: string, respuesta: string | string[] } | null) => req !== null) as { campo: string, respuesta: string | string[] }[];
              }

              return {
                id: p.id,
                name: candidato.nombre || "",
                lastName: candidato.apellido || "",
                email: candidato.email || "",
                phone: candidato.telefono || "",
                countryCode: candidato.codigoPais || "+54",
                dni: candidato.dni || "",
                gender: candidato.genero || "No especificado",
                nationality: candidato.nacionalidad || "",
                residenceCountry: candidato.paisResidencia || "",
                province: candidato.provincia || "",
                address: candidato.direccion || "",
                birthDate: candidato.fechaNacimiento || "",
                age: candidato.fechaNacimiento ? calcularEdad(candidato.fechaNacimiento) : 0,
                location: candidato.provincia || "",
                cvUrl: candidato.cvUrl || "",
                postulacion: {
                  id: p.id,
                  candidatoId: p.candidatoId,
                  busquedaId: p.busquedaId,
                  estado: p.estado || "",
                  requisitosExcluyentes: requisitosExcluyentes,
                  notas: p.notas || [],
                  ...(p as any).resumenCv && { resumenCv: (p as any).resumenCv },
                  respuestas: p.respuestas || []
                },
                entrevista: entrevista ? {
                  id: entrevista.id,
                  fechaProgramada: entrevista.fechaProgramada,
                  horaProgramada: entrevista.horaProgramada,
                  estado: entrevista.estado,
                  linkEntrevista: entrevista.linkEntrevista
                } : undefined
              } as Candidate;
            } catch (err) {
              console.warn("Error al mapear candidato para postulación:", p, err);
              // Retornar un objeto con datos mínimos en lugar de undefined
              return {
                id: p.id,
                name: "Error al cargar candidato",
                lastName: "",
                email: p.email || "",
                phone: "",
        countryCode: "+54",
                dni: "",
                gender: "No especificado",
                nationality: "",
                residenceCountry: "",
                province: "",
                address: "",
                birthDate: "",
                age: 0,
                location: "",
                cvUrl: "",
                postulacion: {
                  id: p.id,
                  candidatoId: p.candidatoId,
                  busquedaId: p.busquedaId,
                  estado: p.estado || "",
                  requisitosExcluyentes: [],
                  notas: p.notas || [],
                  ...(p as any).resumenCv && { resumenCv: (p as any).resumenCv },
                  respuestas: p.respuestas || []
                },
                entrevista: undefined
              } as Candidate;
            }
          })
        );

        const jobOfferData: JobOffer = {
          id: busqId,
          titulo: busquedaData.titulo || "",
          empresa: busquedaData.empresa || "",
          ubicacion: busquedaData.ubicacion || "",
          modalidad: busquedaData.modalidad || "",
          tipoContrato: busquedaData.tipoContrato || "No especificado",
          salario: busquedaData.salario || "No especificado",
          fechaCreacion: busqFecha,
          descripcion: busquedaData.descripcion || "",
          beneficios: busquedaData.beneficios || [],
          candidates: candidates.filter((c): c is Candidate => !!c),
          urlPublica: busquedaData.urlPublica
        }

        setJobOffer(jobOfferData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos. Por favor, intente nuevamente.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [resolvedParams.id, toast])

  useEffect(() => {
    if (!jobOffer || entrevistasLoading) return;
  
    const candidatesWithEntrevistas = jobOffer.candidates.map(candidate => {
      const entrevista = entrevistasHook.find(
        (e: any) =>
          e.candidatoId === candidate.id ||
          e.candidatoId === candidate.postulacion?.candidatoId
      );
  
      return {
        ...candidate,
        entrevista: entrevista ? {
          id: entrevista.id,
          fechaProgramada: entrevista.fechaProgramada,
          horaProgramada: entrevista.horaProgramada ?? "", // corregido
          estado: entrevista.estado,
          linkEntrevista: entrevista.linkEntrevista ?? ""   // corregido
        } : undefined
      };
    });
  
    setJobOffer(prev => prev ? { ...prev, candidates: candidatesWithEntrevistas } : null);
  }, [entrevistasHook, entrevistasLoading]);
  
  
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

  const handleEndProcess = () => {
    setIsFeedbackModalOpen(true)
  }

  const handleFinishProcess = async () => {
    if (selectedCandidate && feedback.trim() && finalizationReason.trim()) {
      try {
        // Si hay una entrevista pendiente o confirmada, cancelarla
        if (selectedCandidate.entrevista && 
            (selectedCandidate.entrevista.estado.toLowerCase() === "pendiente de confirmación" || 
             selectedCandidate.entrevista.estado.toLowerCase() === "confirmada")) {
          
          const entrevistaData = {
            estado: "cancelada",
            motivoCancelacion: "El reclutador canceló la entrevista."
          }

          console.log("Cancelando entrevista:", selectedCandidate.entrevista.id, entrevistaData)

          const entrevistaResponse = await fetch(`http://localhost:8080/api/entrevistas/${selectedCandidate.entrevista.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(entrevistaData)
          })

          if (!entrevistaResponse.ok) {
            const errorText = await entrevistaResponse.text()
            console.error("Error al cancelar entrevista:", errorText)
            throw new Error("Error al cancelar la entrevista")
          }
        }

        // Actualizar el estado de la postulación
        const postulacionResponse = await fetch(`http://localhost:8080/api/postulaciones/${selectedCandidate.postulacion.id}/estado?nuevoEstado=FINALIZADA&motivo=${encodeURIComponent(finalizationReason)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: "include"
        })

        if (!postulacionResponse.ok) {
          throw new Error("Error al actualizar el estado de la postulación")
        }

        // Crear el comentario
        const comentarioData = {
          postulacionId: selectedCandidate.postulacion.id,
          candidatoId: selectedCandidate.id,
          texto: `${feedback}`
        }

        console.log("Enviando comentario:", comentarioData)

        const comentarioResponse = await fetch("http://localhost:8080/api/comentarios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(comentarioData)
        })

        if (!comentarioResponse.ok) {
          const errorText = await comentarioResponse.text()
          console.error("Error response:", errorText)
          throw new Error(`Error al crear el comentario: ${errorText}`)
        }

        // Recargar los datos de la búsqueda y postulaciones
        const [busquedaData, postulacionesData] = await Promise.all([
          jobOfferService.getJobOffer(resolvedParams.id),
          jobOfferService.getCandidates(resolvedParams.id)
        ])

        // Obtener los datos completos de cada candidato para cada postulación
        const candidates = await Promise.all(
          (Array.isArray(postulacionesData) ? postulacionesData : []).map(async (p: any) => {
            try {
              // Fetch candidato
              const candidatoRes = await fetch(`http://localhost:8080/api/candidatos/${p.candidatoId}`, {
                credentials: "include",
                headers: { 'Accept': 'application/json' }
              });
              if (!candidatoRes.ok) throw new Error("No se pudo obtener el candidato");
              const candidato = await candidatoRes.json();

              // Buscar entrevista correspondiente
              const entrevista = Array.isArray(entrevistasHook)
                ? entrevistasHook.find(
                    (e: any) =>
                      e.candidatoId === p.candidatoId &&
                      ["pendiente de confirmación", "confirmada"].includes((e.estado || "").toLowerCase())
                  )
                : undefined;

              return {
                id: p.id,
                name: candidato.nombre || "",
                lastName: candidato.apellido || "",
                email: candidato.email || "",
                phone: candidato.telefono || "",
                countryCode: candidato.codigoPais || "+54",
                dni: candidato.dni || "",
                gender: candidato.genero || "No especificado",
                nationality: candidato.nacionalidad || "",
                residenceCountry: candidato.paisResidencia || "",
                province: candidato.provincia || "",
                address: candidato.direccion || "",
                birthDate: candidato.fechaNacimiento || "",
                age: candidato.fechaNacimiento ? calcularEdad(candidato.fechaNacimiento) : 0,
                location: candidato.provincia || "",
                cvUrl: candidato.cvUrl || "",
                postulacion: {
                  id: p.id,
                  candidatoId: p.candidatoId,
                  busquedaId: p.busquedaId,
                  estado: p.estado || "",
                  requisitosExcluyentes: [],
                  notas: p.notas || [],
                  ...(p as any).resumenCv && { resumenCv: (p as any).resumenCv },
                  respuestas: p.respuestas || []
                },
                entrevista: entrevista ? {
                  id: entrevista.id,
                  fechaProgramada: entrevista.fechaProgramada,
                  horaProgramada: entrevista.horaProgramada,
                  estado: entrevista.estado,
                  linkEntrevista: entrevista.linkEntrevista
                } : undefined
              } as Candidate;
            } catch (err) {
              console.warn("No se pudo mapear candidato para postulación:", p, err);
              return undefined;
            }
          })
        );

        const jobOfferData: JobOffer = {
          id: (busquedaData as any).id || "",
          titulo: (busquedaData as any).titulo || "",
          empresa: (busquedaData as any).empresa || "",
          ubicacion: (busquedaData as any).ubicacion || "",
          modalidad: (busquedaData as any).modalidad || "",
          tipoContrato: (busquedaData as any).tipoContrato || "No especificado",
          salario: (busquedaData as any).salario || "No especificado",
          fechaCreacion: (busquedaData as any).fechaCreacion || "",
          descripcion: (busquedaData as any).descripcion || "",
          beneficios: (busquedaData as any).beneficios || [],
          candidates: candidates.filter((c): c is Candidate => !!c),
        }

        setJobOffer(jobOfferData)

        toast({
          title: "Proceso finalizado",
          description: "El proceso ha sido finalizado correctamente.",
        })

        setIsFeedbackModalOpen(false)
        setFeedback("")
        setFinalizationReason("")
        setSelectedCandidate(null)
      } catch (error) {
        console.error("Error completo:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "No se pudo finalizar el proceso.",
          variant: "destructive",
        })
      }
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
      const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${time}:00`

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
    return nameMatch
  }) || []

  if (!jobOffer) {
    return <div>Cargando...</div>
  }

  return (
    <Sidebar>
      <DashboardLayout>
        <JobOfferHeader
          title={jobOffer.titulo}
          onBack={handleBack}
          onOpenJobDetails={handleOpenJobDetails}
          busquedaId={resolvedParams.id}
          urlPublica={jobOffer.urlPublica}
        />

        <div className="flex flex-1 gap-3 overflow-hidden">
          {/* Lista de candidatos */}
          <CandidatesList
            candidates={filteredCandidates}
            selectedCandidate={selectedCandidate}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCandidateClick={setSelectedCandidate}
            isCollapsed={!!selectedCandidate}
            jobOffer={jobOffer}
            entrevistas={entrevistasHook}
          />

          {/* Panel de detalles del candidato */}
          {selectedCandidate && (
            <CandidateDetails
              candidate={selectedCandidate}
              onClose={() => setSelectedCandidate(null)}
              onOpenInterviewModal={() => setIsInterviewModalOpen(true)}
              onOpenFeedbackModal={handleEndProcess}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}
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

        {/* Modal para finalizar proceso */}
        <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                Finalizar proceso de {selectedCandidate?.name} {selectedCandidate?.lastName}
              </DialogTitle>
              <DialogDescription>
                Por favor, ingrese su feedback y el motivo de finalización del proceso.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Motivo de finalización</label>
                <Input
                  placeholder="Ingrese el motivo de finalización..."
                  value={finalizationReason}
                  onChange={(e) => setFinalizationReason(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Feedback</label>
                <Textarea
                  placeholder="Ingrese su feedback sobre el candidato..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsFeedbackModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleFinishProcess} 
                disabled={!feedback.trim() || !finalizationReason.trim()} 
                className="bg-red-500 hover:bg-red-600"
              >
                Finalizar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </Sidebar>
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