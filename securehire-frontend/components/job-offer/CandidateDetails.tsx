import { X, AlertTriangle, Calendar, FileText, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Candidate } from "@/types/job-offer";
import { useState } from "react";

interface CandidateDetailsProps {
  candidate: Candidate;
  onClose: () => void;
  onOpenInterviewModal: () => void;
  onOpenFeedbackModal: () => void;
  onPhaseChange?: (newPhase: string) => void;
}

export function CandidateDetails({
  candidate,
  onClose,
  onOpenInterviewModal,
  onOpenFeedbackModal,
  onPhaseChange
}: CandidateDetailsProps) {
  const [activeTab, setActiveTab] = useState("notes");
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim()) {
      alert("Nota añadida: " + newNote);
      setNewNote("");
    }
  };

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
    <div className="w-1/2 bg-white rounded-lg border p-3 overflow-y-auto relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </button>

      <h2 className="text-xl font-bold mb-4">
        {candidate.name} {candidate.lastName}
      </h2>

      {/* Información personal del candidato */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-2">
          <div className="text-gray-400 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500">Teléfono:</div>
            <div className="text-sm font-medium">
              {candidate.countryCode} {candidate.phone}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="text-gray-400 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500">Email:</div>
            <div className="text-sm font-medium">{candidate.email}</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="text-gray-400 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500">DNI:</div>
            <div className="text-sm font-medium">{candidate.dni}</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="text-gray-400 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500">Género:</div>
            <div className="text-sm font-medium">{candidate.gender}</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="text-gray-400 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500">Nacionalidad:</div>
            <div className="text-sm font-medium">{candidate.nationality}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2">
        <div className="text-gray-400 mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div>
          <div className="text-xs text-gray-500">Dirección:</div>
          <div className="text-sm font-medium">
            {candidate.address}, {candidate.province}, {candidate.residenceCountry}
          </div>
        </div>
      </div>

      <div className="mt-4 border-t pt-4"></div>

      {/* Fase actual y estado de entrevista */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-gray-500">Fase actual:</div>
        <div className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          {candidate.postulacion.fase}
        </div>
      </div>

      {/* Estado de la entrevista */}
      {candidate.entrevista && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      )}

      {/* Alerta de requisitos excluyentes */}
      {candidate.postulacion.requisitosExcluyentes && candidate.postulacion.requisitosExcluyentes.length > 0 && (
        <div className="mt-4 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                El candidato no cumple con el/los siguientes requisitos excluyentes:
              </p>
              <ul className="mt-2 ml-5 list-disc">
                {candidate.postulacion.requisitosExcluyentes.map((req, index) => (
                  <li key={index} className="text-sm text-amber-700">
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <Select 
          defaultValue={candidate.postulacion.fase}
          onValueChange={onPhaseChange}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
            <SelectValue placeholder="Cambiar fase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Sin fase">Sin fase</SelectItem>
            <SelectItem value="Entrevista inicial">Entrevista inicial</SelectItem>
            <SelectItem value="Entrevista técnica">Entrevista técnica</SelectItem>
            <SelectItem value="Entrevista final">Entrevista final</SelectItem>
            <SelectItem value="Oferta">Oferta</SelectItem>
            <SelectItem value="Contratado">Contratado</SelectItem>
            <SelectItem value="Rechazado">Rechazado</SelectItem>
          </SelectContent>
        </Select>

        <Button className="h-9 text-xs bg-green-600 hover:bg-green-700" onClick={onOpenInterviewModal}>
          <Calendar className="mr-1 h-3 w-3" /> Agendar Entrevista
        </Button>

        <Button variant="destructive" className="h-9 text-xs" onClick={onOpenFeedbackModal}>
          Finalizar proceso
        </Button>
      </div>

      {/* CV y Resumen */}
      <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Button className="h-8 text-xs flex items-center gap-1 mb-4 w-full" variant="outline">
            <FileText className="h-3 w-3" /> Ver CV Completo
          </Button>
          
          <a 
            href={candidate.cvUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mb-2"
          >
            <ExternalLink className="h-3 w-3" /> Abrir CV en nueva pestaña
          </a>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Resumen del CV</h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            {/* Aquí iría el resumen del CV, por ahora es un texto de ejemplo */}
            Profesional con 5 años de experiencia en desarrollo de software. 
            Especializado en tecnologías frontend como React y TypeScript.
            Experiencia en proyectos de e-commerce y aplicaciones financieras.
            Graduado en Ingeniería Informática.
            Certificaciones en React Advanced y TypeScript.
            Inglés nivel avanzado.
            Disponibilidad inmediata.
          </p>
        </div>
      </div>

      {/* Tabs para notas y feedback */}
      <div className="mt-4 pt-4 border-t">
        <Tabs defaultValue="notes" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">Mis anotaciones</TabsTrigger>
            <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notes" className="mt-4">
            {/* Formulario para añadir nueva nota */}
            <div className="mb-4">
              <Textarea
                placeholder="Añadir una nueva nota sobre este candidato..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  size="sm" 
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                >
                  Guardar nota
                </Button>
              </div>
            </div>
            
            {candidate.postulacion.notas && candidate.postulacion.notas.length > 0 ? (
              <div className="space-y-4">
                {candidate.postulacion.notas.map((note, index) => (
                  <div key={index} className="border-b pb-4">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">
                        {note.author} <span className="text-gray-500 font-normal">Trabaja en {note.company}</span>
                      </div>
                      <div className="text-gray-500 text-sm">{note.date}</div>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay anotaciones disponibles. Añade la primera nota sobre este candidato.</p>
            )}
          </TabsContent>
          
          <TabsContent value="feedbacks" className="mt-4">
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="text-sm font-medium mb-2">¿Qué son los feedbacks?</h4>
              <p className="text-xs text-gray-600">
                Los feedbacks son evaluaciones formales que se registran al finalizar un proceso con un candidato. 
                Estos quedan guardados en el sistema y pueden ser consultados por otros reclutadores en el futuro.
              </p>
            </div>
            
            {/* Lista de feedbacks (simulada vacía) */}
            <p className="text-gray-500 text-sm">No hay feedbacks disponibles para este candidato.</p>
            
            {/* Botón para añadir feedback */}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={onOpenFeedbackModal}
            >
              Añadir feedback y finalizar proceso
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 