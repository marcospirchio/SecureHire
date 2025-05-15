"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { JobOfferHeader } from "@/components/job-offer/JobOfferHeader"
import { CandidateList } from "@/components/job-offer/CandidateList"
import { CandidateDetails } from "@/components/job-offer/CandidateDetails"
import { jobOfferService } from "@/services/job-offer.service"
import { JobOffer, Candidate, PostulacionRequest } from "@/types/job-offer"
import { Sidebar } from "@/components/dashboard/sidebar"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function JobOfferPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPhase, setFilterPhase] = useState("all")
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

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
              (e: any) => e.postulacionId === p.postulacion.id
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
              cvUrl: p.candidato.cvUrl,
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

  const handleSidebarToggle = (expanded: boolean) => {
    setIsSidebarExpanded(expanded)
  }

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <CandidateList
                candidates={jobOffer.candidates}
                selectedCandidate={selectedCandidate}
                searchQuery={searchQuery}
                filterPhase={filterPhase}
                onSearchChange={setSearchQuery}
                onFilterPhaseChange={setFilterPhase}
                onCandidateSelect={setSelectedCandidate}
              />
            </div>

            <div className="lg:col-span-2">
              {selectedCandidate ? (
                <CandidateDetails
                  candidate={selectedCandidate}
                  onOpenCV={handleOpenCV}
                  onOpenInterview={handleOpenInterview}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-white rounded-lg border p-8">
                  <p className="text-gray-500">Selecciona un candidato para ver sus detalles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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