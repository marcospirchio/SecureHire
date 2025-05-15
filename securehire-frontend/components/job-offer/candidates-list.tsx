import { Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Candidate } from "@/types/job-offer"
import { CandidateCard } from "./candidate-card"

interface CandidatesListProps {
  candidates: Candidate[]
  selectedCandidate: Candidate | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterPhase: string
  setFilterPhase: (phase: string) => void
  onCandidateClick: (candidate: Candidate) => void
  isCollapsed: boolean
}

export function CandidatesList({
  candidates,
  selectedCandidate,
  searchQuery,
  setSearchQuery,
  filterPhase,
  setFilterPhase,
  onCandidateClick,
  isCollapsed
}: CandidatesListProps) {
  return (
    <div
      className={`flex flex-col ${isCollapsed ? "w-1/2" : "w-full"} bg-white rounded-lg border p-3 overflow-hidden`}
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
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selectedCandidate?.id === candidate.id}
            onClick={onCandidateClick}
          />
        ))}
      </div>
    </div>
  )
} 