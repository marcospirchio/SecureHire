import { X, AlertTriangle, Calendar, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Candidate } from "@/types/job-offer"

interface CandidateDetailsProps {
  candidate: Candidate
  onClose: () => void
  onOpenInterviewModal: () => void
  onOpenFeedbackModal: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function CandidateDetails({
  candidate,
  onClose,
  onOpenInterviewModal,
  onOpenFeedbackModal,
  activeTab,
  setActiveTab
}: CandidateDetailsProps) {
  return (
    <div className="w-1/2 bg-white rounded-lg border p-3 overflow-y-auto relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </button>

      <h2 className="text-xl font-bold mb-4">
        {candidate.name} {candidate.lastName}
      </h2>

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

      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-gray-500">Fase actual:</div>
        <div className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          {candidate.postulacion.fase}
        </div>
      </div>

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
                    - {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <Select defaultValue="phase">
          <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
            <SelectValue placeholder="Cambiar fase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="phase">Cambiar fase</SelectItem>
            <SelectItem value="cv">CV recibido</SelectItem>
            <SelectItem value="interview">Entrevista agendada</SelectItem>
            <SelectItem value="pending">Pendiente de confirmación</SelectItem>
            <SelectItem value="rejected">Rechazado</SelectItem>
            <SelectItem value="hired">Contratado</SelectItem>
          </SelectContent>
        </Select>

        <Button className="h-9 text-xs bg-green-600 hover:bg-green-700" onClick={onOpenInterviewModal}>
          <Calendar className="mr-1 h-3 w-3" /> Agendar Entrevista
        </Button>

        <Button variant="destructive" className="h-9 text-xs" onClick={onOpenFeedbackModal}>
          Finalizar proceso
        </Button>
      </div>

      <div className="mt-4 pt-4 border-t">
        <Button className="h-8 text-xs flex items-center gap-1 mb-4" variant="outline">
          <FileText className="h-3 w-3" /> Ver CV
        </Button>

        <Tabs defaultValue="notes" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">Mis anotaciones</TabsTrigger>
            <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
          </TabsList>
          <TabsContent value="notes" className="mt-4">
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
              <p className="text-gray-500 text-sm">No hay anotaciones disponibles.</p>
            )}
          </TabsContent>
          <TabsContent value="feedbacks" className="mt-4">
            <p className="text-gray-500 text-sm">No hay feedbacks disponibles.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 