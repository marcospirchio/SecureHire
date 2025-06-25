import { Search, Filter, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Candidate, JobOffer } from "@/types/job-offer"
import { CandidateCard } from "./candidate-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface CandidatesListProps {
  candidates: Candidate[]
  selectedCandidate: Candidate | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  onCandidateClick: (candidate: Candidate) => void
  isCollapsed: boolean
  jobOffer?: JobOffer
  entrevistas?: any[]
  busquedaId: string
  onCandidatesUpdate: (candidates: Candidate[]) => void
}

export function CandidatesList({
  candidates,
  selectedCandidate,
  searchQuery,
  setSearchQuery,
  onCandidateClick,
  isCollapsed,
  jobOffer,
  entrevistas,
  busquedaId,
  onCandidatesUpdate
}: CandidatesListProps) {
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [favoriteCandidates, setFavoriteCandidates] = useState<Candidate[]>([])
  const [originalCandidates, setOriginalCandidates] = useState<Candidate[]>(candidates)
  const [minAge, setMinAge] = useState("")
  const [maxAge, setMaxAge] = useState("")
  const [gender, setGender] = useState("todos")
  const [requisitosFilter, setRequisitosFilter] = useState("todos")
  
  const [tempMinAge, setTempMinAge] = useState("")
  const [tempMaxAge, setTempMaxAge] = useState("")
  const [tempGender, setTempGender] = useState("todos")
  const [tempRequisitosFilter, setTempRequisitosFilter] = useState("todos")

  // Actualizar originalCandidates cuando cambia candidates
  useEffect(() => {
    if (!showOnlyFavorites) {
      setOriginalCandidates(candidates);
    }
  }, [candidates, showOnlyFavorites]);

  const handleToggleFavorites = async () => {
    try {
      if (!showOnlyFavorites) {
        // Si vamos a mostrar favoritos, los obtenemos
        const response = await fetch(`http://localhost:8080/api/postulaciones/busqueda/${busquedaId}/favoritos`, {
          credentials: "include",
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          const postulacionesData = await response.json();
          
          const candidates = await Promise.all(
            (Array.isArray(postulacionesData) ? postulacionesData : []).map(async (p: any) => {
              try {
                // Buscar el candidato original para mantener los requisitosExcluyentes
                const originalCandidate = originalCandidates.find(c => c.postulacion.id === p.id);
                
                const candidatoRes = await fetch(`http://localhost:8080/api/candidatos/${p.candidatoId}`, {
                  credentials: "include",
                  headers: { 'Accept': 'application/json' }
                });

                if (!candidatoRes.ok) {
                  console.warn(`No se pudo obtener el candidato ${p.candidatoId}:`, candidatoRes.status);
                  return null;
                }

                const candidato = await candidatoRes.json();

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
                    requisitosExcluyentes: originalCandidate?.postulacion.requisitosExcluyentes || [],
                    notas: p.notas || [],
                    ...(p as any).resumenCv && { resumenCv: (p as any).resumenCv },
                    ...(p as any).opinionComentariosIA && { opinionComentariosIA: (p as any).opinionComentariosIA },
                    respuestas: p.respuestas || []
                  }
                } as Candidate;
              } catch (err) {
                console.warn("Error al mapear candidato para postulación:", p, err);
                return null;
              }
            })
          );

          const validCandidates = candidates.filter((c): c is Candidate => c !== null);
          setFavoriteCandidates(validCandidates);
          onCandidatesUpdate(validCandidates);
        }
      } else {
        // Si volvemos a mostrar todos, restauramos la lista original
        onCandidatesUpdate(originalCandidates);
      }
      setShowOnlyFavorites(!showOnlyFavorites);
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
    }
  };

  function calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = fechaNac.getMonth();

    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  }

  const activeCandidates = (showOnlyFavorites ? favoriteCandidates : candidates).filter(candidate => {
    const estado = candidate.postulacion.estado?.toUpperCase() || ""
    return estado !== "FINALIZADA"
  })

  const filteredCandidates = activeCandidates.filter(candidate => {
    const fullName = `${candidate.name} ${candidate.lastName}`.toLowerCase()
    const nameMatch = fullName.includes(searchQuery.toLowerCase())
    const ageMatch = (!minAge || candidate.age >= parseInt(minAge)) && (!maxAge || candidate.age <= parseInt(maxAge))
    const genderMatch = gender === "todos" || candidate.gender.toLowerCase() === gender
    let requisitosMatch = true
    if (requisitosFilter === "cumplen") {
      requisitosMatch = !(candidate.postulacion.requisitosExcluyentes && candidate.postulacion.requisitosExcluyentes.length > 0)
    } else if (requisitosFilter === "nocumplen") {
      requisitosMatch = !!(candidate.postulacion.requisitosExcluyentes && candidate.postulacion.requisitosExcluyentes.length > 0)
    }
    return nameMatch && ageMatch && genderMatch && requisitosMatch
  })

  const handleOpenFilterModal = () => {
    setTempMinAge(minAge)
    setTempMaxAge(maxAge)
    setTempGender(gender)
    setTempRequisitosFilter(requisitosFilter)
    setShowFilterModal(true)
  }

  const handleApplyFilters = () => {
    setMinAge(tempMinAge)
    setMaxAge(tempMaxAge)
    setGender(tempGender)
    setRequisitosFilter(tempRequisitosFilter)
    setShowFilterModal(false)
  }

  const handleCancelFilters = () => {
    setShowFilterModal(false)
  }

  return (
    <div
      className={`flex flex-col h-[90vh] ${isCollapsed ? "w-1/4" : "w-1/2"} bg-white rounded-lg border p-3 overflow-hidden`}
    >
      <div className="mb-3 flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Búsqueda de candidatos"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded-md border border-gray-200 bg-white pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-200"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 flex-shrink-0 ${showOnlyFavorites ? 'text-yellow-400' : 'text-gray-500'}`}
            onClick={handleToggleFavorites}
            title={showOnlyFavorites ? "Mostrar todos" : "Mostrar favoritos"}
          >
            <Star className="h-4 w-4" fill={showOnlyFavorites ? "currentColor" : "none"} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 flex-shrink-0"
            onClick={handleOpenFilterModal}
            title="Filtrar candidatos"
          >
            <Filter className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>

      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Filtrar Candidatos
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Selecciona los criterios para filtrar los candidatos
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rango de edad</label>
              <div className="flex gap-2">
                <Input type="number" placeholder="Mín" className="w-24" value={tempMinAge} onChange={e => setTempMinAge(e.target.value)} />
                <Input type="number" placeholder="Máx" className="w-24" value={tempMaxAge} onChange={e => setTempMaxAge(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Género</label>
              <Select value={tempGender} onValueChange={setTempGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Requisitos excluyentes</label>
              <Select value={tempRequisitosFilter} onValueChange={setTempRequisitosFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por requisitos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="cumplen">Solo los que cumplen</SelectItem>
                  <SelectItem value="nocumplen">Solo los que NO cumplen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setTempMinAge("")
                setTempMaxAge("")
                setTempGender("todos")
                setTempRequisitosFilter("todos")
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              Limpiar filtros
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelFilters}>
                Cancelar
              </Button>
              <Button onClick={handleApplyFilters}>
                Aplicar filtros
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidate?.id === candidate.id}
              onClick={onCandidateClick}
              jobOffer={jobOffer}
              entrevistas={entrevistas}
            />
          ))
        ) : (
          <div className="text-center py-4 text-sm text-gray-500">
            No se encontraron candidatos que coincidan con los filtros
          </div>
        )}
      </div>
    </div>
  )
} 