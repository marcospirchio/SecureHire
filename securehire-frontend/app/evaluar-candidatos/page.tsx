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
  Search,
  Star
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

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

  // Filtros avanzados
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [minAge, setMinAge] = useState("")
  const [maxAge, setMaxAge] = useState("")
  const [gender, setGender] = useState("todos")
  const [requisitosFilter, setRequisitosFilter] = useState("todos")
  const [tempMinAge, setTempMinAge] = useState("")
  const [tempMaxAge, setTempMaxAge] = useState("")
  const [tempGender, setTempGender] = useState("todos")
  const [tempRequisitosFilter, setTempRequisitosFilter] = useState("todos")
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [favoriteCandidates, setFavoriteCandidates] = useState<any[]>([])
  const [originalCandidates, setOriginalCandidates] = useState<any[]>([])

  // Actualizar originalCandidates cuando cambia postulaciones
  useEffect(() => {
    if (!showOnlyFavorites) {
      setOriginalCandidates(postulaciones)
    }
  }, [postulaciones, showOnlyFavorites])

  // Lógica para favoritos
  const handleToggleFavorites = async () => {
    if (!selectedJobSearch) return;
    try {
      if (!showOnlyFavorites) {
        // Mostrar favoritos
        const response = await fetch(`http://localhost:8080/api/postulaciones/busqueda/${selectedJobSearch}/favoritos`, {
          credentials: "include",
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const postulacionesData = await response.json();
          // Mapear a formato de postulaciones con candidato
          const candidates = await Promise.all(
            (Array.isArray(postulacionesData) ? postulacionesData : []).map(async (p: any) => {
              try {
                const candidatoRes = await fetch(`http://localhost:8080/api/candidatos/${p.candidatoId}`, {
                  credentials: "include",
                  headers: { 'Accept': 'application/json' }
                });
                if (!candidatoRes.ok) return null;
                const candidato = await candidatoRes.json();
                return { ...p, candidato };
              } catch {
                return null;
              }
            })
          );
          const validCandidates = candidates.filter((c): c is any => c !== null);
          setFavoriteCandidates(validCandidates);
        }
      }
      setShowOnlyFavorites(!showOnlyFavorites);
    } catch (error) {
      // Silenciar error
    }
  };

  // Calcular edad desde fechaNacimiento
  function calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = fechaNac.getMonth();
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad;
  }

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
    console.log('=== INICIANDO FETCH DE POSTULACIONES ===');
    console.log('Busqueda seleccionada:', selectedJobSearch);
    
    fetch(`http://localhost:8080/api/postulaciones/busqueda/${selectedJobSearch}?estado=pendiente`, { credentials: "include" })
      .then(res => {
        console.log('Respuesta del fetch:', res.status, res.statusText);
        return res.json();
      })
      .then(async (data) => {
        console.log('=== DATOS CRUDOS DEL BACKEND ===');
        console.log('Datos recibidos:', data);
        console.log('Tipo de datos:', typeof data);
        console.log('Es array:', Array.isArray(data));
        console.log('Cantidad de postulaciones:', data.length);
        
        // Para cada postulacion, obtener datos del candidato
        const postulacionesConCandidato = await Promise.all(
          data.map(async (postulacion: any, index: number) => {
            console.log(`=== POSTULACIÓN ${index + 1} ===`);
            console.log('Postulación cruda:', postulacion);
            console.log('ID:', postulacion.id);
            console.log('CandidatoID:', postulacion.candidatoId);
            console.log('PuntajeGeneral:', postulacion.puntajeGeneral);
            console.log('MotivosIA:', postulacion.motivosIA);
            console.log('Score:', postulacion.score);
            console.log('HasBeenAnalyzed:', postulacion.hasBeenAnalyzed);
            
            try {
              const candidatoRes = await fetch(`http://localhost:8080/api/candidatos/${postulacion.candidatoId}`, { credentials: "include" })
              const candidato = await candidatoRes.json()
              console.log('Datos del candidato:', candidato);
              
              const postulacionCompleta = { ...postulacion, candidato };
              console.log('Postulación completa con candidato:', postulacionCompleta);
              
              return postulacionCompleta;
            } catch (error) {
              console.error('Error obteniendo candidato:', error);
              return { ...postulacion, candidato: { nombre: "Error", apellido: "" } }
            }
          })
        )
        
        console.log('=== POSTULACIONES FINALES ===');
        console.log('Postulaciones con candidatos:', postulacionesConCandidato);
        
        setPostulaciones(postulacionesConCandidato)
      })
      .catch((error) => {
        console.error('Error en fetch de postulaciones:', error);
        setPostulaciones([])
      })
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

  // Filtrar candidatos por término de búsqueda y filtros avanzados
  const baseCandidates = showOnlyFavorites ? favoriteCandidates : postulaciones;
  const filteredCandidates = baseCandidates.filter((postulacion) => {
    const nombre = postulacion.candidato?.nombre || ''
    const apellido = postulacion.candidato?.apellido || ''
    const fullName = `${nombre} ${apellido}`.toLowerCase()
    const nameMatch = fullName.includes(searchTerm.toLowerCase())
    // Edad
    const edad = calcularEdad(postulacion.candidato?.fechaNacimiento)
    const ageMatch = (!minAge || edad >= parseInt(minAge)) && (!maxAge || edad <= parseInt(maxAge))
    // Género
    const genero = (postulacion.candidato?.genero || '').toLowerCase()
    const genderMatch = gender === "todos" || genero === gender
    // Requisitos excluyentes
    let requisitosMatch = true
    if (requisitosFilter === "cumplen") {
      requisitosMatch = !(postulacion.requisitosExcluyentes && postulacion.requisitosExcluyentes.length > 0)
    } else if (requisitosFilter === "nocumplen") {
      requisitosMatch = !!(postulacion.requisitosExcluyentes && postulacion.requisitosExcluyentes.length > 0)
    }
    return nameMatch && ageMatch && genderMatch && requisitosMatch
  })

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
    console.log('🚀 === FUNCIÓN COMPARAR EJECUTÁNDOSE ===');
    console.log('Candidatos seleccionados:', selectedCandidates);
    console.log('Cantidad de candidatos:', selectedCandidates.length);
    
    setIsComparing(true)
    setIaLoading(true)
    setIaResult(null)
    setComparisonResults(null)
    try {
      console.log('=== INICIANDO COMPARACIÓN ===');
      console.log('Candidatos seleccionados:', selectedCandidates);

      // Siempre hacer la comparación real, pero preservar datos existentes
      console.log('Iniciando comparación real con preservación de datos existentes...');
      
      // Siempre mostrar animación de cargando al menos 2 segundos
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      await sleep(2000);

      // Verificar si el candidato ya tiene todos los atributos necesarios
      const candidatosCompletos = selectedCandidates.every(postulacionId => {
        const postulacion = postulaciones.find(p => p.id === postulacionId);
        return postulacion && 
          postulacion.puntajeGeneral && 
          postulacion.puntajeRequisitosClave !== null && 
          postulacion.puntajeExperienciaLaboral !== null && 
          postulacion.puntajeFormacionAcademica !== null && 
          postulacion.puntajeIdiomasYSoftSkills !== null && 
          postulacion.puntajeOtros !== null &&
          postulacion.motivosPositivos &&
          postulacion.motivosNegativos &&
          postulacion.aniosExperiencia !== null;
      });
      
      console.log(`Candidatos con análisis completo: ${candidatosCompletos ? 'SÍ' : 'NO'}`);

      // 2. Verificar si todos los seleccionados tienen resumenCv
      for (const postulacionId of selectedCandidates) {
        const postulacion = postulaciones.find(p => p.id === postulacionId);
        if (!postulacion) throw new Error("No se encontró la postulación seleccionada");
        if (!postulacion.resumenCv) {
          console.log(`Generando resumen CV para postulación ${postulacionId}`);
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
          console.log(`Resumen CV generado para postulación ${postulacionId}`);
        }
      }

      // 3. Ejecutar la comparación IA
      console.log('Ejecutando comparación IA...');
      const response = await fetch("http://localhost:8080/api/ia/comparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postulacionIds: selectedCandidates })
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en respuesta del endpoint:', response.status, errorText);
        throw new Error(`Error al comparar candidatos: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Respuesta del endpoint de comparación:', data);

      // Verificar estructura de datos
      if (!data || !data.resultados) {
        console.error('Estructura de datos inesperada:', data);
        throw new Error('Estructura de datos inesperada en la respuesta');
      }

      // Ordenar por puntaje descendente
      const resultados = (data.resultados || []).sort((a: any, b: any) => b.score - a.score)
      console.log('Resultados ordenados:', resultados);

      setIaResults(resultados)
      setComparisonResults({ candidates: resultados }) // Para compatibilidad con nuevo diseño

      // 4. Actualizar estado de postulaciones para marcarlas como analizadas y guardar puntajes/motivos
      setPostulaciones(prevPostulaciones => {
        const updated = prevPostulaciones.map(p => {
          const postulationName = `${p.candidato?.nombre || ''} ${p.candidato?.apellido || ''}`.trim().toLowerCase();
          const resultado = resultados.find((res: any) => {
            const resultName = (res.nombre || '').trim().toLowerCase();
            return postulationName === resultName || postulationName.includes(resultName) || resultName.includes(postulationName);
          });
          if (resultado) {
            console.log(`🔄 Actualizando postulación ${p.id} para ${postulationName}`);
            console.log(`  - Datos existentes: puntajeGeneral=${p.puntajeGeneral}`);
            console.log(`  - Nuevos datos: puntajeGeneral=${resultado.puntajeGeneral}`);
            
            // Preservar datos existentes y solo agregar los que faltan
            return {
              ...p,
              hasBeenAnalyzed: true,
              // Solo actualizar puntajeGeneral si no existe
              puntajeGeneral: p.puntajeGeneral || resultado.puntajeGeneral,
              // Solo actualizar puntajes específicos si no existen
              puntajeRequisitosClave: p.puntajeRequisitosClave || resultado.puntajeRequisitosClave,
              puntajeExperienciaLaboral: p.puntajeExperienciaLaboral || resultado.puntajeExperienciaLaboral,
              puntajeFormacionAcademica: p.puntajeFormacionAcademica || resultado.puntajeFormacionAcademica,
              puntajeIdiomasYSoftSkills: p.puntajeIdiomasYSoftSkills || resultado.puntajeIdiomasYSoftSkills,
              puntajeOtros: p.puntajeOtros || resultado.puntajeOtros,
              // Solo actualizar motivos si no existen
              motivosPositivos: p.motivosPositivos || resultado.motivosPositivos,
              motivosNegativos: p.motivosNegativos || resultado.motivosNegativos,
              
              // Solo actualizar años de experiencia si no existe
              aniosExperiencia: p.aniosExperiencia || resultado.aniosExperiencia,
              
              // Siempre actualizar explicaciones (se sobrescriben)
              explicacionesPorCriterio: resultado.explicacionesPorCriterio ? 
                Object.entries(resultado.explicacionesPorCriterio).map(([key, value]) => value) : null,
              
              // Mantener compatibilidad con motivosIA (solo si no existe)
              motivosIA: p.motivosIA || (() => {
                const motivosCombinados = [];
                if (resultado.motivosPositivos) motivosCombinados.push(...resultado.motivosPositivos);
                if (resultado.motivosNegativos) motivosCombinados.push(...resultado.motivosNegativos);
                return motivosCombinados.length > 0 ? motivosCombinados : null;
              })()
            };
          } else if (selectedCandidates.includes(p.id)) {
            return {
              ...p,
              hasBeenAnalyzed: true,
              score: 0
            };
          }
          return p;
        });
        return updated;
      })

    } catch (e: any) {
      console.error('Error en comparación:', e);
      setIaResult(`Error al comparar candidatos: ${e.message}`)
    } finally {
      setIsComparing(false)
      setIaLoading(false)
    }
  }

  // Estadísticas de candidatos
  const analyzedCandidates = postulaciones.filter((c) => c.hasBeenAnalyzed)
  const highScoreCandidates = analyzedCandidates.filter((c) => (c.puntajeGeneral || c.score || 0) >= 75)
    .length;
  const averageScore = analyzedCandidates.length > 0
    ? Math.round(analyzedCandidates.reduce((sum, c) => sum + (c.puntajeGeneral || c.score || 0), 0) / analyzedCandidates.length)
    : 0;

  // Reinicio visual al salir de la página
  useEffect(() => {
    return () => {
      setIaResults([])
      setComparisonResults(null)
      setPostulaciones((prev) => prev.map(p => ({ ...p, hasBeenAnalyzed: false, score: undefined })))
    }
  }, [])

  // Debug: Monitorear cambios en postulaciones
  useEffect(() => {
    const analyzedCount = postulaciones.filter(p => p.hasBeenAnalyzed).length;
    if (analyzedCount > 0) {
      console.log(`=== ESTADO ACTUALIZADO ===`);
      console.log(`Total postulaciones: ${postulaciones.length}`);
      console.log(`Postulaciones analizadas: ${analyzedCount}`);
      console.log('Postulaciones con análisis:', postulaciones.filter(p => p.hasBeenAnalyzed).map(p => ({
        id: p.id,
        nombre: `${p.candidato?.nombre} ${p.candidato?.apellido}`,
        puntajeGeneral: p.puntajeGeneral,
        score: p.score,
        hasBeenAnalyzed: p.hasBeenAnalyzed,
        motivosIA: p.motivosIA
      })));
      console.log(`=== FIN ESTADO ===`);
    }
  }, [postulaciones])

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
                        {busquedas
                          .slice() // Copia para no mutar el estado
                          .sort((a, b) => getConteoForBusqueda(b.id) - getConteoForBusqueda(a.id))
                          .map((job) => (
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
                      <span className="text-2xl font-bold text-blue-400">{highScoreCandidates}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Seleccionados</span>
                      <span className="text-2xl font-bold">{selectedCandidates.length}</span>
                    </div>
                    {averageScore > 0 && (
                      <div className="pt-2 border-t border-gray-700">
                        <div className="text-sm text-gray-300 mb-1">Puntuación promedio</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${averageScore}%` }}></div>
                          </div>
                          <span className="text-lg font-bold text-blue-400">{averageScore}%</span>
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
                        <Button
                          variant="outline"
                          size="lg"
                          className="rounded-lg border-gray-300"
                          onClick={() => setShowFilterModal(true)}
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Filtros
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className={`h-10 w-10 flex-shrink-0 ml-2 border-gray-300 ${showOnlyFavorites ? 'text-yellow-400' : 'text-gray-500'}`}
                          onClick={handleToggleFavorites}
                          title={showOnlyFavorites ? "Mostrar todos" : "Mostrar favoritos"}
                        >
                          <Star className="h-5 w-5" fill={showOnlyFavorites ? "currentColor" : "none"} />
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
                {/* Modal de filtros avanzados */}
                <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-gray-900">
                        Filtrar Candidatos
                      </DialogTitle>
                      <DialogDescription className="text-sm text-gray-500">
                        Selecciona los criterios para filtrar los candidatos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rango de edad</label>
                        <div className="flex gap-2">
                          <Input type="number" placeholder="Mín" className="w-24" value={tempMinAge} onChange={e => setTempMinAge(e.target.value)} />
                          <Input type="number" placeholder="Máx" className="w-24" value={tempMaxAge} onChange={e => setTempMaxAge(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Género</label>
                        <Select value={tempGender} onValueChange={setTempGender}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar género" />
                          </SelectTrigger>
                          <SelectContent>
                           <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="femenino">Femenino</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Requisitos excluyentes</label>
                        <Select value={tempRequisitosFilter} onValueChange={setTempRequisitosFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filtrar por requisitos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="cumplen">Solo los que cumplen</SelectItem>
                            <SelectItem value="nocumplen">Solo los que NO cumplen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setTempMinAge("")
                          setTempMaxAge("")
                          setTempGender("todos")
                          setTempRequisitosFilter("todos")
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Limpiar filtros
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowFilterModal(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={() => {
                          setMinAge(tempMinAge)
                          setMaxAge(tempMaxAge)
                          setGender(tempGender)
                          setRequisitosFilter(tempRequisitosFilter)
                          setShowFilterModal(false)
                        }}>
                          Aplicar filtros
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                        currentCandidates.map((postulacion: any) => {
                          const candidateName = `${postulacion.candidato?.nombre || ''} ${postulacion.candidato?.apellido || ''}`;
                          const hasBeenAnalyzed = postulacion.hasBeenAnalyzed || false;
                          const score = postulacion.puntajeGeneral || 0;
                          const matchesRequirements = cumpleRequisitosExcluyentes(postulacion);
                          const perfilDetectado = postulacion.perfilDetectadoIA || "Perfil no detectado.";

                          console.log(`Card ${candidateName}: hasBeenAnalyzed=${hasBeenAnalyzed}, score=${score}, postulacionId=${postulacion.id}, matchesRequirements=${matchesRequirements}`);

                          try {
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
                                  {/* Mostrar barra y requisitos SOLO si fue analizado */}
                                  {hasBeenAnalyzed ? (
                                    <>
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center">
                                          <ImagenPerfil postulacionId={postulacion.id} nombre={postulacion.candidato?.nombre || ''} apellido={postulacion.candidato?.apellido || ''} size={32} />
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-900 text-base">{candidateName}</h4>
                                          <p className="text-xs text-gray-500 truncate">{perfilDetectado}</p>
                                        </div>
                                      </div>
                                      {/* Barra de compatibilidad IA */}
                                      <div className="mb-2">
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                          <span>Compatibilidad</span>
                                          <span className={`font-semibold ${getScoreColor(score)}`}>{score}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full transition-all duration-500 ${score < 50 ? "bg-red-500" : score < 75 ? "bg-amber-500" : "bg-green-500"}`}
                                            style={{ width: `${score}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                      {/* Estado de requisitos excluyentes */}
                                      <div className="flex items-center gap-2 mt-2">
                                        {matchesRequirements ? (
                                          <Badge className="bg-green-100 text-green-800 border border-gray-300 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 hover:bg-green-100">
                                            <CheckCircle2 className="h-4 w-4" /> Requisitos Excluyentes
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-red-100 text-red-800 border border-gray-300 flex items-center gap-1 text-xs font-semibold px-2 py-0.5 hover:bg-red-100">
                                            <XCircle className="h-4 w-4" /> Requisitos Excluyentes
                                          </Badge>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    // Card original antes de análisis
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
                          } catch (error) {
                            console.error('Error renderizando card:', error);
                            return (
                              <div key={postulacion.id} className="p-3 border border-red-200 bg-red-50 rounded-xl">
                                <p className="text-red-600 text-sm">Error al mostrar candidato</p>
                              </div>
                            );
                          }
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
                className="flex justify-center gap-4"
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
                            {/* Usar directamente las postulaciones seleccionadas */}
                            {postulaciones
                              .filter(p => selectedCandidates.includes(p.id))
                              .sort((a, b) => {
                                const puntajeA = a.puntajeGeneral || a.score || 0;
                                const puntajeB = b.puntajeGeneral || b.score || 0;
                                return puntajeB - puntajeA; // Orden descendente (mayor a menor)
                              })
                              .map((postulacion: any, index: number) => {
                              console.log(`=== RENDERIZANDO GENERAL PARA ${postulacion.candidato?.nombre} ===`);
                              console.log('Postulación completa:', postulacion);
                              console.log('PuntajeGeneral:', postulacion.puntajeGeneral);
                              console.log('MotivosIA:', postulacion.motivosIA);
                              console.log('Score:', postulacion.score);
                              
                              // Obtener puntaje real de la postulación usando puntajeGeneral
                              const puntajeReal = postulacion.puntajeGeneral || 0;
                              
                              console.log(`Puntaje real calculado: ${puntajeReal}`);
                              
                              const candidateName = `${postulacion.candidato?.nombre || ''} ${postulacion.candidato?.apellido || ''}`.trim();

                              return (
                              <motion.div
                                key={`general-${postulacion.id}`}
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
                                    <h4 className="font-semibold text-xl text-gray-900">{candidateName}</h4>
                                    {index === 0 && (
                                      <Badge className="bg-blue-600 text-white border-0 text-xs">
                                        <Award className="h-3 w-3 mr-1" />
                                        Mejor candidato
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <TrendingUp className="h-4 w-4 text-gray-400" />
                                    <span className={`font-semibold ${getScoreColor(puntajeReal)}`}>{puntajeReal}% de compatibilidad</span>
                                  </div>
                                  
                                  {/* Barra de puntuación general */}
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                      <span>Puntuación general</span>
                                      <span className="font-semibold text-gray-900">{puntajeReal}/100</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full transition-all duration-500 ${puntajeReal < 50 ? "bg-red-500" : puntajeReal < 75 ? "bg-amber-500" : "bg-green-500"}`}
                                        style={{ width: `${puntajeReal}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )})}
                          </div>
                        </TabsContent>

                        <TabsContent value="criteria" className="h-full overflow-y-auto p-4 m-0">
                          <div className="space-y-6">
                            {/* Usar directamente las postulaciones seleccionadas */}
                            {postulaciones
                              .filter(p => selectedCandidates.includes(p.id))
                              .sort((a, b) => {
                                const puntajeA = a.puntajeGeneral || a.score || 0;
                                const puntajeB = b.puntajeGeneral || b.score || 0;
                                return puntajeB - puntajeA; // Orden descendente (mayor a menor)
                              })
                              .map((postulacion: any, index: number) => {
                              console.log(`=== RENDERIZANDO CRITERIA PARA ${postulacion.candidato?.nombre} ===`);
                              console.log('Postulación completa:', postulacion);
                              console.log('MotivosIA completo:', postulacion.motivosIA);
                              console.log('Tipo de motivosIA:', typeof postulacion.motivosIA);
                              console.log('Es null/undefined:', postulacion.motivosIA === null || postulacion.motivosIA === undefined);
                              
                              // Extraer datos directamente de la postulación
                              const puntajeRequisitos = postulacion.puntajeRequisitosClave ?? 0;
                              const puntajeExperiencia = postulacion.puntajeExperienciaLaboral ?? 0;
                              const puntajeFormacion = postulacion.puntajeFormacionAcademica ?? 0;
                              const puntajeIdiomas = postulacion.puntajeIdiomasYSoftSkills ?? 0;
                              const puntajeOtros = postulacion.puntajeOtros ?? 0;

                              console.log(`=== PUNTAJES EXTRAÍDOS ===`);
                              console.log(`- Requisitos: ${puntajeRequisitos}/50 (${(puntajeRequisitos / 50) * 100}%)`);
                              console.log(`- Experiencia: ${puntajeExperiencia}/20 (${(puntajeExperiencia / 20) * 100}%)`);
                              console.log(`- Formación: ${puntajeFormacion}/15 (${(puntajeFormacion / 15) * 100}%)`);
                              console.log(`- Idiomas: ${puntajeIdiomas}/10 (${(puntajeIdiomas / 10) * 100}%)`);
                              console.log(`- Otros: ${puntajeOtros}/10 (${(puntajeOtros / 10) * 100}%)`);

                              const candidateName = `${postulacion.candidato?.nombre || ''} ${postulacion.candidato?.apellido || ''}`.trim();
                              const score = postulacion.puntajeGeneral ?? 0;

                              return (
                                <div key={`criteria-${postulacion.id}`} className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`h-8 w-8 rounded-xl flex items-center justify-center ${getScoreBgColor(score)}`}
                                    >
                                      {getScoreIcon(score)}
                                    </div>
                                    <h4 className="font-semibold text-lg text-gray-900">{candidateName}</h4>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-xl p-3">
                                      <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-900">Requisitos técnicos</span>
                                        <span className="font-bold text-gray-900">
                                          {puntajeRequisitos}/45
                                        </span>
                                      </div>
                                      <Progress
                                        value={(puntajeRequisitos / 50) * 100}
                                        className="h-2"
                                      />
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-3">
                                      <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-900">Experiencia laboral</span>
                                        <span className="font-bold text-gray-900">
                                          {puntajeExperiencia}/20
                                        </span>
                                      </div>
                                      <Progress
                                        value={(puntajeExperiencia / 20) * 100}
                                        className="h-2"
                                      />
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-3">
                                      <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-900">Formación académica</span>
                                        <span className="font-bold text-gray-900">
                                          {puntajeFormacion}/15
                                        </span>
                                      </div>
                                      <Progress
                                        value={(puntajeFormacion / 15) * 100}
                                        className="h-2"
                                      />
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-3">
                                      <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-900">Idiomas y soft skills</span>
                                        <span className="font-bold text-gray-900">
                                          {puntajeIdiomas}/10
                                        </span>
                                      </div>
                                      <Progress
                                        value={(puntajeIdiomas / 10) * 100}
                                        className="h-2"
                                      />
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-3">
                                      <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-900">Otros criterios</span>
                                        <span className="font-bold text-gray-900">
                                          {puntajeOtros}/10
                                        </span>
                                      </div>
                                      <Progress
                                        value={(puntajeOtros / 10) * 100}
                                        className="h-2"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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
                                    <h5 className="font-semibold text-blue-900 mb-2">Criterios Principales (65%)</h5>
                                    <ul className="space-y-1 text-sm">
                                      <li>
                                        • <strong>Requisitos técnicos clave:</strong> 45%
                                      </li>
                                      <li>
                                        • <strong>Experiencia laboral:</strong> 20%
                                      </li>
                                    </ul>
                                  </div>

                                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                                    <h5 className="font-semibold text-blue-900 mb-2">Criterios Secundarios (35%)</h5>
                                    <ul className="space-y-1 text-sm">
                                      <li>
                                        • <strong>Formación académica:</strong> 15%
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
                          <div className="space-y-4">
                            <div className="text-center mb-4">
                              <h4 className="text-xl font-semibold text-gray-900 mb-1">Justificaciones del Ranking</h4>
                              <p className="text-gray-500">
                                Criterios evaluados para determinar el orden de los candidatos
                              </p>
                            </div>

                            {/* Usar directamente las postulaciones seleccionadas ordenadas por puntaje */}
                            {postulaciones
                              .filter(p => selectedCandidates.includes(p.id))
                              .sort((a, b) => {
                                const puntajeA = a.puntajeGeneral || a.score || 0;
                                const puntajeB = b.puntajeGeneral || b.score || 0;
                                return puntajeB - puntajeA; // Orden descendente (mayor a menor)
                              })
                              .map((postulacion: any, index: number) => {
                              const candidateName = `${postulacion.candidato?.nombre || ''} ${postulacion.candidato?.apellido || ''}`.trim();

                              return (
                                <div
                                  key={`justificacion-${postulacion.id}`}
                                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                                >
                                  <div className="bg-[#007fff] px-3 py-2 border-b border-blue-300">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`
                                          h-8 w-8 rounded-xl flex items-center justify-center font-bold text-white
                                          ${
                                            index === 0
                                              ? "bg-white/20"
                                              : index === 1
                                                ? "bg-white/15"
                                                : index === 2
                                                  ? "bg-white/10"
                                                  : "bg-white/5"
                                          }
                                        `}
                                      >
                                        {index + 1}
                                      </div>
                                      <div>
                                        <h5 className="font-semibold text-white">{candidateName}</h5>
                                        <p className="text-sm text-blue-100">Puntuación: {postulacion?.puntajeGeneral || 0}%</p>
                                      </div>
                                      {index === 0 && (
                                        <Badge className="ml-auto bg-white/20 text-white border-white/30 text-xs">
                                          <Award className="h-3 w-3 mr-1" />
                                          Mejor candidato
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="p-3">
                                    <div className="space-y-3">
                                      {/* Campos excluyentes */}
                                      <div>
                                        <h6 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
                                          <div className="h-2 w-2 bg-[#007fff] rounded-full"></div>
                                          Campos excluyentes
                                        </h6>
                                        <div className="space-y-1 ml-4">
                                          {busquedaData?.camposAdicionales?.filter((campo: any) => campo.valoresExcluyentes && campo.valoresExcluyentes.length > 0).map((campo: any, i: number) => {
                                            const respuesta = postulacion?.respuestas?.find((r: any) => r.campo === campo.nombre);
                                            let cumple = false;
                                            if (respuesta) {
                                              if (campo.tipo === "checkbox") {
                                                const respuestasCandidato = Array.isArray(respuesta.respuesta) ? respuesta.respuesta : [respuesta.respuesta];
                                                const valoresExcluyentes = campo.valoresExcluyentes || [];
                                                cumple = valoresExcluyentes.every((valor: string) => respuestasCandidato.includes(valor));
                                              } else {
                                                const valoresExcluyentes = campo.valoresExcluyentes || [];
                                                cumple = valoresExcluyentes.includes(respuesta.respuesta);
                                              }
                                            }
                                            return (
                                              <div key={i} className="flex items-start gap-2">
                                                {cumple ? (
                                                  <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                  <XCircle className="h-3 w-3 text-red-500 flex-shrink-0 mt-0.5" />
                                                )}
                                                <span className="text-sm text-gray-700">
                                                  {cumple ? 'Cumple' : 'No cumple'} con campo excluyente: {campo.nombre}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>

                                      {/* Requisitos técnicos */}
                                      <div>
                                        <h6 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
                                          <div className="h-2 w-2 bg-[#007fff] rounded-full"></div>
                                          Requisitos técnicos ({postulacion?.puntajeRequisitosClave || 0}/45)
                                        </h6>
                                        <div className="space-y-1 ml-4">
                                          {/* Mostrar explicación de requisitos técnicos */}
                                          {postulacion?.explicacionesPorCriterio && postulacion.explicacionesPorCriterio[0] && (
                                            <div className="flex items-start gap-2 mt-1">
                                              <span className="text-[#007fff] text-xs font-bold">-</span>
                                              <span className="text-sm text-gray-600 italic">
                                                {postulacion.explicacionesPorCriterio[0]}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Experiencia laboral */}
                                      <div>
                                        <h6 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
                                          <div className="h-2 w-2 bg-[#007fff] rounded-full"></div>
                                          Experiencia laboral ({postulacion?.puntajeExperienciaLaboral || 0}/20)
                                        </h6>
                                        <div className="space-y-1 ml-4">
                                          {/* Mostrar explicación de experiencia laboral */}
                                          {postulacion?.explicacionesPorCriterio && postulacion.explicacionesPorCriterio[1] && (
                                            <div className="flex items-start gap-2 mt-1">
                                              <span className="text-[#007fff] text-xs font-bold ">-</span>
                                              <span className="text-sm text-gray-600 italic">
                                                {postulacion.explicacionesPorCriterio[1]}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Formación académica */}
                                      <div>
                                        <h6 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
                                          <div className="h-2 w-2 bg-[#007fff] rounded-full"></div>
                                          Formación académica ({postulacion?.puntajeFormacionAcademica || 0}/15)
                                        </h6>
                                        <div className="space-y-1 ml-4">
                                          {/* Mostrar explicación de formación académica */}
                                          {postulacion?.explicacionesPorCriterio && postulacion.explicacionesPorCriterio[2] && (
                                            <div className="flex items-start gap-2 mt-1">
                                              <span className="text-[#007fff] text-xs font-bold ">-</span>
                                              <span className="text-sm text-gray-600 italic">
                                                {postulacion.explicacionesPorCriterio[2]}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Idiomas y soft skills */}
                                      <div>
                                        <h6 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
                                          <div className="h-2 w-2 bg-[#007fff] rounded-full"></div>
                                          Idiomas y soft skills ({postulacion?.puntajeIdiomasYSoftSkills || 0}/10)
                                        </h6>
                                        <div className="space-y-1 ml-4">
                                          {/* Mostrar explicación de idiomas y soft skills */}
                                          {postulacion?.explicacionesPorCriterio && postulacion.explicacionesPorCriterio[3] && (
                                            <div className="flex items-start gap-2 mt-1">
                                              <span className="text-[#007fff] text-xs font-bold ">-</span>
                                              <span className="text-sm text-gray-600 italic">
                                                {postulacion.explicacionesPorCriterio[3]}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Otros aspectos */}
                                      <div>
                                        <h6 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
                                          <div className="h-2 w-2 bg-[#007fff] rounded-full"></div>
                                          Otros aspectos ({postulacion?.puntajeOtros || 0}/10)
                                        </h6>
                                        <div className="space-y-1 ml-4">
                                          {/* Mostrar explicación de otros aspectos */}
                                          {postulacion?.explicacionesPorCriterio && postulacion.explicacionesPorCriterio[4] && (
                                            <div className="flex items-start gap-2 mt-1">
                                              <span className="text-[#007fff] text-xs font-bold ">-</span>
                                              <span className="text-sm text-gray-600 italic">
                                                {postulacion.explicacionesPorCriterio[4]}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
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
 