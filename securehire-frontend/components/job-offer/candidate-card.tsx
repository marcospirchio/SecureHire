import { Calendar, CheckCircle2, AlertCircle, AlertTriangle, Sparkles } from 'lucide-react'
import { Candidate } from "@/types/job-offer"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface CandidateCardProps {
  candidate: Candidate
  isSelected: boolean
  onClick: (candidate: Candidate) => void
}

export function CandidateCard({ candidate, isSelected, onClick }: CandidateCardProps) {
  const [iaOpinion, setIaOpinion] = useState<string | null>(null)
  const [iaOpinionLoading, setIaOpinionLoading] = useState(false)
  const [showOpinionModal, setShowOpinionModal] = useState(false)
  const [iaOpinionError, setIaOpinionError] = useState<string | null>(null)
  const { toast } = useToast()

  const hasInterview = candidate.entrevista && candidate.entrevista.fechaProgramada && candidate.entrevista.horaProgramada
  const isConfirmed = candidate.entrevista?.estado.toLowerCase() === "confirmada"
  const isPending = candidate.entrevista?.estado.toLowerCase() === "pendiente de confirmación"
  const isActive = candidate.postulacion.estado?.toUpperCase() !== "FINALIZADA"

  useEffect(() => {
    const fetchIAOpinion = async () => {
      if (candidate.postulacion?.id) {
        try {
          const response = await fetch(`http://localhost:8080/api/postulaciones/${candidate.postulacion.id}`, {
            credentials: "include",
            headers: { 'Accept': 'application/json' }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.opinionComentariosIA) {
              setIaOpinion(data.opinionComentariosIA);
            }
          }
        } catch (error) {
          console.error('Error al obtener la opinión IA:', error);
        }
      }
    };
    fetchIAOpinion();
  }, [candidate.postulacion?.id]);

  const handleGenerateIAOpinion = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!candidate?.postulacion?.id || !candidate?.postulacion?.candidatoId) {
      toast({
        title: "Faltan datos",
        description: "No se puede generar la opinión. Postulación o candidato no válidos.",
        variant: "destructive"
      });
      return;
    }

    setIaOpinionLoading(true);
    setShowOpinionModal(true);

    try {
      const response = await fetch('http://localhost:8080/api/geminiIA/generar-opinion-candidato', {
        method: 'POST',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          candidatoId: candidate.postulacion.candidatoId,
          postulacionId: candidate.postulacion.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes("No hay comentarios")) {
          setIaOpinionError("No se puede generar la opinión IA porque el candidato no tiene comentarios/feedbacks.");
          setIaOpinion(null);
          setIaOpinionLoading(false);
          return;
        }
        console.error('Error en la respuesta:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Error al generar la opinión: ${response.status} ${response.statusText}`);
      }

      const fullText = await response.text();
      console.log('Respuesta recibida:', fullText);
      setIaOpinion(fullText);

      // Guardar la opinión en la postulación
      const updateResponse = await fetch(`http://localhost:8080/api/postulaciones/${candidate.postulacion.id}`, {
        method: 'PATCH',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ opinionComentariosIA: fullText })
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Error al guardar la opinión:', {
          status: updateResponse.status,
          statusText: updateResponse.statusText,
          errorText
        });
        throw new Error('Error al guardar la opinión');
      }

    } catch (error) {
      console.error('Error completo:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al generar la opinión",
        variant: "destructive"
      });
      setShowOpinionModal(false);
    } finally {
      setIaOpinionLoading(false);
    }
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowOpinionModal(true);
  };

  if (!isActive) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <>
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
          <div className="flex items-center gap-2">
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
                ENTREVISTA {formatDate(candidate.entrevista?.fechaProgramada)} | {candidate.entrevista?.horaProgramada}
                {isConfirmed ? (
                  <CheckCircle2 className="h-3 w-3 ml-1 text-green-600" />
                ) : isPending ? (
                  <AlertTriangle className="h-3 w-3 ml-1 text-yellow-600" />
                ) : (
                  <AlertCircle className="h-3 w-3 ml-1 text-amber-600" />
                )}
              </span>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={iaOpinion ? handleOpenModal : handleGenerateIAOpinion}
              className="h-6 w-6 hover:bg-purple-100"
              title={iaOpinion ? "Ver opinión IA" : "Generar opinión IA"}
            >
              <Sparkles className="h-3 w-3 text-purple-500" />
            </Button>
          </div>
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

      <Dialog 
         open={showOpinionModal}
         onOpenChange={(open) => {
           if (!iaOpinionLoading) setShowOpinionModal(open);
         }}
         modal={true}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Opinión IA sobre {candidate.name} {candidate.lastName}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Análisis generado por IA basado en los comentarios del candidato
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {iaOpinionLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-sm text-gray-600">Generando opinión...</span>
              </div>
            ) : iaOpinionError ? (
              <div className="text-center py-8">
                <p className="text-red-600">{iaOpinionError}</p>
              </div>
            ) : iaOpinion ? (
              <div className="bg-white p-4 rounded-lg">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">{iaOpinion}</pre>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay opinión disponible</p>
                <Button 
                  onClick={handleGenerateIAOpinion}
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  Generar Opinión
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
