"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Users, CheckCircle2, XCircle, AlertTriangle, BarChart3, Sparkles, Brain, RefreshCw, User, ChevronLeft, ChevronRight, Briefcase, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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

  // Paginación de candidatos
  const indexOfLastCandidate = currentPage * candidatesPerPage
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage
  const currentCandidates = postulaciones.slice(indexOfFirstCandidate, indexOfLastCandidate)
  const totalPages = Math.ceil(postulaciones.length / candidatesPerPage)

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
    if (score < 50) return "text-red-500"
    if (score < 75) return "text-amber-500"
    return "text-green-500"
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
      const resultados = data.resultados || []
      setIaResults(resultados)

      // 3. Actualizar estado de postulaciones para marcarlas como analizadas
      setPostulaciones(prevPostulaciones =>
        prevPostulaciones.map(p => {
            const resultado = resultados.find((res: any) => res.nombre.trim().toLowerCase() === p.candidato?.nombre?.trim().toLowerCase());
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

  return (
    <Sidebar>
      <DashboardLayout>
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold flex items-center">
                    Comparar Candidatos
                    <Badge className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                      <Sparkles className="h-3 w-3 mr-1" />
                      IA
                    </Badge>
                  </h1>
                  <p className="text-sm text-slate-500">Análisis comparativo con inteligencia artificial</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            {/* Instrucciones */}
            <Card className="mb-6 overflow-hidden border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-[2px]"></div>
                    <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-slate-800 flex items-center gap-2">
                      Análisis inteligente
                      <Badge
                        variant="outline"
                        className="bg-indigo-50 text-indigo-700 text-[10px] font-normal py-0 h-4 border-indigo-200"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        IA
                      </Badge>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Seleccione candidatos para comparar sus perfiles con precisión mediante nuestro sistema de
                      inteligencia artificial.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selector de búsqueda */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Seleccionar búsqueda</h3>
              <Select
                value={selectedJobSearch}
                onValueChange={(value) => {
                  setSelectedJobSearch(value)
                  setCurrentPage(1)
                  setSelectedCandidates([])
                }}
              >
                <SelectTrigger className="w-full bg-white border-slate-200">
                  <SelectValue placeholder="Selecciona una búsqueda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Búsquedas activas</SelectLabel>
                    {busquedas.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            {getJobIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{job.titulo || job.title}</div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{getConteoForBusqueda(job.id)} candidatos</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Lista de candidatos */}
            {selectedJobSearch && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-medium">Candidatos disponibles</h3>
                    {postulaciones.length > 0 && (
                      <p className="text-sm text-slate-500">
                        Mostrando {indexOfFirstCandidate + 1}-{Math.min(indexOfLastCandidate, postulaciones.length)} de {postulaciones.length} candidatos
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white">
                      {selectedCandidates.length} seleccionados
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCandidates([])}
                      disabled={selectedCandidates.length === 0}
                    >
                      Limpiar selección
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentCandidates.map((postulacion) => {
                      const hasBeenAnalyzed = postulacion.hasBeenAnalyzed || false;
                      const score = postulacion.score || 0;
                      const matchesRequirements = cumpleRequisitosExcluyentes(postulacion);
                      const candidateName = `${postulacion.candidato?.nombre || ''} ${postulacion.candidato?.apellido || ''}`;
                      const perfilDetectado = postulacion.perfilDetectadoIA || "Perfil no detectado.";

                      if (hasBeenAnalyzed) {
                        // Card para candidato YA ANALIZADO
                        return (
                          <div
                            key={postulacion.id}
                            className={`
                              relative rounded-lg border overflow-hidden transition-all cursor-pointer hover:shadow-sm
                              ${matchesRequirements ? "bg-green-50/50 border-green-200" : "bg-white border-slate-200"}
                              ${selectedCandidates.includes(postulacion.id) ? "ring-2 ring-indigo-500 ring-offset-2" : ""}
                            `}
                            onClick={() => toggleCandidateSelection(postulacion.id)}
                          >
                            <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedCandidates.includes(postulacion.id)}
                                onCheckedChange={() => toggleCandidateSelection(postulacion.id)}
                                className={`h-5 w-5 ${selectedCandidates.includes(postulacion.id) ? "bg-indigo-600 text-white" : "border-slate-300"}`}
                              />
                            </div>
                            <div className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <ImagenPerfil 
                                  postulacionId={postulacion.id} 
                                  nombre={postulacion.candidato?.nombre || ''} 
                                  apellido={postulacion.candidato?.apellido || ''}
                                  size={40}
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-slate-900 truncate">{candidateName}</h4>
                                  <p className="text-sm text-slate-500 truncate">{perfilDetectado}</p>
                                </div>
                              </div>

                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                  <span>Compatibilidad</span>
                                  <span className={`font-medium ${
                                    score >= 75 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600"
                                  }`}>
                                    {score}%
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      score < 50 ? "bg-red-500" : score < 75 ? "bg-amber-500" : "bg-green-500"
                                    }`}
                                    style={{ width: `${score}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div className="flex items-center justify-end text-xs">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      {matchesRequirements ? (
                                        <Badge className="bg-green-100 text-green-800 border-0 flex items-center gap-1 cursor-default hover:bg-green-100">
                                          <CheckCircle2 className="h-3 w-3" /> Requisitos
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-red-100 text-red-800 border-0 flex items-center gap-1 cursor-default hover:bg-red-100">
                                          <XCircle className="h-3 w-3" /> Requisitos
                                        </Badge>
                                      )}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{matchesRequirements ? 'El candidato cumple con todos los requisitos excluyentes.' : 'El candidato NO cumple con todos los requisitos excluyentes.'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Card para candidato SIN ANALIZAR
                        return (
                          <div
                            key={postulacion.id}
                            className={`
                              relative rounded-lg border overflow-hidden transition-all cursor-pointer hover:shadow-sm
                              ${matchesRequirements ? "bg-green-50/30 border-green-100" : "bg-white border-slate-200"}
                              ${selectedCandidates.includes(postulacion.id) ? "ring-2 ring-indigo-500 ring-offset-2" : ""}
                            `}
                            onClick={() => toggleCandidateSelection(postulacion.id)}
                          >
                            <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedCandidates.includes(postulacion.id)}
                                onCheckedChange={() => toggleCandidateSelection(postulacion.id)}
                                className={`h-5 w-5 ${selectedCandidates.includes(postulacion.id) ? "bg-indigo-600 text-white" : "border-slate-300"}`}
                              />
                            </div>
                            <div className="p-4 flex flex-col justify-between h-full">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <ImagenPerfil 
                                    postulacionId={postulacion.id} 
                                    nombre={postulacion.candidato?.nombre || ''} 
                                    apellido={postulacion.candidato?.apellido || ''}
                                    size={40}
                                  />
                                  <h4 className="font-medium text-slate-900 truncate">{candidateName}</h4>
                                </div>
                              </div>
                              <div className="mt-3 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                  <Brain className="h-4 w-4" />
                                  <span>Sin analizar</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center mt-6 gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <Button
                          key={index}
                          variant={currentPage === index + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => paginate(index + 1)}
                          className={`h-8 w-8 p-0 ${currentPage === index + 1 ? "bg-indigo-600" : ""}`}
                        >
                          {index + 1}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botón de comparar */}
            {selectedCandidates.length > 0 && (
              <div className="flex justify-center mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md"
                  onClick={compareSelectedCandidates}
                  disabled={isComparing}
                >
                  {isComparing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Comparando candidatos...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Comparar {selectedCandidates.length} candidatos con IA
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Resultados de la comparación IA */}
            {iaResultsFiltered.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  Resultados de la comparación IA
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600">
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                </h2>
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
                {/* Paginación IA */}
                {iaTotalPages > 1 && (
                  <div className="flex items-center justify-center mt-6 gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIaCurrentPage(iaCurrentPage - 1)}
                      disabled={iaCurrentPage === 1}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: iaTotalPages }).map((_, index) => (
                      <Button
                        key={index}
                        variant={iaCurrentPage === index + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIaCurrentPage(index + 1)}
                        className={`h-8 w-8 p-0 ${iaCurrentPage === index + 1 ? "bg-indigo-600" : ""}`}
                      >
                        {index + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIaCurrentPage(iaCurrentPage + 1)}
                      disabled={iaCurrentPage === iaTotalPages}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </DashboardLayout>
    </Sidebar>
  )
} 
