"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, CheckCircle, XCircle, AlertTriangle, User, BarChart3, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PuntajesDetalle {
  requisitosClave: number
  experienciaLaboral: number
  formacionAcademica: number
  idiomasYSoftSkills: number
  otros: number
}

interface AIResumeResult {
  perfilDetectado: string
  resumen: string
  puntajeGeneral: number
  motivos: string[]
  puntajesDetalle: PuntajesDetalle
}

interface AIResumeModalProps {
  isOpen: boolean
  onClose: () => void
  candidateName: string
  jobTitle?: string
  result?: AIResumeResult
  isLoading?: boolean
}

export default function AIResumeModalV4({
  isOpen,
  onClose,
  candidateName,
  jobTitle = "Desarrollador Frontend React SSR",
  result,
  isLoading = false,
}: AIResumeModalProps) {
  const [score, setScore] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [animationComplete, setAnimationComplete] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [activeTab, setActiveTab] = useState("resumen")
  const fullText = result?.resumen || ""
  const scoreRef = useRef<NodeJS.Timeout | null>(null)
  const typingRef = useRef<NodeJS.Timeout | null>(null)

  // Datos de ejemplo para cuando no hay puntajesDetalle
  const defaultPuntajes: PuntajesDetalle = {
    requisitosClave: 50,
    experienciaLaboral: 0,
    formacionAcademica: 10,
    idiomasYSoftSkills: 10,
    otros: 10,
  }

  // Usar los puntajes del resultado o los predeterminados
  const puntajes = result?.puntajesDetalle || defaultPuntajes
  const puntajeGeneral = result?.puntajeGeneral ?? 0
  const motivos = result?.motivos || []

  // Animar la barra de progreso
  useEffect(() => {
    if (isOpen && result && !isLoading) {
      // Reiniciar valores
      setScore(0)
      setShowContent(false)
      setTypingText("")
      setAnimationComplete(false)
      setShowConfetti(false)

      // Animar la barra de progreso
      if (scoreRef.current) clearTimeout(scoreRef.current)

      const targetScore = result.puntajeGeneral
      const duration = 2000 // 2 segundos para la animación
      const steps = 60
      const increment = targetScore / steps
      const stepDuration = duration / steps

      let currentScore = 0

      const animateScore = () => {
        currentScore += increment
        if (currentScore >= targetScore) {
          setScore(targetScore)
          // Si el puntaje es alto (verde), mostrar confeti
          if (targetScore >= 75) {
            setShowConfetti(true)
          }
          setTimeout(() => {
            setAnimationComplete(true)
            setShowContent(true)
            startTypingAnimation()
          }, 1500) // Espera 1.5 segundos extra antes de mostrar el contenido final
        } else {
          setScore(Math.min(currentScore, targetScore))
          scoreRef.current = setTimeout(animateScore, stepDuration)
        }
      }

      animateScore()
    }

    return () => {
      if (scoreRef.current) clearTimeout(scoreRef.current)
      if (typingRef.current) clearTimeout(typingRef.current)
    }
  }, [isOpen, result, isLoading])

  // Efecto de escritura para el resumen
  const startTypingAnimation = () => {
    if (!fullText) return

    let index = 0
    const typeSpeed = 15 // ms por caracter

    const typeText = () => {
      if (index < fullText.length) {
        setTypingText(fullText.substring(0, index + 1))
        index++
        typingRef.current = setTimeout(typeText, typeSpeed)
      }
    }

    typeText()
  }

  // Determinar el color según el puntaje
  const getScoreColor = (score: number) => {
    if (score < 50) return "#dc2626" // Rojo más sobrio
    if (score < 75) return "#ca8a04" // Amarillo más sobrio
    return "#16a34a" // Verde más sobrio
  }

  // Determinar el icono según el puntaje
  const getScoreIcon = (score: number) => {
    if (score < 50) return <XCircle className="h-5 w-5" />
    if (score < 75) return <AlertTriangle className="h-5 w-5" />
    return <CheckCircle className="h-5 w-5" />
  }

  // Calcular el ángulo para el arco del medidor
  const calculateStrokeDashoffset = (percent: number) => {
    const circumference = 2 * Math.PI * 120
    return circumference * (1 - percent / 100)
  }

  // Componente de confeti
  const Confetti = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            initial={{
              top: "-10%",
              left: `${Math.random() * 100}%`,
              backgroundColor: [
                "#16a34a", // verde
                "#22c55e", // verde claro
                "#4ade80", // verde más claro
                "#86efac", // verde muy claro
                "#fde047", // amarillo
                "#facc15", // amarillo más oscuro
                "#fb923c", // naranja
                "#f97316", // naranja más oscuro
              ][Math.floor(Math.random() * 8)],
              scale: Math.random() * 0.8 + 0.6,
            }}
            animate={{
              top: "110%",
              left: `${Math.random() * 100}%`,
              rotate: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1),
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              delay: Math.random() * 1,
              ease: "easeOut",
            }}
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
            }}
          />
        ))}
      </div>
    )
  }

  // Componente para la barra de puntaje
  const ScoreBar = ({
    label,
    emoji,
    score,
    maxScore,
    color,
  }: { label: string; emoji: string; score: number; maxScore: number; color: string }) => {
    const percentage = (score / maxScore) * 100

    return (
      <div className="mb-2">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{emoji}</span>
            <span className="text-xs font-medium text-slate-700">{label}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium" style={{ color }}>
              {score}
            </span>
            <span className="text-xs text-slate-500">/ {maxScore}</span>
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>
      </div>
    )
  }

  // Función para determinar si un motivo es positivo o negativo
  const getMotivoType = (motivo: string) => {
    const motivoLower = motivo.toLowerCase();
    
    // Palabras clave para motivos positivos
    const positiveKeywords = [
      'cumple', 'tiene', 'posee', 'demuestra', 'presenta', 'cuenta con', 
      'experiencia en', 'conocimientos en', 'habilidades en', 'buen', 'buena',
      'excelente', 'destacable', 'notable', 'relevante', 'adecuado', 'apropiado',
      'sólido', 'fuerte', 'amplio', 'extenso', 'completo', 'integral',
      'impacta positivamente', 'favorable', 'beneficia', 'suma', 'aumenta', 'mejora', 'afecta positivamente'
    ];

    // Palabras clave para motivos negativos
    const negativeKeywords = [
      'no cumple', 'no tiene', 'no posee', 'no demuestra', 'no presenta',
      'falta de', 'carece de', 'limitado', 'insuficiente', 'inadecuado',
      'inapropiado', 'débil', 'escaso', 'mínimo', 'bajo', 'reducido',
      'no menciona', 'no especifica', 'no detalla', 'no incluye',
      'impacta negativamente', 'desfavorable', 'penaliza', 'resta', 'reduce', 'afecta negativamente', 'perjudica', 'empeora'
    ];

    // Verificar si contiene palabras clave positivas
    const isPositive = positiveKeywords.some(keyword => motivoLower.includes(keyword));
    
    // Verificar si contiene palabras clave negativas
    const isNegative = negativeKeywords.some(keyword => motivoLower.includes(keyword));

    // Si contiene palabras clave positivas y no negativas, es positivo
    if (isPositive && !isNegative) return 'positive';
    
    // Si contiene palabras clave negativas, es negativo
    if (isNegative) return 'negative';
    
    // Si no contiene ninguna palabra clave, es neutral
    return 'neutral';
  };

  // Componente para mostrar un motivo con el color apropiado
  const MotivoItem = ({ motivo }: { motivo: string }) => {
    const tipo = getMotivoType(motivo);

    // Detectar si es advertencia (contiene ⚠️ o "atención" o "advertencia")
    const isWarning = motivo.includes('⚠️') || motivo.toLowerCase().includes('atención') || motivo.toLowerCase().includes('advertencia');

    const getIcon = () => {
      if (isWarning) return <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />;
      if (tipo === 'positive') return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />;
      if (tipo === 'negative') return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />;
      return <CheckCircle className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />;
    };

    // Solo borde, sin fondo, y color según tipo
    const getBorderClass = () => {
      if (isWarning) return 'border-green-500';
      if (tipo === 'positive') return 'border-green-500';
      if (tipo === 'negative') return 'border-red-500';
      return 'border-slate-300';
    };

    return (
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-base bg-white ${getBorderClass()}`}
        style={{ borderWidth: 2 }}
      >
        {getIcon()}
        <span className="text-slate-800 text-sm font-medium">
          {motivo.replace(/^✔️\s*|^❌\s*|^⚠️\s*/, "").trim()}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white">
        <DialogHeader>
          <DialogTitle className="sr-only">Análisis de CV con IA</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="relative">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="6" strokeLinecap="round" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset="283"
                  className="animate-[dash_1.5s_ease-in-out_infinite]"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <User className="h-12 w-12 text-slate-700" />
              </div>
            </div>
            <div className="mt-8 text-center">
              <h3 className="text-xl font-semibold text-slate-800">Analizando perfil</h3>
              <div className="mt-4 flex justify-center">
                <div className="flex gap-1.5">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, delay: 0 }}
                    className="w-2 h-2 rounded-full bg-slate-400"
                  ></motion.div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-slate-400"
                  ></motion.div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-slate-400"
                  ></motion.div>
                </div>
              </div>
              <p className="mt-4 text-slate-500">Evaluando competencias y experiencia</p>
            </div>
          </div>
        ) : result ? (
          <div className="relative">
            <AnimatePresence>
              {!animationComplete ? (
                <motion.div
                  key="full-screen-graph"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[500px] py-10"
                >
                  {/* Confeti si el puntaje es alto */}
                  {showConfetti && <Confetti />}

                  {/* Gráfico circular mediano con animación */}
                  <motion.div
                    className="relative mb-10"
                    animate={{
                      rotate: [0, 5, 0, -5, 0],
                      scale: [1, 1.02, 1, 1.02, 1],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  >
                    <svg className="w-64 h-64" viewBox="0 0 250 250">
                      {/* Fondo del medidor */}
                      <circle
                        cx="125"
                        cy="125"
                        r="120"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                      {/* Arco del medidor animado */}
                      <circle
                        cx="125"
                        cy="125"
                        r="120"
                        fill="none"
                        stroke={getScoreColor(score)}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 120}
                        strokeDashoffset={calculateStrokeDashoffset(score)}
                        transform="rotate(-90 125 125)"
                        className="transition-all duration-1000 ease-out"
                      />
                      {/* Texto de porcentaje */}
                      <text
                        x="125"
                        y="125"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="64"
                        fontWeight="bold"
                        fill="#1e293b"
                      >
                        {Math.round(score)}
                      </text>
                      <text x="125" y="165" textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="#64748b">
                        Puntuación
                      </text>
                    </svg>
                  </motion.div>

                  {/* Barra de progreso con animación */}
                  <motion.div
                    className="w-full max-w-sm px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <motion.div
                        className="h-full bg-red-500 flex-1"
                        animate={{
                          backgroundColor: ["#ef4444", "#ef4444"],
                        }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                      ></motion.div>
                      <motion.div
                        className="h-full bg-amber-500 flex-1"
                        animate={{
                          backgroundColor: ["#f59e0b", "#eab308"],
                        }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                      ></motion.div>
                      <motion.div
                        className="h-full bg-green-500 flex-1"
                        animate={{
                          backgroundColor: ["#22c55e", "#16a34a"],
                        }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                      ></motion.div>
                    </div>
                    <div className="relative h-8">
                      <motion.div
                        className="absolute top-0 h-5 w-1 bg-slate-800 transform -translate-x-1/2"
                        style={{ left: `${score}%` }}
                        animate={{
                          height: [20, 24, 20],
                          backgroundColor: ["#1e293b", "#334155", "#1e293b"],
                        }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      ></motion.div>
                      <motion.div
                        className="absolute top-0 text-sm font-medium text-slate-700 transform -translate-x-1/2"
                        style={{ left: `${score}%`, top: "20px" }}
                        animate={{
                          y: [0, 2, 0, -2, 0],
                        }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        {Math.round(score)}
                      </motion.div>
                      <div className="flex justify-between mt-1 px-1">
                        <span className="text-xs text-slate-500">0</span>
                        <span className="text-xs text-slate-500">50</span>
                        <span className="text-xs text-slate-500">100</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <>
                  {/* Header - Solo aparece después de la animación */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="border-b border-slate-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-slate-800">Análisis de CV con IA</h2>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center ${
                            score < 50
                              ? "bg-red-50 text-red-600"
                              : score < 75
                                ? "bg-amber-50 text-amber-600"
                                : "bg-green-50 text-green-600"
                          }`}
                        >
                          {getScoreIcon(score)}
                        </div>
                        <span className="font-medium text-slate-700">{Math.round(score)}/100</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{candidateName}</h3>
                    <p className="text-sm text-slate-500 mt-1">{result?.perfilDetectado || jobTitle}</p>
                  </motion.div>

                  {/* Contenido principal - después de la animación */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="p-6"
                  >
                    {/* Visualización del puntaje */}
                    <div className="mb-8 flex justify-center">
                      <div className="flex flex-row items-center justify-center gap-16 w-full max-w-3xl px-8">
                        {/* Lado izquierdo: Gráfico y barra de puntuación */}
                        <div className="flex flex-col items-center">
                          {/* Medidor circular pequeño */}
                          <div className="relative mb-4">
                            <svg className="w-32 h-32" viewBox="0 0 250 250">
                              {/* Fondo del medidor */}
                              <circle
                                cx="125"
                                cy="125"
                                r="120"
                                fill="none"
                                stroke="#f1f5f9"
                                strokeWidth="10"
                                strokeLinecap="round"
                              />
                              {/* Arco del medidor */}
                              <circle
                                cx="125"
                                cy="125"
                                r="120"
                                fill="none"
                                stroke={getScoreColor(score)}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 120}
                                strokeDashoffset={calculateStrokeDashoffset(score)}
                                transform="rotate(-90 125 125)"
                              />
                              {/* Texto de porcentaje */}
                              <text
                                x="125"
                                y="115"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="48"
                                fontWeight="bold"
                                fill="#1e293b"
                              >
                                {Math.round(score)}
                              </text>
                              <text
                                x="125"
                                y="155"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="16"
                                fill="#64748b"
                              >
                                Puntuación
                              </text>
                            </svg>
                          </div>

                          {/* Barra de progreso con escala de colores */}
                          <div className="w-full max-w-xs">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                              <div className="h-full bg-red-500 flex-1"></div>
                              <div className="h-full bg-amber-500 flex-1"></div>
                              <div className="h-full bg-green-500 flex-1"></div>
                            </div>
                            <div className="relative h-6">
                              <div
                                className="absolute top-0 h-4 w-0.5 bg-slate-800 transform -translate-x-1/2"
                                style={{ left: `${score}%` }}
                              ></div>
                              <div
                                className="absolute top-0 text-xs font-medium text-slate-700 transform -translate-x-1/2"
                                style={{ left: `${score}%`, top: "16px" }}
                              >
                                {Math.round(score)}
                              </div>
                              <div className="flex justify-between mt-1 px-1">
                                <span className="text-xs text-slate-500">0</span>
                                <span className="text-xs text-slate-500">50</span>
                                <span className="text-xs text-slate-500">100</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Lado derecho: Leyenda vertical */}
                        <div className="flex flex-col justify-center space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full bg-red-500 flex-shrink-0"></div>
                            <span className="text-sm text-slate-700">No es adecuado para el puesto</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full bg-amber-500 flex-shrink-0"></div>
                            <span className="text-sm text-slate-700">Puede ser adecuado al puesto</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                            <span className="text-sm text-slate-700">Adecuado para el puesto</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contenido que aparece después de la animación */}
                    <AnimatePresence>
                      {showContent && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="space-y-6"
                        >
                          {/* Resumen con efecto de escritura */}
                          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                            <div className="p-4 border-b border-slate-100 flex items-center">
                              <h3 className="text-base font-medium text-slate-800 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-500" />
                                Resumen del análisis
                              </h3>
                            </div>
                            <div className="p-4">
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {typingText}
                                {typingText.length < fullText.length && (
                                  <span className="inline-block w-1 h-4 bg-slate-400 ml-0.5 animate-pulse"></span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Factores de evaluación con tabs */}
                          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                            <div className="p-4 border-b border-slate-100">
                              <h3 className="text-base font-medium text-slate-800 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-slate-500" />
                                Factores de evaluación
                              </h3>
                            </div>

                            <Tabs defaultValue="criterios" className="w-full">
                              <div className="px-4 pt-2">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="criterios">Criterios de evaluación</TabsTrigger>
                                  <TabsTrigger value="resultados">Resultados del candidato</TabsTrigger>
                                </TabsList>
                              </div>

                              <TabsContent value="criterios" className="p-4">
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr className="bg-slate-50">
                                        <th className="px-3 py-2 text-left font-medium text-slate-700 text-sm">
                                          Criterio
                                        </th>
                                        <th className="px-3 py-2 text-center font-medium text-slate-700 text-sm">
                                          Peso
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-slate-700 text-sm">
                                          Descripción
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                      <tr>
                                        <td className="px-3 py-2 align-middle">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base">✅</span>
                                            <span className="font-medium text-slate-700 text-sm">Requisitos clave</span>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2 text-center align-middle">
                                          <span className="font-medium text-slate-700 text-sm">50%</span>
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 align-middle text-xs">
                                          Tecnologías, herramientas y conocimientos específicos solicitados.
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="px-3 py-2 align-middle">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base">🧠</span>
                                            <span className="font-medium text-slate-700 text-sm">
                                              Experiencia laboral
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2 text-center align-middle">
                                          <span className="font-medium text-slate-700 text-sm">20%</span>
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 align-middle text-xs">
                                          Solo si está explícitamente indicada en el CV.
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="px-3 py-2 align-middle">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base">🎓</span>
                                            <span className="font-medium text-slate-700 text-sm">
                                              Formación académica
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2 text-center align-middle">
                                          <span className="font-medium text-slate-700 text-sm">10%</span>
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 align-middle text-xs">
                                          Estudios en curso o completos relacionados con el área.
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="px-3 py-2 align-middle">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base">🌐</span>
                                            <span className="font-medium text-slate-700 text-sm">
                                              Idiomas y soft skills
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2 text-center align-middle">
                                          <span className="font-medium text-slate-700 text-sm">10%</span>
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 align-middle text-xs">
                                          Nivel de inglés, metodologías ágiles, comunicación, etc.
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="px-3 py-2 align-middle">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base">🌟</span>
                                            <span className="font-medium text-slate-700 text-sm">Otros (opcional)</span>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2 text-center align-middle">
                                          <span className="font-medium text-slate-700 text-sm">Máx. 10%</span>
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 align-middle text-xs">
                                          Proyectos personales, portafolio, certificaciones.
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="px-3 py-2 align-middle">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base">🛑</span>
                                            <span className="font-medium text-slate-700 text-sm">Penalización</span>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2 text-center align-middle">
                                          <span className="font-medium text-slate-700 text-sm">-X</span>
                                        </td>
                                        <td className="px-3 py-2 text-slate-600 align-middle text-xs">
                                          Por incumplimiento de requisitos excluyentes.
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 bg-slate-50 p-1.5 rounded">
                                  <Info className="h-3 w-3" />
                                  <span>Criterios utilizados por la IA para evaluar todos los candidatos.</span>
                                </div>
                              </TabsContent>

                              <TabsContent value="resultados" className="p-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Puntaje por criterio */}
                                  <div className="space-y-3 h-[280px] overflow-y-auto pr-2">
                                    <h4 className="text-xs font-medium text-slate-700 mb-2">Puntaje por criterio</h4>

                                    <ScoreBar
                                      label="Requisitos clave"
                                      emoji="✅"
                                      score={puntajes.requisitosClave}
                                      maxScore={50}
                                      color="#4f46e5"
                                    />

                                    <ScoreBar
                                      label="Experiencia laboral"
                                      emoji="🛠️"
                                      score={puntajes.experienciaLaboral}
                                      maxScore={20}
                                      color="#8b5cf6"
                                    />

                                    <ScoreBar
                                      label="Formación académica"
                                      emoji="🎓"
                                      score={puntajes.formacionAcademica}
                                      maxScore={10}
                                      color="#06b6d4"
                                    />

                                    <ScoreBar
                                      label="Idiomas y soft skills"
                                      emoji="🌐"
                                      score={puntajes.idiomasYSoftSkills}
                                      maxScore={10}
                                      color="#10b981"
                                    />

                                    <ScoreBar
                                      label="Otros"
                                      emoji="🌟"
                                      score={puntajes.otros}
                                      maxScore={10}
                                      color="#f59e0b"
                                    />

                                    <div className="h-px bg-slate-200 my-1.5"></div>

                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-slate-700">Puntaje total:</span>
                                      <span className="font-bold text-base">{puntajeGeneral}/100</span>
                                    </div>
                                  </div>

                                  {/* Factores específicos */}
                                  <div className="h-[280px] overflow-y-auto pr-2">
                                    <h4 className="text-xs font-medium text-slate-700 mb-2">Factores considerados</h4>
                                    <div className="space-y-1.5">
                                      {motivos.map((motivo, index) => (
                                        <MotivoItem key={index} motivo={motivo} />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Botón de cerrar */}
                    <div className="flex justify-end mt-6">
                      <Button variant="outline" size="sm" onClick={onClose} className="border-slate-200 text-slate-700">
                        Cerrar
                      </Button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-slate-500">No se pudo cargar el análisis</p>
            <Button onClick={onClose} className="mt-4" variant="outline" size="sm">
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
