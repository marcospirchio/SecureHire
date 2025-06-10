import { Calendar, CheckCircle2, AlertCircle, AlertTriangle, Star, Filter } from 'lucide-react'
import { Candidate } from "@/types/job-offer"
import { useState, useEffect } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

interface CandidateCardProps {
  candidate: Candidate
  isSelected: boolean
  onClick: (candidate: Candidate) => void
  jobOffer?: {
    camposAdicionales?: {
      nombre: string
      tipo: string
      esExcluyente: boolean
      opciones: string[]
      valoresExcluyentes: string[]
      obligatorio: boolean
    }[]
  }
  entrevistas?: any[]
  onFavoriteChange?: (candidateId: string, isFavorite: boolean) => void
}

export function CandidateCard({ candidate, isSelected, onClick, jobOffer, entrevistas, onFavoriteChange }: CandidateCardProps) {
  const { toast } = useToast()
  const [isFavorite, setIsFavorite] = useState(candidate.postulacion?.esFavorito || false)
  
  const entrevista = entrevistas?.find(
    (e) =>
      e.candidatoId === candidate.postulacion?.candidatoId &&
      e.postulacionId === candidate.postulacion?.id &&
      ["pendiente de confirmación", "confirmada"].includes(e.estado?.toLowerCase())
  );
  
  const hasInterview = entrevista && entrevista.fechaProgramada && entrevista.horaProgramada;
  const isConfirmed = entrevista?.estado?.toLowerCase() === "confirmada";
  const isPending = entrevista?.estado?.toLowerCase() === "pendiente de confirmación";
  const isActive = candidate.postulacion.estado?.toUpperCase() !== "FINALIZADA"

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/postulaciones/${candidate.postulacion.id}`, {
          credentials: "include",
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.esFavorito || false);
        }
      } catch (error) {
        console.error('Error al obtener estado de favorito:', error);
      }
    };

    if (candidate.postulacion?.id) {
      fetchFavoriteStatus();
    }
  }, [candidate.postulacion?.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`http://localhost:8080/api/postulaciones/${candidate.postulacion.id}/favorito?esFavorito=${!isFavorite}`, {
        method: 'PATCH',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al actualizar favorito');
      }

      setIsFavorite(!isFavorite);
      if (onFavoriteChange) {
        onFavoriteChange(candidate.postulacion.id, !isFavorite);
      }
      
      toast({
        title: isFavorite ? "Candidato removido de favoritos" : "Candidato añadido a favoritos",
        description: `${candidate.name} ${candidate.lastName} ha sido ${isFavorite ? "removido de" : "añadido a"} tus favoritos`,
      });
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de favorito",
        variant: "destructive"
      });
    }
  };

  // Detectar si el candidato no cumple requisitos excluyentes
  const requisitosNoCumplidos = jobOffer?.camposAdicionales
    ?.filter(campo => campo.valoresExcluyentes && campo.valoresExcluyentes.length > 0)
    .map(campo => {
      const respuesta = candidate.postulacion.respuestas?.find((r: { campo: string; respuesta: string | string[] }) => r.campo === campo.nombre)
      if (!respuesta) return { campo: campo.nombre, motivo: "No respondió" }
      
      // Para campos tipo checkbox (múltiples valores)
      if (campo.tipo === "checkbox") {
        const respuestasCandidato = Array.isArray(respuesta.respuesta) 
          ? respuesta.respuesta 
          : [respuesta.respuesta]
        
        const valoresExcluyentes = campo.valoresExcluyentes || []
        const noCumple = valoresExcluyentes.some(valor => !respuestasCandidato.includes(valor))
        if (noCumple) {
          return { 
            campo: campo.nombre, 
            motivo: `No seleccionó: ${valoresExcluyentes.join(", ")}`
          }
        }
      }
      // Para campos tipo select
      else {
        const valoresExcluyentes = campo.valoresExcluyentes || []
        if (valoresExcluyentes.length > 0 && !valoresExcluyentes.includes(respuesta.respuesta as string)) {
          return { 
            campo: campo.nombre, 
            motivo: `Debe ser: ${valoresExcluyentes.join(", ")}`
          }
        }
      }
      return null
    })
    .filter((req): req is { campo: string; motivo: string } => req !== null) || []

  const isExcluido = candidate.postulacion.requisitosExcluyentes && candidate.postulacion.requisitosExcluyentes.length > 0

  if (!isActive) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div
      className={`rounded-lg border p-3 cursor-pointer hover:border-gray-300 transition-colors ${
        isSelected ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200" : ""
      } ${isExcluido ? "bg-white" : "bg-green-50 border-green-200"}`}
      onClick={() => onClick(candidate)}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold truncate">
              {candidate.name} {candidate.lastName}
            </h3>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex gap-1">
                <span className="text-gray-500">Edad:</span>
                <span>{candidate.age} años</span>
              </div>
              <div className="flex gap-1">
                <span className="text-gray-500">Sexo:</span>
                <span>{candidate.gender ? candidate.gender.charAt(0).toUpperCase() + candidate.gender.slice(1).toLowerCase() : ''}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2 flex-shrink-0">
          {hasInterview && formatDate(entrevista.fechaProgramada) && entrevista.horaProgramada && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full flex items-center whitespace-nowrap ${
                isConfirmed
                  ? "bg-green-100 text-green-800" 
                  : isPending
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                ENTREVISTA {formatDate(entrevista.fechaProgramada)} | {entrevista.horaProgramada}
              </span>
              {isConfirmed ? (
                <CheckCircle2 className="h-3 w-3 ml-1 text-green-600 flex-shrink-0" />
              ) : isPending ? (
                <AlertTriangle className="h-3 w-3 ml-1 text-yellow-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-3 w-3 ml-1 text-amber-600 flex-shrink-0" />
              )}
            </span>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleFavoriteClick}
            className={`h-6 w-6 hover:bg-yellow-100 flex-shrink-0 ${isFavorite ? 'text-yellow-400' : 'text-gray-400'}`}
            title={isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
          >
            <Star className="h-3 w-3" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
        </div>
      </div>
    </div>
  )
}
