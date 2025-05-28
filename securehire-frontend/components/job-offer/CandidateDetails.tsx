import { X, AlertTriangle, Calendar, FileText, Pencil, Trash2, Sparkles } from 'lucide-react'
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
  const [iaSummary, setIaSummary] = useState<string | null>(null)
  const [iaLoading, setIaLoading] = useState(false)
  const [showFullSummary, setShowFullSummary] = useState(false)
  const [filters, setFilters] = useState({
    minAge: "",
    maxAge: "",
    gender: "todos",
    name: ""
  })

  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/auth/me', {
          credentials: "include",
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("Usuario actual obtenido:", userData);
          setCurrentUserId(userData.id);
        } else {
          console.warn("No se pudo obtener el usuario actual:", response.status);
        }
      } catch (error) {
        console.error("Error al obtener el usuario actual:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  
  const applyFilters = (candidate: Candidate) => {
    if (filters.minAge && candidate.age < parseInt(filters.minAge)) return false;
    if (filters.maxAge && candidate.age > parseInt(filters.maxAge)) return false;
    if (filters.gender !== "todos" && candidate.gender.toLowerCase() !== filters.gender) return false;
    if (filters.name && !`${candidate.name} ${candidate.lastName}`.toLowerCase().includes(filters.name.toLowerCase())) return false;
    return true;
  }

  //Obtener comentarios con datos del reclutador
  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (activeTab !== "feedbacks" || !candidate?.postulacion?.candidatoId) return;

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/comentarios/candidato/${candidate.postulacion.candidatoId}`, {
          credentials: "include",
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error("Error al cargar los comentarios");

        const data = await response.json();

        const feedbacksWithInfo = await Promise.all(
          data.map(async (f: any) => {
            try {
              const recruiterRes = await fetch(`http://localhost:8080/api/usuarios/${f.usuarioId}`, {
                credentials: "include",
                headers: { 'Accept': 'application/json' }
              });

              const recruiterData: Usuario = recruiterRes.ok
                ? await recruiterRes.json()
                : { nombre: "Reclutador", apellido: "", empresa: "Empresa" };

              return {
                id: f.id,
                texto: f.texto,
                fecha: f.fecha,
                usuarioId: f.usuarioId,
                candidatoId: f.candidatoId,
                postulacionId: f.postulacionId,
                nombreReclutador: `${recruiterData.nombre} ${recruiterData.apellido}`,
                empresaReclutador: recruiterData.empresa
              };
            } catch (e) {
              console.error("Error al cargar reclutador:", e);
              return null;
            }
          })
        );

        
        const feedbacksOrdenados = feedbacksWithInfo
          .filter(Boolean)
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        setFeedbacks(feedbacksOrdenados);
      } catch (error) {
        console.error("Error al cargar comentarios:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los comentarios",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [activeTab, candidate?.postulacion?.candidatoId, currentUserId, toast]);

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

  
  const [anotaciones, setAnotaciones] = useState<{ content: string; fecha?: string | null }[]>([])
  const [loadingNotas, setLoadingNotas] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  
  const fetchAnotaciones = async () => {
    setLoadingNotas(true)
    try {
      const res = await fetch(`http://localhost:8080/api/postulaciones/anotaciones/postulacion/${candidate.postulacion.id}`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        const anotacionesFormateadas = data.map((a: any) => ({
          content: a.comentario,
          fecha: a.fecha || null
        }))
        setAnotaciones(anotacionesFormateadas)
      }
    } catch (error) {
      console.error("Error al obtener anotaciones privadas:", error)
    } finally {
      setLoadingNotas(false)
    }
  }

  
  useEffect(() => {
    if (candidate?.postulacion?.id) {
      fetchAnotaciones()
    }
  }, [candidate?.postulacion?.id])

  
  const handleAddNote = async () => {
    if (!newNote.trim()) return
    try {
      const res = await fetch(`http://localhost:8080/api/postulaciones/${candidate.postulacion.id}/anotaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ comentario: newNote })
      })
      if (!res.ok) throw new Error("No se pudo guardar la anotación")
      setNewNote("")
      await fetchAnotaciones()
    } catch (error) {
      console.error("Error al agregar anotación:", error)
    }
  }

  
  const handleEditNote = async (index: number) => {
    if (!editText.trim()) return
    try {
      const res = await fetch(`http://localhost:8080/api/postulaciones/${candidate.postulacion.id}/anotaciones/${index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editText)
      })
      if (!res.ok) throw new Error("No se pudo editar la anotación")
      setEditingIndex(null)
      setEditText("")
      await fetchAnotaciones()
    } catch (error) {
      console.error("Error al editar anotación:", error)
    }
  }

  
  const handleDeleteNote = async (index: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/postulaciones/${candidate.postulacion.id}/anotaciones/${index}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) throw new Error("No se pudo eliminar la anotación")
      await fetchAnotaciones()
    } catch (error) {
      console.error("Error al eliminar anotación:", error)
    }
  }

  
  const anotacionesOrdenadas = [...anotaciones]
    .map((a, idx) => ({ ...a, idx }))
    .sort((a, b) => {
      if (a.fecha && b.fecha) {
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      }
      return 0;
    });

  
  useEffect(() => {
    const fetchResumenCv = async () => {
      if (candidate.postulacion?.id) {
        try {
          const response = await fetch(`http://localhost:8080/api/postulaciones/${candidate.postulacion.id}`, {
            credentials: "include",
            headers: { 'Accept': 'application/json' }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.resumenCv) {
              setIaSummary(data.resumenCv);
            } else {
              setIaSummary(null);
            }
          } else {
            setIaSummary(null);
          }
        } catch (error) {
          setIaSummary(null);
          console.error('Error al obtener el resumen del CV:', error);
        }
      }
    };
    fetchResumenCv();
  }, [candidate.postulacion?.id]);
  
  const handleIASummary = async () => {
    if (!candidate?.postulacion?.id || !candidate?.postulacion?.candidatoId) {
      toast({
        title: "Faltan datos",
        description: "No se puede generar el resumen. Postulación o candidato no válidos.",
        variant: "destructive"
      });
      return;
    }
  
    setIaLoading(true);
    try {
      const cvResponse = await fetch(`http://localhost:8080/api/postulaciones/${candidate.postulacion.id}/cv`, {
        credentials: "include",
        headers: { 'Accept': 'application/pdf' }
      });
  
      if (!cvResponse.ok) {
        const errorText = await cvResponse.text();
        throw new Error(`Error al obtener CV: ${cvResponse.status} ${errorText}`);
      }
  
      const blob = await cvResponse.blob();
      if (blob.size === 0) throw new Error('El archivo CV está vacío');
  
      const file = new File([blob], 'cv.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('postulacionId', candidate.postulacion.id);
      formData.append('busquedaId', candidate.postulacion.busquedaId || "");
  
      const iaRes = await fetch(`http://localhost:8080/api/geminiIA/extraer-cv-y-resumir`, {
        method: 'POST',
        credentials: "include",
        body: formData
      });
  
      if (!iaRes.ok) {
        const errorText = await iaRes.text();
        throw new Error(`Error al obtener resumen IA: ${iaRes.status} ${errorText}`);
      }
  
      const resumen = await iaRes.text();
  
      
      if (!resumen || resumen.trim().length === 0) {
        setIaSummary(null);
        toast({
          title: "Resumen vacío",
          description: "El resumen generado está vacío. Intenta nuevamente.",
          variant: "destructive"
        });
        return;
      }
  
      setIaSummary(resumen);
  
      
      const updateResponse = await fetch(`http://localhost:8080/api/postulaciones/${candidate.postulacion.id}`, {
        method: 'PATCH',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ resumenCv: resumen })
      });
  
      if (!updateResponse.ok) {
        toast({
          title: "Error al guardar el resumen",
          description: "No se pudo guardar el resumen en la postulación.",
          variant: "destructive"
        });
      }
    } catch (e) {
      setIaSummary(null);
      toast({
        title: "Error IA",
        description: e instanceof Error ? e.message : 'No se pudo obtener el resumen IA. Por favor, intente nuevamente.',
        variant: "destructive"
      });
    } finally {
      setIaLoading(false);
    }
  };

  return (
    <div className="w-1/2 bg-white rounded-lg border p-3 relative h-[90vh] flex flex-col">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </button>
      <div className="flex-1 overflow-y-auto pr-2">
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
                    <li key={i} className="text-sm text-amber-700">
                      <span className="font-medium">{req.campo}</span><br />
                      Respuesta: <span className="italic">{Array.isArray(req.respuesta) ? req.respuesta.join(", ") : req.respuesta}</span>
                    </li>
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

        <div className="mt-4 pt-4 border-t">
          <Button 
            className="h-8 text-xs flex items-center gap-1 mb-4 w-full" 
            variant="outline"
            onClick={() => {
              if (candidate.postulacion?.id) {
                window.open(`http://localhost:8080/api/postulaciones/${candidate.postulacion.id}/cv`, '_blank');
              }
            }}
          >
            <FileText className="h-3 w-3" /> Ver CV Completo
          </Button>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-700">Resumen del CV</h4>
              {iaLoading ? (
                <p className="text-xs text-gray-500">Generando resumen IA...</p>
                  ) : iaSummary ? (
                <div className="flex items-center gap-2">
                  <p 
                    className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                    title="Ver resumen completo"
                    onClick={() => iaSummary && setShowFullSummary(true)}
                  >
                    Abrir resumen del CV de {candidate.name} {candidate.lastName}
                  </p>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    disabled
                    title="Ya existe un resumen generado"
                    className="bg-transparent cursor-default"
                  >
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  </Button>
                </div>
                  ) : (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400 italic">
                      Haz click en el botón de IA para generar el resumen del CV.
                    </p>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleIASummary} 
                  disabled={iaLoading} 
                  title="Generar resumen IA"
                  className="hover:bg-purple-100"
                >
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <Tabs defaultValue="feedbacks" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feedbacks">Historial de comentarios</TabsTrigger>
              <TabsTrigger value="notes">Mis anotaciones</TabsTrigger>
            </TabsList>

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
                                  setEditingFeedback(f);
                                  setEditText(f.texto);
                                }}
                                className="p-1 hover:text-blue-600 transition-colors"
                                title="Editar comentario"
                              >
                                <Pencil className="h-4 w-4 text-gray-500" />
                              </button>
                              <button
                                onClick={() => handleDeleteFeedback(f.id)}
                                className="p-1 hover:text-red-600 transition-colors"
                                title="Eliminar comentario"
                              >
                                <Trash2 className="h-4 w-4 text-gray-500" />
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

            <TabsContent value="notes" className="mt-4">
              <div className="mb-4">
                <Textarea
                  placeholder="Añadir una nueva nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px] text-base"
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                    Guardar nota
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {anotacionesOrdenadas.length > 0 && anotacionesOrdenadas.map((note) => (
                  <div key={note.idx} className="border rounded-lg p-4 bg-gray-50 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-gray-800">{note.content}</span>
                      <div className="flex gap-2">
                        <Pencil className="h-5 w-5 cursor-pointer text-gray-500 hover:text-blue-600" onClick={() => { setEditingIndex(note.idx); setEditText(note.content); }} />
                        <Trash2 className="h-5 w-5 cursor-pointer text-gray-500 hover:text-red-600" onClick={() => handleDeleteNote(note.idx)} />
                      </div>
                    </div>
                    {note.fecha && (
                      <span className="text-xs text-gray-500">{formatDate(note.fecha)}</span>
                    )}
                    {editingIndex === note.idx && (
                      <div className="flex flex-col gap-2 mt-2">
                        <input
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className="border rounded px-2 py-1 text-base"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" onClick={() => handleEditNote(note.idx)} disabled={!editText.trim()}>
                            Guardar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
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
      <Dialog open={showFullSummary} onOpenChange={setShowFullSummary}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resumen completo del CV</DialogTitle>
            <DialogDescription>
              Resumen generado por IA del CV del candidato
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="whitespace-pre-wrap text-sm text-gray-800 bg-white p-4 rounded-lg">
              {iaSummary}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
 