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
      if (match && match[1]) {
        // Reemplazar los caracteres escapados
        const cleanText = match[1]
          .replace(/\\n/g, '\n')
          .replace(/\\u00f3/g, 'ó')
          .replace(/\\u00e1/g, 'á')
          .replace(/\\u00e9/g, 'é')
          .replace(/\\u00ed/g, 'í')
          .replace(/\\u00fa/g, 'ú')
        setResultado(cleanText)
      } else {
        setResultado(data)
      }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {postulaciones.map((postulacion) => (
              <div
                key={postulacion.id}
                className={`border rounded-xl p-5 shadow-sm bg-card hover:shadow-lg transition cursor-pointer flex flex-col gap-2 ${postulacionesSeleccionadas.includes(postulacion.id) ? 'ring-2 ring-purple-400' : ''}`}
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
                {postulacion.resumenCv && (
                  <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-line">
                    {postulacion.resumenCv}
                  </p>
                )}
              </div>
            ))}
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

        {resultado && (
          <div className="mt-6 rounded-xl border bg-card p-6 shadow-lg">
            <pre className="whitespace-pre-wrap font-mono text-base text-foreground">
              {resultado}
            </pre>
          </div>
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