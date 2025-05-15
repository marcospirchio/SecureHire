import { Button } from "@/components/ui/button"
import { Candidate } from "@/types/job-offer"
import { Calendar, FileText, Phone, Mail, MapPin, User, Building, Clock } from 'lucide-react'

interface CandidateDetailsProps {
  candidate: Candidate
  onOpenCV: () => void
  onOpenInterview: () => void
}

export function CandidateDetails({ candidate, onOpenCV, onOpenInterview }: CandidateDetailsProps) {
  return (
    <div className="flex flex-col bg-white rounded-lg border p-3">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-bold">
            {candidate.name} {candidate.lastName}
          </h2>
          <p className="text-sm text-gray-500">{candidate.postulacion.fase}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={onOpenCV}
          >
            <FileText className="mr-1 h-3 w-3" /> Ver CV
          </Button>
          {candidate.entrevista && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={onOpenInterview}
            >
              <Calendar className="mr-1 h-3 w-3" /> Ver entrevista
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{candidate.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{candidate.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{candidate.address}, {candidate.province}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span>{candidate.gender}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-gray-500" />
            <span>{candidate.nationality}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{candidate.age} años</span>
          </div>
        </div>
      </div>

      {candidate.entrevista && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Entrevista Programada</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha:</span>
              <span>{candidate.entrevista.fechaProgramada}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Hora:</span>
              <span>{candidate.entrevista.horaProgramada}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estado:</span>
              <span className={`${
                candidate.entrevista.estado.toLowerCase() === "confirmada" 
                  ? "text-green-600" 
                  : "text-amber-600"
              }`}>
                {candidate.entrevista.estado}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 