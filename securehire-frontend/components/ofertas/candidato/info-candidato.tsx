"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileIcon } from "lucide-react"

interface InfoCandidatoProps {
  candidato: {
    id: string
    nombre: string
    email: string
    telefono: string
    ubicacion: string
    experiencia: string
    habilidades: string[]
    estado: string
    avatar?: string
    cv?: string
  }
  onVerCV: () => void
}

export function InfoCandidato({ candidato, onVerCV }: InfoCandidatoProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={candidato.avatar || "/placeholder.svg"} alt={candidato.nombre} />
          <AvatarFallback>{candidato.nombre.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{candidato.nombre}</h3>
          <p className="text-sm text-muted-foreground">{candidato.ubicacion}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Contacto</h4>
          <p className="text-sm">{candidato.email}</p>
          <p className="text-sm">{candidato.telefono}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">Experiencia</h4>
          <p className="text-sm">{candidato.experiencia}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-1">Habilidades</h4>
        <div className="flex flex-wrap gap-1">
          {candidato.habilidades.map((habilidad, index) => (
            <Badge key={index} variant="outline">
              {habilidad}
            </Badge>
          ))}
        </div>
      </div>

      <Button variant="outline" size="sm" className="flex items-center gap-2 w-fit" onClick={onVerCV}>
        <FileIcon size={16} />
        Ver CV
      </Button>
    </div>
  )
}
