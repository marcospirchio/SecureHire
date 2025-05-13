"use client"

import { Button } from "@/components/ui/button"
import { Calendar, CheckCircle, MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react"

interface AccionesCandidatoProps {
  onAprobar: () => void
  onRechazar: () => void
  onProgramarEntrevista: () => void
  onFinalizarProceso: () => void
  onAgregarComentario: () => void
}

export function AccionesCandidato({
  onAprobar,
  onRechazar,
  onProgramarEntrevista,
  onFinalizarProceso,
  onAgregarComentario,
}: AccionesCandidatoProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={onAprobar}>
        <ThumbsUp size={16} />
        <span className="hidden sm:inline">Aprobar</span>
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={onRechazar}>
        <ThumbsDown size={16} />
        <span className="hidden sm:inline">Rechazar</span>
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={onProgramarEntrevista}>
        <Calendar size={16} />
        <span className="hidden sm:inline">Entrevista</span>
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={onFinalizarProceso}>
        <CheckCircle size={16} />
        <span className="hidden sm:inline">Finalizar</span>
      </Button>

      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={onAgregarComentario}>
        <MessageSquare size={16} />
        <span className="hidden sm:inline">Comentar</span>
      </Button>
    </div>
  )
}
