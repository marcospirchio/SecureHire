"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Loader2, Check, X } from "lucide-react"
import { toast } from "sonner"
import { AIBackground } from "@/components/ui/ai-background"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardLayout } from "@/components/dashboard/layout"
import { ArrowLeft, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface Busqueda {
  id: string
  titulo: string
  empresa: string
  camposAdicionales?: {
    nombre: string
    tipo: string
    valoresExcluyentes?: string[]
  }[]
}

interface Postulacion {
  id: string
  candidatoId: string
  busquedaId: string
  faseActual: string
  estado: string
  fechaPostulacion: string
  resumenCv?: string
  candidato?: {
    nombre: string
    apellido: string
  }
  adecuacion?: string
  comentarioIA?: string
}

// Función inline para quitar tildes
function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Helper para parsear y ordenar resultados IA
function parseResultadosIA(resultado: string) {
  if (!resultado) return [];
  return resultado
    .split('\n')
    .map(linea => {
      // Acepta nombres compuestos: (nombre apellido(s)) tiene un XX% de adecuación al puesto. comentario
      const match = linea.match(/^([\wáéíóúüñ ]+)\s+tiene\s+un\s+(\d+)% de adecuación al puesto\.\s*(.*)$/i);
      if (match) {
        return {
          nombre: match[1].trim(),
          porcentaje: parseInt(match[2], 10),
          comentario: match[3]?.trim() || ''
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => (b!.porcentaje - a!.porcentaje));
}

function getColorByPorcentaje(p: number) {
  if (p <= 40) return 'bg-red-100 text-red-800 border-red-200';
  if (p <= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-green-100 text-green-800 border-green-200';
}

export default function EvaluarCandidatosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)
  const [busquedas, setBusquedas] = useState<Busqueda[]>([])
  const [busquedaSeleccionada, setBusquedaSeleccionada] = useState<string>("")
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [postulacionesSeleccionadas, setPostulacionesSeleccionadas] = useState<string[]>([])

  useEffect(() => {
    const cargarBusquedas = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/busquedas", {
          credentials: "include",
        })
        if (!response.ok) throw new Error("Error al cargar búsquedas")
        const data = await response.json()
        setBusquedas(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar búsquedas",
          variant: "destructive"
        })
        console.error(error)
      }
    }
    cargarBusquedas()
  }, [])

  useEffect(() => {
    const cargarPostulaciones = async () => {
      if (!busquedaSeleccionada) return;
      
      try {
        const response = await fetch(`http://localhost:8080/api/postulaciones/busqueda/${busquedaSeleccionada}?estado=pendiente`, {
          credentials: "include",
        })
        if (!response.ok) throw new Error("Error al cargar postulaciones")
        const postulacionesData = await response.json()

        // Obtener los datos de cada candidato
        const postulacionesConCandidatos = await Promise.all(
          postulacionesData.map(async (postulacion: any) => {
            try {
              const candidatoResponse = await fetch(`http://localhost:8080/api/candidatos/${postulacion.candidatoId}`, {
                credentials: "include",
              })
              if (!candidatoResponse.ok) throw new Error("Error al cargar datos del candidato")
              const candidatoData = await candidatoResponse.json()
              return {
                ...postulacion,
                candidato: {
                  nombre: candidatoData.nombre,
                  apellido: candidatoData.apellido
                }
              }
            } catch (error) {
              console.error("Error al cargar datos del candidato:", error)
              return {
                ...postulacion,
                candidato: {
                  nombre: "Error al cargar",
                  apellido: ""
                }
              }
            }
          })
        )

        setPostulaciones(postulacionesConCandidatos)
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar postulaciones",
          variant: "destructive"
        })
        console.error(error)
      }
    }
    cargarPostulaciones()
  }, [busquedaSeleccionada])

  type PostulacionType = {
    respuestas?: { campo: string; respuesta: string | string[] }[];
  };
  type BusquedaType = {
    camposAdicionales?: { nombre: string; tipo: string; valoresExcluyentes?: string[] }[];
  };
  const cumpleExcluyentes = (postulacion: PostulacionType, busqueda?: BusquedaType) => {
    if (!busqueda || !busqueda.camposAdicionales) return true;
    // Solo campos excluyentes
    const camposExcluyentes = busqueda.camposAdicionales.filter((c) => c.valoresExcluyentes && c.valoresExcluyentes.length > 0);
    if (camposExcluyentes.length === 0) return true;
    return camposExcluyentes.every((campo) => {
      const respuesta = (postulacion.respuestas || []).find((r) => r.campo === campo.nombre);
      if (!respuesta) return false;
      if (campo.tipo === 'checkbox') {
        const respuestasCandidato = Array.isArray(respuesta.respuesta) ? respuesta.respuesta : [respuesta.respuesta];
        return (campo.valoresExcluyentes ?? []).every((valor) => respuestasCandidato.includes(valor));
      } else {
        return (campo.valoresExcluyentes ?? []).includes(String(respuesta.respuesta));
      }
    });
  };

  const handleEvaluar = async () => {
    if (postulacionesSeleccionadas.length === 0) return

    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/api/ia/comparar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          postulacionIds: postulacionesSeleccionadas,
        }),
      })

      if (!response.ok) throw new Error("Error al evaluar candidatos")
      const data = await response.text()
      // Extraer solo el texto del resultado
      const match = data.match(/"resultado":\s*"([^"]+)"/)
      let resultadoPlano = data
      if (match && match[1]) {
        resultadoPlano = match[1]
          .replace(/\\n/g, '\n')
          .replace(/\\u00f3/g, 'ó')
          .replace(/\\u00e1/g, 'á')
          .replace(/\\u00e9/g, 'é')
          .replace(/\\u00ed/g, 'í')
          .replace(/\\u00fa/g, 'ú')
      }
      setResultado(resultadoPlano)

      // Asociación robusta: nombre y apellido exactos, sin tildes, lower
      const lineas = resultadoPlano.split('\n').filter(Boolean)
      setPostulaciones((prev) => prev.map((post) => {
        const nombreCompleto = removeDiacritics(`${post.candidato?.nombre || ''} ${post.candidato?.apellido || ''}`.trim().toLowerCase());
        const linea = lineas.find(l => {
          // Extraer nombre y apellido de la línea
          const matchNombre = l.match(/^([\wáéíóúüñ]+)\s+([\wáéíóúüñ]+)\s+tiene\s+un\s+\d+%/i);
          if (matchNombre) {
            const lineaNombre = removeDiacritics(`${matchNombre[1]} ${matchNombre[2]}`.trim().toLowerCase());
            return lineaNombre === nombreCompleto;
          }
          return false;
        });
        if (linea) {
          const porcentajeMatch = linea.match(/(\d+%) de adecuación/)
          const comentario = linea.replace(/^[^ ]+ [^ ]+ tiene un \d+% de adecuación al puesto\. ?/, "")
          return {
            ...post,
            adecuacion: porcentajeMatch ? porcentajeMatch[1] : undefined,
            comentarioIA: comentario.trim()
          }
        }
        return {
          ...post,
          adecuacion: undefined,
          comentarioIA: undefined
        }
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al evaluar candidatos",
        variant: "destructive"
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const togglePostulacion = (id: string) => {
    setPostulacionesSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(postId => postId !== id) : [...prev, id]
    )
  }

  return (
    <Sidebar>
      <DashboardLayout>
        <div className="flex items-center gap-4 mb-8 mt-2">
          <button
            onClick={() => router.back()}
            className="mr-2"
            aria-label="Volver"
          >
            <ArrowLeft className="h-7 w-7 text-foreground" />
          </button>
          <div className="flex items-center gap-5">
            <span className="flex items-center justify-center h-16 w-16 bg-gradient-to-br from-purple-400 via-indigo-400 to-blue-400 rounded-2xl shadow-lg">
              <Sparkles className="h-10 w-10 text-white drop-shadow-lg" />
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center">
              Evaluar mejores candidatos
              <span
                className="ml-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent font-extrabold"
                style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                IA
              </span>
              <span className="ml-1 animate-blink text-3xl font-extrabold text-purple-400">|</span>
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mb-8">
          <p className="text-muted-foreground text-lg">
            Utiliza nuestra IA para evaluar y comparar candidatos de forma objetiva. Selecciona una búsqueda y los candidatos que deseas comparar.
          </p>
        </div>

        <div className="mb-6 max-w-md">
          <label className="block text-sm font-medium mb-2">Seleccionar Búsqueda</label>
          <select
            value={busquedaSeleccionada}
            onChange={(e) => setBusquedaSeleccionada(e.target.value)}
            className="w-full p-2 border rounded bg-background text-foreground"
          >
            <option value="">Seleccione una búsqueda</option>
            {busquedas.map((busqueda) => (
              <option key={busqueda.id} value={busqueda.id}>
                {busqueda.titulo}
              </option>
            ))}
          </select>
        </div>

        {busquedaSeleccionada && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {postulaciones.map((postulacion) => {
                const esVerde = cumpleExcluyentes(postulacion as PostulacionType, busquedas.find(b => b.id === busquedaSeleccionada));
                return (
                  <div
                    key={postulacion.id}
                    className={`border rounded-xl p-5 shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col gap-2 ${postulacionesSeleccionadas.includes(postulacion.id) ? 'ring-2 ring-purple-400' : ''} ${esVerde ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                    onClick={() => togglePostulacion(postulacion.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-lg text-foreground">
                        {postulacion.candidato?.nombre} {postulacion.candidato?.apellido}
                      </span>
                      <input
                        type="checkbox"
                        checked={postulacionesSeleccionadas.includes(postulacion.id)}
                        onChange={() => {}}
                        className="h-4 w-4 accent-purple-500 ml-auto"
                      />
                    </div>
                    {/* Mostrar adecuación y comentario IA si existen */}
                    {postulacion.adecuacion && (
                      <div className="text-base font-semibold text-purple-700 mb-1">{postulacion.adecuacion} de adecuación</div>
                    )}
                    {postulacion.comentarioIA && (
                      <div className="text-sm text-muted-foreground whitespace-pre-line">{postulacion.comentarioIA}</div>
                    )}
                  </div>
                )
              })}
            </div>
            {/* Output de resultados IA ordenados y coloreados, entre las cards y el botón */}
            {resultado && (
              <div className="mb-8 p-4 rounded-xl shadow-lg border bg-white max-w-3xl mx-auto">
                <h2 className="font-bold text-lg mb-3 text-foreground">Resultados de la evaluación IA</h2>
                {parseResultadosIA(resultado).length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {parseResultadosIA(resultado).map((r, idx) => {
                      const res = r as { nombre: string; porcentaje: number; comentario: string };
                      return (
                        <div
                          key={res.nombre + idx}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg border font-medium ${getColorByPorcentaje(res.porcentaje)}`}
                        >
                          <span className="w-40 truncate font-bold">{res.nombre}</span>
                          <span className="text-lg font-bold">{res.porcentaje}%</span>
                          <span className="flex-1 text-sm text-foreground/80 ml-2">{res.comentario}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm whitespace-pre-line">{resultado}</div>
                )}
              </div>
            )}
            {postulacionesSeleccionadas.length > 0 && (
              <div className="mb-8">
                <button
                  onClick={handleEvaluar}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:from-purple-600 hover:to-indigo-600 transition disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><Sparkles className="animate-spin h-5 w-5" /> Evaluando...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Evaluar Candidatos Seleccionados</span>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        <style jsx global>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .animate-blink {
            animation: blink 1s steps(2, start) infinite;
          }
        `}</style>
      </DashboardLayout>
    </Sidebar>
  )
} 