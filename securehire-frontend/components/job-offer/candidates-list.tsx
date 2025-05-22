import { Search } from 'lucide-react'
import { Candidate, JobOffer } from "@/types/job-offer"
import { CandidateCard } from "./candidate-card"

interface CandidatesListProps {
  candidates: Candidate[]
  selectedCandidate: Candidate | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  onCandidateClick: (candidate: Candidate) => void
  isCollapsed: boolean
  jobOffer?: JobOffer
  entrevistas?: any[]
}

export function CandidatesList({
  candidates,
  selectedCandidate,
  searchQuery,
  setSearchQuery,
  onCandidateClick,
  isCollapsed,
  jobOffer,
  entrevistas
}: CandidatesListProps) {
  // Filtrar candidatos que no estén finalizados (case insensitive)
  const activeCandidates = candidates.filter(candidate => {
    const estado = candidate.postulacion.estado?.toUpperCase() || ""
    return estado !== "FINALIZADA"
  })

  // Filtrar por búsqueda
  const filteredCandidates = activeCandidates.filter(candidate => {
    const fullName = `${candidate.name} ${candidate.lastName}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  return (
    <div
      className={`flex flex-col h-[90vh] ${isCollapsed ? "w-1/2" : "w-full"} bg-white rounded-lg border p-3 overflow-hidden`}
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
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selectedCandidate?.id === candidate.id}
            onClick={onCandidateClick}
            jobOffer={jobOffer}
            entrevistas={entrevistas}
          />
        ))}
      </div>
    </div>
  )
} 