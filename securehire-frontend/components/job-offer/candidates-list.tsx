import { Search, Filter } from 'lucide-react'
import { useState } from 'react'
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
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [minAge, setMinAge] = useState("")
  const [maxAge, setMaxAge] = useState("")
  const [gender, setGender] = useState("todos")
  const [requisitosFilter, setRequisitosFilter] = useState("todos")
  
  const [tempMinAge, setTempMinAge] = useState("")
  const [tempMaxAge, setTempMaxAge] = useState("")
  const [tempGender, setTempGender] = useState("todos")
  const [tempRequisitosFilter, setTempRequisitosFilter] = useState("todos")

  const activeCandidates = candidates.filter(candidate => {
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
      className={`flex flex-col h-[90vh] ${isCollapsed ? "w-1/2" : "w-full"} bg-white rounded-lg border p-3 overflow-hidden`}
    >
      <div className="mb-3 flex flex-col sm:flex-row gap-2 items-center">
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
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 ml-2"
          onClick={handleOpenFilterModal}
          title="Filtrar candidatos"
        >
          <Filter className="h-4 w-4 text-gray-500" />
        </Button>
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelFilters}>
              Cancelar
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar filtros
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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