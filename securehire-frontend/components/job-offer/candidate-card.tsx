import { Calendar, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { Candidate } from "@/types/job-offer"

interface CandidateCardProps {
  candidate: Candidate
  isSelected: boolean
  onClick: (candidate: Candidate) => void
}

export function CandidateCard({ candidate, isSelected, onClick }: CandidateCardProps) {
  const hasInterview = candidate.entrevista && candidate.entrevista.fechaProgramada && candidate.entrevista.horaProgramada
  const isConfirmed = candidate.entrevista?.estado.toLowerCase() === "confirmada"
  const isPending = candidate.entrevista?.estado.toLowerCase() === "pendiente de confirmación"

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <div
      className={`rounded-lg border p-3 cursor-pointer hover:border-gray-300 transition-colors ${
        isSelected ? "border-blue-300 bg-blue-50" : ""
      }`}
      onClick={() => onClick(candidate)}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-bold">
          {candidate.name} {candidate.lastName}
        </h3>
        {hasInterview && candidate.entrevista && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full flex items-center ${
              isConfirmed
                ? "bg-green-100 text-green-800" 
                : isPending
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-amber-100 text-amber-800"
            }`}
          >
            <Calendar className="h-3 w-3 mr-1" />
            ENTREVISTA {formatDate(candidate.entrevista.fechaProgramada)} | {candidate.entrevista.horaProgramada}
            {isConfirmed ? (
              <CheckCircle2 className="h-3 w-3 ml-1 text-green-600" />
            ) : isPending ? (
              <AlertTriangle className="h-3 w-3 ml-1 text-yellow-600" />
            ) : (
              <AlertCircle className="h-3 w-3 ml-1 text-amber-600" />
            )}
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
      </div>
    </div>
  )
} 