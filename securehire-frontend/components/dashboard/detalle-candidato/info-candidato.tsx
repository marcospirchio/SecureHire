import { Mail, Phone, Clock } from "lucide-react"
import { EstrellasReputacion } from "@/components/dashboard/estrella-reputacion"
import type { Candidato } from "@/types/candidato"

interface InfoCandidatoProps {
  candidato: Candidato
}

export function InfoCandidato({ candidato }: InfoCandidatoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Correo electrónico</h3>
        <div className="flex items-center mt-1">
          <Mail className="h-4 w-4 mr-2 text-gray-400" />
          <span>{candidato.email}</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</h3>
        <div className="flex items-center mt-1">
          <Phone className="h-4 w-4 mr-2 text-gray-400" />
          <span>{candidato.telefono}</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reputación</h3>
        <div className="flex items-center mt-1">
          <EstrellasReputacion valor={candidato.reputacion} />
          <span className="ml-2">{candidato.reputacion}/5</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tiempo de respuesta estimado</h3>
        <div className="flex items-center mt-1">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          <span>{candidato.tiempoRespuesta}</span>
        </div>
      </div>

      {candidato.edad && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Edad</h3>
          <div className="flex items-center mt-1">
            <span>{candidato.edad} años</span>
          </div>
        </div>
      )}

      {candidato.sexo && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sexo</h3>
          <div className="flex items-center mt-1">
            <span>{candidato.sexo}</span>
          </div>
        </div>
      )}
    </div>
  )
}
