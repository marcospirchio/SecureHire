import { Search, Calendar } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Candidate } from "@/types/job-offer"

interface CandidateListProps {
  candidates: Candidate[]
  selectedCandidate: Candidate | null
  searchQuery: string
  filterPhase: string
  onSearchChange: (query: string) => void
  onFilterPhaseChange: (phase: string) => void
  onCandidateSelect: (candidate: Candidate) => void
}

export function CandidateList({
  candidates,
  selectedCandidate,
  searchQuery,
  filterPhase,
  onSearchChange,
  onFilterPhaseChange,
  onCandidateSelect
}: CandidateListProps) {
  // Filtrar candidatos según la búsqueda y el filtro de fase
  const filteredCandidates = candidates.filter((candidate) => {
    const fullName = `${candidate.name} ${candidate.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase())
    const matchesPhase = filterPhase === "all" || candidate.postulacion.fase === filterPhase
    return matchesSearch && matchesPhase
  })

  return (
    <div className="flex flex-col bg-white rounded-lg border p-3 overflow-hidden">
      <div className="mb-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Búsqueda de candidatos"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full rounded-md border border-gray-200 bg-white pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-200"
          />
        </div>
        <Select defaultValue="all" onValueChange={onFilterPhaseChange}>
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
            onClick={() => onCandidateSelect(candidate)}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-bold">
                {candidate.name} {candidate.lastName}
              </h3>
              {candidate.entrevista && (
                <span className={`text-xs ${
                  candidate.entrevista.estado.toLowerCase() === "confirmada" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-amber-100 text-amber-800"
                } px-2 py-0.5 rounded-full flex items-center`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  ENTREVISTA {candidate.entrevista.fechaProgramada} | {candidate.entrevista.horaProgramada}
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
                <span className="font-medium">{candidate.postulacion.fase}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 