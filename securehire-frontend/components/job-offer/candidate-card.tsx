import { Calendar, CheckCircle2, AlertCircle, AlertTriangle, Sparkles, Filter } from 'lucide-react'
import { Candidate } from "@/types/job-offer"
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
}

export function CandidateCard({ candidate, isSelected, onClick, jobOffer, entrevistas }: CandidateCardProps) {
  const [iaOpinion, setIaOpinion] = useState<string | null>(null)
  const [iaOpinionLoading, setIaOpinionLoading] = useState(false)
  const [showOpinionModal, setShowOpinionModal] = useState(false)
  const [iaOpinionError, setIaOpinionError] = useState<string | null>(null)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const { toast } = useToast()

  
  const entrevista = entrevistas?.find(
    (e) =>
      e.candidatoId === candidate.postulacion?.candidatoId &&
      e.postulacionId === candidate.postulacion?.id &&
      ["pendiente de confirmación", "confirmada"].includes(e.estado?.toLowerCase())
  );
  
  

  
  
  console.log("Entrevista visible para", candidate.name, candidate.lastName, "=>", entrevista);
  console.log("Comparando con IDs:", {
    candidatoCardId: candidate.id,
    candidatoPostulacionId: candidate.postulacion?.candidatoId,
    entrevistasIds: entrevistas?.map((e: any) => e.candidatoId)
  });
  

  
  const hasInterview = entrevista && entrevista.fechaProgramada && entrevista.horaProgramada;
  const isConfirmed = entrevista?.estado?.toLowerCase() === "confirmada";
  const isPending = entrevista?.estado?.toLowerCase() === "pendiente de confirmación";
  const isActive = candidate.postulacion.estado?.toUpperCase() !== "FINALIZADA"

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
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  console.log("Entrevista visible en Card:", entrevista);

  return (
    <>
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
              onClick={iaOpinion ? handleOpenModal : handleGenerateIAOpinion}
              className="h-6 w-6 hover:bg-purple-100 flex-shrink-0"
              title={iaOpinion ? "Ver opinión IA" : "Generar opinión IA"}
            >
              <Sparkles className="h-3 w-3 text-purple-500" />
            </Button>
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
