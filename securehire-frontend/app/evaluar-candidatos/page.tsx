"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  Brain,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Calendar,
  Sparkles,
  UserCheck,
  TrendingUp,
  Award,
  Target,
  Zap,
  Filter,
  Search
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardLayout } from "@/components/dashboard/layout"
import { ImagenPerfil } from "@/components/job-offer/ImagenPerfil"

// Función inline para quitar tildes
function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/\u0300-\u036f/g, '');
}

function CompararCandidatosHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-4 md:px-6 w-full">
      <div className="flex items-center gap-4">
        <img src="/Comparar_candidato_logo.png" alt="Comparar Candidatos" className="h-10 w-10 object-contain" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Comparar Candidatos</h1>
          <p className="text-gray-600 leading-tight text-sm">Análisis comparativo con inteligencia artificial</p>
        </div>
      </div>
    </header>
  )
}

export default function EvaluarCandidatosPage() {
  const router = useRouter()
  const [busquedas, setBusquedas] = useState<any[]>([])
  const [conteos, setConteos] = useState<any[]>([])
  const [selectedJobSearch, setSelectedJobSearch] = useState<string>("")
  const [postulaciones, setPostulaciones] = useState<any[]>([])
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [comparisonResults, setComparisonResults] = useState<any>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [currentPage, setCurrentPage] = useState(1)
  const candidatesPerPage = 6
  const [loadingBusquedas, setLoadingBusquedas] = useState(false)
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(false)
  const [iaResult, setIaResult] = useState<string | null>(null)
  const [iaLoading, setIaLoading] = useState(false)
  const [iaResults, setIaResults] = useState<any[]>([])
  const [busquedaData, setBusquedaData] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Paginación de resultados IA
  const iaCandidatesPerPage = 2; // Puedes ajustar este valor
  const [iaCurrentPage, setIaCurrentPage] = useState(1);
  // Filtrar solo los que cumplen todos los requisitos excluyentes
  const iaResultsWithPostulacion = iaResults.map((resultado) => {
    const postulacion = postulaciones.find(p =>
      p.candidato && p.candidato.nombre && resultado.nombre &&
      p.candidato.nombre.trim().toLowerCase() === resultado.nombre.trim().toLowerCase()
    );
    return { ...resultado, postulacion };
  });
  const iaResultsFiltered = iaResultsWithPostulacion.filter(r => {
    const isExcluido = r.postulacion?.requisitosExcluyentes && r.postulacion.requisitosExcluyentes.length > 0;
    return !isExcluido;
  });
  const iaTotalPages = Math.ceil(iaResultsFiltered.length / iaCandidatesPerPage);
  const iaIndexOfLast = iaCurrentPage * iaCandidatesPerPage;
  const iaIndexOfFirst = iaIndexOfLast - iaCandidatesPerPage;
  const iaCurrentResults = iaResultsFiltered.slice(iaIndexOfFirst, iaIndexOfLast);

  // Fetch de búsquedas del usuario
  useEffect(() => {
    setLoadingBusquedas(true)
    fetch("http://localhost:8080/api/busquedas", { credentials: "include" })
      .then(res => res.json())
      .then(data => setBusquedas(data))
      .catch(() => setBusquedas([]))
      .finally(() => setLoadingBusquedas(false))
  }, [])

  // Fetch de conteo de postulaciones por búsqueda
  useEffect(() => {
    fetch("http://localhost:8080/api/postulaciones/conteo-por-busqueda", { credentials: "include" })
      .then(res => res.json())
      .then(data => setConteos(data))
      .catch(() => setConteos([]))
  }, [])

  // Fetch de postulaciones por búsqueda seleccionada
  useEffect(() => {
    if (!selectedJobSearch) return;
    setLoadingPostulaciones(true)
    fetch(`http://localhost:8080/api/postulaciones/busqueda/${selectedJobSearch}?estado=pendiente`, { credentials: "include" })
      .then(res => res.json())
      .then(async (data) => {
        // Para cada postulacion, obtener datos del candidato
        const postulacionesConCandidato = await Promise.all(
          data.map(async (postulacion: any) => {
            try {
              const candidatoRes = await fetch(`http://localhost:8080/api/candidatos/${postulacion.candidatoId}`, { credentials: "include" })
              const candidato = await candidatoRes.json()
              return { ...postulacion, candidato }
            } catch {
              return { ...postulacion, candidato: { nombre: "Error", apellido: "" } }
            }
          })
        )
        setPostulaciones(postulacionesConCandidato)
      })
      .catch(() => setPostulaciones([]))
      .finally(() => setLoadingPostulaciones(false))
  }, [selectedJobSearch])

  // Fetch de la búsqueda seleccionada para obtener camposAdicionales
  useEffect(() => {
    if (!selectedJobSearch) return;
    fetch(`http://localhost:8080/api/busquedas/${selectedJobSearch}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setBusquedaData(data))
      .catch(() => setBusquedaData(null))
  }, [selectedJobSearch])

  // Filtrar candidatos por término de búsqueda
  const filteredCandidates = postulaciones.filter((postulacion) =>
    `${postulacion.candidato?.nombre || ''} ${postulacion.candidato?.apellido || ''}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Paginación de candidatos
  const indexOfLastCandidate = currentPage * candidatesPerPage
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage
  const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate)
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage)

  // Manejar selección de candidatos
  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId],
    )
  }

  // Cambiar de página
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Función para obtener el color según el puntaje
  const getScoreColor = (score: number) => {
    if (score < 50) return "text-red-600"
    if (score < 75) return "text-amber-600"
    return "text-green-600"
  }

  // Función para obtener el color de fondo según el puntaje
  const getScoreBgColor = (score: number) => {
    if (score < 50) return "bg-red-50"
    if (score < 75) return "bg-amber-50"
    return "bg-green-50"
  }

  // Función para obtener el color de borde según el puntaje
  const getScoreBorderColor = (score: number) => {
    if (score < 50) return "border-red-200"
    if (score < 75) return "border-amber-200"
    return "border-green-200"
  }

  // Función para obtener el icono según el puntaje
  const getScoreIcon = (score: number) => {
    if (score < 50) return <XCircle className="h-4 w-4" />
    if (score < 75) return <AlertTriangle className="h-4 w-4" />
    return <CheckCircle2 className="h-4 w-4" />
  }

  // Obtener el icono para las búsquedas
  const getJobIcon = () => {
    return <Briefcase className="h-4 w-4" />
  }

  // Obtener conteo de postulaciones para una búsqueda
  const getConteoForBusqueda = (busquedaId: string) => {
    const conteo = conteos.find((c: any) => c.busquedaId === busquedaId)
    return conteo ? conteo.cantidad : 0
  }

  // Función para calcular si un candidato cumple todos los requisitos excluyentes
  const cumpleRequisitosExcluyentes = (postulacion: any) => {
    if (!busquedaData?.camposAdicionales || !Array.isArray(busquedaData.camposAdicionales)) return true;
    const campos = busquedaData.camposAdicionales.filter((campo: any) => campo.valoresExcluyentes && campo.valoresExcluyentes.length > 0)
    for (const campo of campos) {
      const respuesta = (postulacion.respuestas || []).find((r: any) => r.campo === campo.nombre);
      if (!respuesta) return false;
      if (campo.tipo === "checkbox") {
        const respuestasCandidato = Array.isArray(respuesta.respuesta) ? respuesta.respuesta : [respuesta.respuesta];
        const valoresExcluyentes = campo.valoresExcluyentes || [];
        const noCumple = valoresExcluyentes.some((valor: string) => !respuestasCandidato.includes(valor));
        if (noCumple) return false;
      } else {
        const valoresExcluyentes = campo.valoresExcluyentes || [];
        if (valoresExcluyentes.length > 0 && !valoresExcluyentes.includes(respuesta.respuesta)) {
          return false;
        }
      }
    }
    return true;
  };

  // Comparar candidatos usando el endpoint real de IA
  const compareSelectedCandidates = async () => {
    setIsComparing(true)
    setIaLoading(true)
    setIaResult(null)
    setComparisonResults(null)
    try {
      // Delay de 4 segundos para simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // 1. Verificar si todos los seleccionados tienen resumenCv
      for (const postulacionId of selectedCandidates) {
        const postulacion = postulaciones.find(p => p.id === postulacionId);
        if (!postulacion) throw new Error("No se encontró la postulación seleccionada");
        if (!postulacion.resumenCv) {
          // Obtener el CV
          const cvResponse = await fetch(`http://localhost:8080/api/postulaciones/${postulacion.id}/cv`, {
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
          formData.append('postulacionId', postulacion.id);
          formData.append('busquedaId', postulacion.busquedaId || "");
          // Generar el resumen
          const iaRes = await fetch(`http://localhost:8080/api/geminiIA/extraer-cv-y-resumir`, {
            method: 'POST',
            credentials: "include",
            body: formData
          });
          if (!iaRes.ok) {
            const errorText = await iaRes.text();
            throw new Error(`Error al generar resumen IA: ${iaRes.status} ${errorText}`);
          }
          // Opcional: podrías refrescar la postulación aquí si quieres el resumen actualizado en el frontend
        }
      }
      // 2. Ejecutar la comparación IA
      const response = await fetch("http://localhost:8080/api/ia/comparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postulacionIds: selectedCandidates })
      })
      if (!response.ok) throw new Error("Error al comparar candidatos")
      const data = await response.json()
      // Ordenar por puntaje descendente
      const resultados = (data.resultados || []).sort((a: any, b: any) => b.score - a.score)
      setIaResults(resultados)
      setComparisonResults({ candidates: resultados }) // Para compatibilidad con nuevo diseño

      // 3. Actualizar estado de postulaciones para marcarlas como analizadas
      setPostulaciones(prevPostulaciones =>
        prevPostulaciones.map(p => {
            const resultado = resultados.find((res: any) => {
                const postulationName = `${p.candidato?.nombre?.trim().toLowerCase()} ${p.candidato?.apellido?.trim().toLowerCase()}`;
                const resultName = res.nombre.trim().toLowerCase();
                return postulationName === resultName;
            });

            if (resultado) {
                return {
                    ...p,
                    hasBeenAnalyzed: true,
                    score: resultado.score,
                };
            }
            return p;
        })
      )

    } catch (e) {
      setIaResult("Error al comparar candidatos")
    } finally {
      setIsComparing(false)
      setIaLoading(false)
    }
  }

  // Estadísticas de candidatos
  const analyzedCandidates = postulaciones.filter((c) => c.hasBeenAnalyzed)
  const highScoreCandidates = analyzedCandidates.filter((c) => (c.score || 0) >= 75)
  const avgScore =
    analyzedCandidates.length > 0
      ? Math.round(analyzedCandidates.reduce((sum, c) => sum + (c.score || 0), 0) / analyzedCandidates.length)
      : 0

  return (
    <Sidebar>
      <DashboardLayout customHeader={<CompararCandidatosHeader />}>
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Panel de control */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Selector de búsqueda */}
              <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Seleccionar Búsqueda</h3>
                  </div>

                  <Select
                    value={selectedJobSearch}
                    onValueChange={(value) => {
                      setSelectedJobSearch(value)
                      setCurrentPage(1)
                      setSelectedCandidates([])
                    }}
                  >
                    <SelectTrigger className="w-full h-12 bg-white border-gray-300 rounded-lg">
                      <SelectValue placeholder="Elige una búsqueda activa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Búsquedas disponibles</SelectLabel>
                        {busquedas.map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            <div className="flex items-center gap-3 py-2">
                              <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Briefcase className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{job.titulo || job.title}</div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {getConteoForBusqueda(job.id)} candidatos
                                  </span>
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Panel de estadísticas en blanco y negro con acento azul */}
              <Card className="border border-gray-200 shadow-sm bg-gray-900 text-white">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                    <h3 className="text-lg font-semibold">Estadísticas</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Candidatos de alto nivel</span>
                      <span className="text-2xl font-bold text-blue-400">{highScoreCandidates.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Seleccionados</span>
                      <span className="text-2xl font-bold">{selectedCandidates.length}</span>
                    </div>
                    {avgScore > 0 && (
                      <div className="pt-2 border-t border-gray-700">
                        <div className="text-sm text-gray-300 mb-1">Puntuación promedio</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${avgScore}%` }}></div>
                          </div>
                          <span className="text-lg font-bold text-blue-400">{avgScore}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Filtros y búsqueda */}
            {selectedJobSearch && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar candidatos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-12 bg-white border-gray-300 rounded-lg"
                          />
                        </div>
                        <Button variant="outline" size="lg" className="rounded-lg border-gray-300">
                          <Filter className="h-4 w-4 mr-2" />
                          Filtros
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-white border-gray-300 px-3 py-1">
                          {filteredCandidates.length} candidatos
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 px-3 py-1">
                          {selectedCandidates.length} seleccionados
                        </Badge>
                        {selectedCandidates.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCandidates([])}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Limpiar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Grid de candidatos */}
            {selectedJobSearch && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Candidatos Disponibles</h3>
                      {filteredCandidates.length > 0 && (
                        <Badge variant="outline" className="ml-auto border-gray-300">
                          Página {currentPage} de {totalPages}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {loadingPostulaciones ? (
                          <p>Cargando candidatos...</p>
                      ) : currentCandidates.length > 0 ? (
                        currentCandidates.map((postulacion) => {
                          const candidateName = `${postulacion.candidato?.nombre || ''} ${postulacion.candidato?.apellido || ''}`;
                          const hasBeenAnalyzed = postulacion.hasBeenAnalyzed || false;
                          const score = postulacion.score || 0;
                          const matchesRequirements = cumpleRequisitosExcluyentes(postulacion);
                          const perfilDetectado = postulacion.perfilDetectadoIA || "Perfil no detectado.";

                          return (
                            <motion.div
                              key={postulacion.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className={`
                                relative rounded-xl border overflow-hidden transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1
                                ${matchesRequirements ? "bg-green-100 border-green-300" : "bg-white border-gray-200"}
                                ${selectedCandidates.includes(postulacion.id) ? "ring-2 ring-blue-500 ring-offset-2" : ""}
                              `}
                              onClick={() => toggleCandidateSelection(postulacion.id)}
                            >
                              <div className="absolute top-2 right-2 z-10">
                                <Checkbox
                                  checked={selectedCandidates.includes(postulacion.id)}
                                  onCheckedChange={() => toggleCandidateSelection(postulacion.id)}
                                  className={`h-4 w-4 rounded-lg ${
                                    selectedCandidates.includes(postulacion.id)
                                      ? "bg-blue-600 text-white border-blue-600"
                                      : "border-gray-300 bg-white"
                                  }`}
                                />
                              </div>
                              <div className="p-3">
                                {hasBeenAnalyzed ? (
                                  <>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-white ${ score >= 75 ? "bg-gray-900" : score >= 50 ? "bg-gray-600" : "bg-gray-400" }`}>
                                        {score}
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-base">{candidateName}</h4>
                                        <p className="text-sm text-gray-500 truncate">{perfilDetectado}</p>
                                      </div>
                                    </div>

                                    <div className="mb-2">
                                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                        <span>Compatibilidad</span>
                                        <span className={`font-semibold ${getScoreColor(score)}`}>{score}%</span>
                                      </div>
                                      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${ score < 50 ? "bg-red-500" : score < 75 ? "bg-amber-500" : "bg-green-500" }`} style={{ width: `${score}%` }} ></div>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-end">
                                      {matchesRequirements ? (
                                        <Badge className="bg-green-100 text-green-800 border-0 flex items-center gap-1 text-xs">
                                          <CheckCircle2 className="h-3 w-3" /> Cumple
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-red-100 text-red-800 border-0 flex items-center gap-1 text-xs">
                                          <XCircle className="h-3 w-3" /> No cumple
                                        </Badge>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center">
                                        <ImagenPerfil postulacionId={postulacion.id} nombre={postulacion.candidato?.nombre || ''} apellido={postulacion.candidato?.apellido || ''} size={32} />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-base">{candidateName}</h4>
                                        <p className="text-sm text-gray-500 truncate">{perfilDetectado}</p>
                                      </div>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100">
                                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                                        <Brain className="h-3 w-3" />
                                        <span>Pendiente de análisis</span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )
                        })
                      ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            <p>No se encontraron candidatos para esta búsqueda.</p>
                        </div>
                      )}
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center mt-4 gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-8 w-8 rounded-xl border-gray-300"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {Array.from({ length: totalPages }).map((_, index) => (
                          <Button
                            key={index}
                            variant={currentPage === index + 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => paginate(index + 1)}
                            className={`h-6 w-6 rounded-xl p-0 ${
                              currentPage === index + 1 ? "bg-black hover:bg-gray-800 text-white" : "border-gray-300"
                            }`}
                          >
                            {index + 1}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 rounded-xl border-gray-300"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Botón de comparar */}
            {selectedCandidates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
              >
                <Button
                  size="lg"
                  className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-xl text-lg font-semibold"
                  onClick={compareSelectedCandidates}
                  disabled={isComparing}
                >
                  {isComparing ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                      Analizando candidatos...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-3" />
                      Comparar {selectedCandidates.length} candidatos con IA
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Resultados de la comparación */}
            {comparisonResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <Card className="border border-gray-200 shadow-lg overflow-hidden">
                  <div className="bg-gray-900 text-white p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                          <Award className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">Resultados del Análisis</h3>
                          <p className="text-gray-300 mt-1">Comparación inteligente completada</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-300 font-medium">
                          {comparisonResults.candidates.length} candidatos analizados
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[600px] overflow-hidden">
                    <Tabs
                      defaultValue="general"
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full h-full flex flex-col"
                    >
                      <div className="border-b bg-gray-50 flex-shrink-0">
                        <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
                          <TabsTrigger
                            value="general"
                            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            General
                          </TabsTrigger>
                          <TabsTrigger
                            value="criteria"
                            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Criterios
                          </TabsTrigger>
                          <TabsTrigger
                            value="ponderacion"
                            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Ponderación
                          </TabsTrigger>
                          <TabsTrigger
                            value="justificaciones"
                            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Justificaciones
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <TabsContent value="general" className="h-full overflow-y-auto p-4 space-y-4 m-0">
                          <div className="space-y-3">
                            {comparisonResults.candidates.map((candidate: any, index: number) => {
                              const postulacion = postulaciones.find(p => {
                                const postulationName = `${p.candidato?.nombre?.trim().toLowerCase()} ${p.candidato?.apellido?.trim().toLowerCase()}`;
                                return postulationName === candidate.nombre.trim().toLowerCase();
                              });
                              
                              return (
                              <motion.div
                                key={candidate.id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-3 rounded-xl border flex items-center gap-4 transition-all hover:shadow-lg bg-white border-gray-300 ${index === 0 ? "ring-2 ring-blue-500/20 shadow-lg" : ""}`}
                              >
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-lg ${ index === 0 ? "bg-gray-900" : index === 1 ? "bg-gray-700" : index === 2 ? "bg-gray-500" : "bg-gray-400" }`}>
                                  {index + 1}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-xl text-gray-900">{candidate.nombre}</h4>
                                    {index === 0 && (
                                      <Badge className="bg-blue-600 text-white border-0 text-xs">
                                        <Award className="h-3 w-3 mr-1" />
                                        Mejor candidato
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <TrendingUp className="h-4 w-4 text-gray-400" />
                                    <span className={`font-semibold ${getScoreColor(candidate.score)}`}>{candidate.score}% de compatibilidad</span>
                                  </div>
                                </div>
                              </motion.div>
                            )})}
                          </div>
                        </TabsContent>

                        <TabsContent value="criteria" className="h-full overflow-y-auto p-4 m-0">
                          <div className="space-y-6">
                            <div className="text-center mb-4">
                              <h4 className="text-xl font-semibold text-gray-900 mb-1">Criterios de Evaluación</h4>
                              <p className="text-gray-500">
                                Análisis detallado de los criterios evaluados por la IA
                              </p>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <h5 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Métricas de Evaluación
                              </h5>
                              <div className="text-sm text-blue-800 space-y-3">
                                <p>
                                  El sistema de IA evalúa a los candidatos basándose en múltiples criterios que incluyen:
                                </p>
                                <ul className="space-y-2 ml-4">
                                  <li>• <strong>Requisitos técnicos:</strong> Evaluación de habilidades técnicas específicas</li>
                                  <li>• <strong>Experiencia laboral:</strong> Años y relevancia de la experiencia</li>
                                  <li>• <strong>Formación académica:</strong> Estudios y certificaciones</li>
                                  <li>• <strong>Idiomas:</strong> Dominio de idiomas requeridos</li>
                                  <li>• <strong>Soft skills:</strong> Habilidades blandas y competencias</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="ponderacion" className="h-full overflow-y-auto p-4 m-0">
                          <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Sistema de Ponderación de Candidatos
                              </h4>
                              <div className="text-sm text-blue-800 space-y-3">
                                <p>
                                  Nuestro sistema de inteligencia artificial evalúa a los candidatos utilizando un modelo
                                  de ponderación que asigna diferentes pesos a cada criterio según su importancia para el
                                  puesto específico.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                                    <h5 className="font-semibold text-blue-900 mb-2">Criterios Principales (70%)</h5>
                                    <ul className="space-y-1 text-sm">
                                      <li>
                                        • <strong>Requisitos técnicos clave:</strong> 50%
                                      </li>
                                      <li>
                                        • <strong>Experiencia laboral:</strong> 20%
                                      </li>
                                    </ul>
                                  </div>

                                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                                    <h5 className="font-semibold text-blue-900 mb-2">Criterios Secundarios (30%)</h5>
                                    <ul className="space-y-1 text-sm">
                                      <li>
                                        • <strong>Formación académica:</strong> 10%
                                      </li>
                                      <li>
                                        • <strong>Idiomas y soft skills:</strong> 10%
                                      </li>
                                      <li>
                                        • <strong>Factores adicionales:</strong> 10%
                                      </li>
                                    </ul>
                                  </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                                  <h5 className="font-semibold text-amber-800 mb-2">Factores de Penalización</h5>
                                  <p className="text-sm text-amber-700">
                                    Se aplican penalizaciones cuando el candidato no cumple con requisitos excluyentes o
                                    carece de habilidades fundamentales para el puesto. Estas penalizaciones pueden
                                    reducir significativamente la puntuación final.
                                  </p>
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                                  <h5 className="font-semibold text-green-800 mb-2">Bonificaciones</h5>
                                  <p className="text-sm text-green-700">
                                    Los candidatos pueden recibir puntos adicionales por certificaciones relevantes,
                                    proyectos destacados, experiencia en tecnologías emergentes o habilidades que excedan
                                    los requisitos mínimos del puesto.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">Interpretación de Puntuaciones</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                                  <div className="text-2xl font-bold text-green-700 mb-1">75-100</div>
                                  <div className="text-sm font-medium text-green-800">Altamente Recomendado</div>
                                  <div className="text-xs text-green-600 mt-1">Cumple o supera expectativas</div>
                                </div>
                                <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 text-center">
                                  <div className="text-2xl font-bold text-amber-700 mb-1">50-74</div>
                                  <div className="text-sm font-medium text-amber-800">Parcialmente Adecuado</div>
                                  <div className="text-xs text-amber-600 mt-1">Requiere evaluación adicional</div>
                                </div>
                                <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center">
                                  <div className="text-2xl font-bold text-red-700 mb-1">0-49</div>
                                  <div className="text-sm font-medium text-red-800">No Recomendado</div>
                                  <div className="text-xs text-red-600 mt-1">No cumple requisitos mínimos</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="justificaciones" className="h-full overflow-y-auto p-4 m-0">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {iaCurrentResults.map((resultado, index) => {
                              const postulacion = resultado.postulacion;
                              const apellido = postulacion?.candidato?.apellido || "";
                              const isVerde = cumpleRequisitosExcluyentes(postulacion);
                              const cardBg = isVerde ? "bg-green-50 border-green-200" : "bg-white border-slate-200";
                              return (
                                <Card key={index} className={`overflow-hidden ${getScoreBorderColor(resultado.score)} ${cardBg}`}>
                                  <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                      <h3 className="text-lg font-semibold">{resultado.nombre} {apellido}</h3>
                                      <div className={`flex items-center gap-1 ${getScoreColor(resultado.score)}`}>
                                        {getScoreIcon(resultado.score)}
                                        <span className="font-medium">{resultado.score}%</span>
                                      </div>
                                    </div>
                                    {/* Barra de progreso */}
                                    <div className="mb-4">
                                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-500 ${getScoreBgColor(resultado.score)}`}
                                          style={{ width: `${resultado.score}%` }}
                                        />
                                      </div>
                                    </div>
                                    {/* Explicaciones */}
                                    <div className="space-y-2">
                                      {resultado.explicacion.map((exp: string, i: number) => (
                                        <div 
                                          key={i}
                                          className={`text-sm p-2 rounded-md ${
                                            exp.toLowerCase().includes('no cumple') 
                                              ? 'bg-red-50 text-red-700 border border-red-200'
                                              : 'bg-green-50 text-green-700 border border-green-200'
                                          }`}
                                        >
                                          {exp}
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </Sidebar>
  )
} 
 