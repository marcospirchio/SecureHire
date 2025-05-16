import { X, AlertTriangle, Calendar, FileText, Pencil, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Candidate } from "@/types/job-offer"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface Feedback {
  id: string;
  texto: string;
  fecha: string;
  usuarioId: string;
  candidatoId: string;
  postulacionId: string | null;
  nombreReclutador?: string;
  empresaReclutador?: string;
}

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  empresa: string;
}

interface CandidateDetailsProps {
  candidate: Candidate;
  onClose: () => void;
  onOpenInterviewModal: () => void;
  onOpenFeedbackModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function CandidateDetails({
  candidate,
  onClose,
  onOpenInterviewModal,
  onOpenFeedbackModal,
  activeTab,
  setActiveTab
}: CandidateDetailsProps) {
  const [newNote, setNewNote] = useState("")
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null)
  const [editText, setEditText] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { toast } = useToast()

  // Obtener el ID del usuario logueado
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/usuarios/me', {
          credentials: "include",
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const userData = await response.json();
          console.log("Usuario actual obtenido:", userData);
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error("Error al obtener el usuario actual:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (activeTab === "feedbacks") {
        setLoading(true)
        try {
          console.log("Buscando comentarios para candidato:", candidate.postulacion.candidatoId);
          const response = await fetch(`http://localhost:8080/api/comentarios/candidato/${candidate.postulacion.candidatoId}`, {
            credentials: "include",
            headers: { 'Accept': 'application/json' }
          })

          if (!response.ok) throw new Error("Error al cargar los comentarios")
          const data = await response.json()
          console.log("Comentarios recibidos del backend:", data);
          
          // Obtener información de los reclutadores
          const feedbacksWithRecruiterInfo = await Promise.all(
            data.map(async (f: any) => {
              try {
                const recruiterResponse = await fetch(`http://localhost:8080/api/usuarios/${f.usuarioId}`, {
                  credentials: "include",
                  headers: { 'Accept': 'application/json' }
                });
                
                let recruiterInfo = { nombre: 'Reclutador', apellido: '', empresa: 'Empresa' };
                if (recruiterResponse.ok) {
                  const recruiterData: Usuario = await recruiterResponse.json();
                  recruiterInfo = {
                    nombre: recruiterData.nombre,
                    apellido: recruiterData.apellido,
                    empresa: recruiterData.empresa
                  };
                }

                const feedback = {
                  id: f.id,
                  texto: f.texto,
                  fecha: f.fecha,
                  usuarioId: f.usuarioId,
                  candidatoId: f.candidatoId,
                  postulacionId: f.postulacionId,
                  nombreReclutador: `${recruiterInfo.nombre} ${recruiterInfo.apellido}`,
                  empresaReclutador: recruiterInfo.empresa
                };

                console.log("Feedback procesado:", feedback);
                console.log("Comparación de IDs - Usuario actual:", currentUserId, "Usuario del comentario:", f.usuarioId);
                return feedback;
              } catch (error) {
                console.error("Error al procesar feedback:", error);
                return null;
              }
            })
          );

          const validFeedbacks = feedbacksWithRecruiterInfo.filter(f => f !== null);
          console.log("Feedbacks finales:", validFeedbacks);
          setFeedbacks(validFeedbacks);
        } catch (error) {
          console.error("Error al cargar comentarios:", error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los comentarios",
            variant: "destructive"
          })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchFeedbacks()
  }, [activeTab, candidate.postulacion.candidatoId, toast, currentUserId])

  useEffect(() => {
    if (activeTab === "feedbacks") {
      setActiveTab("notes")
      setTimeout(() => setActiveTab("feedbacks"), 0)
    }
  }, [candidate.id])

  const handleAddNote = () => {
    if (newNote.trim()) {
      alert("Nota añadida: " + newNote)
      setNewNote("")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/comentarios/${feedbackId}`, {
        method: 'DELETE',
        credentials: "include",
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el comentario");
      }

      // Actualizar la lista de comentarios
      setFeedbacks(prev => prev.filter(f => f.id !== feedbackId));
      
      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario",
        variant: "destructive"
      });
    }
  };

  const handleEditFeedback = async () => {
    if (!editingFeedback || !editText.trim()) return;

    try {
      const response = await fetch(`http://localhost:8080/api/comentarios/${editingFeedback.id}`, {
        method: 'PUT',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          texto: editText,
          puntaje: 0
        })
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el comentario");
      }

      const updatedComment = await response.json();

      // Actualizar la lista de comentarios manteniendo la información del reclutador
      setFeedbacks(prev => prev.map(f => 
        f.id === editingFeedback.id 
          ? { 
              ...f,
              texto: editText,
              fecha: updatedComment.fecha
            }
          : f
      ));

      setEditingFeedback(null);
      setEditText("");
      
      toast({
        title: "Comentario actualizado",
        description: "El comentario ha sido actualizado correctamente.",
      });
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el comentario",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-1/2 bg-white rounded-lg border p-3 overflow-y-auto relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </button>

      <h2 className="text-xl font-bold mb-4">{candidate.name} {candidate.lastName}</h2>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        <p><strong>Teléfono:</strong> {candidate.countryCode} {candidate.phone}</p>
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>DNI:</strong> {candidate.dni}</p>
        <p><strong>Género:</strong> {candidate.gender}</p>
        <p><strong>Nacionalidad:</strong> {candidate.nationality}</p>
        <p><strong>Dirección:</strong> {candidate.address}, {candidate.province}, {candidate.residenceCountry}</p>
      </div>

      {candidate.postulacion.requisitosExcluyentes && candidate.postulacion.requisitosExcluyentes.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                El candidato no cumple con el/los siguientes requisitos excluyentes:
              </p>
              <ul className="mt-2 ml-5 list-disc">
                {candidate.postulacion.requisitosExcluyentes.map((req, i) => (
                  <li key={i} className="text-sm text-amber-700">{req}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
        <Button className="h-9 text-xs bg-green-600 hover:bg-green-700 w-full sm:w-48" onClick={onOpenInterviewModal}>
          <Calendar className="mr-1 h-3 w-3" /> Agendar Entrevista
        </Button>
        <Button variant="destructive" className="h-9 text-xs w-full sm:w-48" onClick={onOpenFeedbackModal}>
          Finalizar proceso
        </Button>
      </div>

      <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="h-8 text-xs flex items-center gap-1 mb-4 w-full" variant="outline">
          <FileText className="h-3 w-3" /> Ver CV Completo
        </Button>
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Resumen del CV</h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            Profesional con 5 años de experiencia en desarrollo de software. Especializado en tecnologías frontend como React y TypeScript. Experiencia en proyectos de e-commerce y aplicaciones financieras. Graduado en Ingeniería Informática. Certificaciones en React Advanced y TypeScript. Inglés nivel avanzado. Disponibilidad inmediata.
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <Tabs defaultValue="notes" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">Mis anotaciones</TabsTrigger>
            <TabsTrigger value="feedbacks">Historial de comentarios</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-4">
            <Textarea
              placeholder="Añadir una nueva nota..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px] text-sm"
            />
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                Guardar nota
              </Button>
            </div>
            {candidate.postulacion.notas?.length ? (
              <div className="space-y-4 mt-4">
                {candidate.postulacion.notas.map((note, i) => (
                  <div key={i} className="border-b pb-4">
                    <div className="font-medium">Nota #{i + 1}</div>
                    <p className="text-sm">{note.content || "Sin contenido"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay anotaciones disponibles.</p>
            )}
          </TabsContent>

          <TabsContent value="feedbacks" className="mt-4">
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="text-sm font-medium mb-2">Historial de comentarios</h4>
              <p className="text-xs text-gray-600">
                Aquí podrás ver todos los comentarios registrados para este candidato por diferentes reclutadores.
              </p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : feedbacks.length > 0 ? (
              <div className="space-y-4">
                {feedbacks.map((f) => (
                  <div key={f.id} className="border-b pb-4">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">
                        {f.nombreReclutador} - {f.empresaReclutador}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        {formatDate(f.fecha)}
                        {currentUserId && f.usuarioId && currentUserId === f.usuarioId && (
                          <>
                            <button
                              onClick={() => {
                                console.log("Editando comentario:", f);
                                setEditingFeedback(f);
                                setEditText(f.texto);
                              }}
                              className="p-1 hover:text-blue-600 transition-colors"
                              title="Editar comentario"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                console.log("Eliminando comentario:", f);
                                handleDeleteFeedback(f.id);
                              }}
                              className="p-1 hover:text-red-600 transition-colors"
                              title="Eliminar comentario"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{f.texto}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No hay comentarios disponibles.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de edición */}
      <Dialog open={!!editingFeedback} onOpenChange={() => {
        setEditingFeedback(null);
        setEditText("");
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar comentario</DialogTitle>
            <DialogDescription>
              Modifica el texto del comentario y guarda los cambios.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[120px]"
              placeholder="Escribe tu comentario aquí..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditingFeedback(null);
                setEditText("");
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEditFeedback}
              disabled={!editText.trim()}
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
