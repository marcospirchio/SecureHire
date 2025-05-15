import { Calendar } from 'lucide-react'
import { Candidate } from "@/types/job-offer"

interface CandidateCardProps {
  candidate: Candidate
  isSelected: boolean
  onClick: (candidate: Candidate) => void
}

export function CandidateCard({ candidate, isSelected, onClick }: CandidateCardProps) {
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
  )
} 