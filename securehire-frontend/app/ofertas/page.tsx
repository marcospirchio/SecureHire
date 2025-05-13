"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PlusIcon, SearchIcon, ArrowLeft, Radio, CheckSquare, AlignLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VistaCandidatos } from "@/components/ofertas/vista-candidatos"
import { useOfertas } from "@/hooks/use-ofertas"
import { ofertasEjemplo } from "@/data/ofertas"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { FormularioNuevaOferta } from "@/components/ofertas/formulario-nueva-oferta"

// Tipos para el formulario de nueva oferta
type TipoPregunta = "opcion_multiple" | "checkbox" | "texto" | "numero"

interface Opcion {
  id: string
  texto: string
}

interface Pregunta {
  id: string
  texto: string
  tipo: TipoPregunta
  opciones: Opcion[]
  esExcluyente: boolean
}

export default function OfertasPage() {
  const {
    ofertasFiltradas,
    ofertaSeleccionada,
    setOfertaSeleccionada,
    busquedaOfertas,
    setBusquedaOfertas,
    crearNuevaOferta,
  } = useOfertas(ofertasEjemplo)

  const [ordenarPor, setOrdenarPor] = useState<string>("recientes")
  const [mostrarFormularioNuevaOferta, setMostrarFormularioNuevaOferta] = useState(false)

  // Estados para el formulario de nueva oferta
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [activeTab, setActiveTab] = useState("preguntas")

  const { toast } = useToast()
  const router = useRouter()

  // Ordenar ofertas según el criterio seleccionado
  const ofertasOrdenadas = [...ofertasFiltradas].sort((a, b) => {
    if (ordenarPor === "recientes") {
      return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    } else {
      return new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
    }
  })

  // Función para determinar la fase actual de una oferta
  const obtenerFaseActual = (oferta) => {
    if (!oferta.candidatos || oferta.candidatos.length === 0) {
      return "Sin candidatos"
    }

    // Contar candidatos por fase
    const fases = oferta.candidatos.map((c) => c.estado)
    const conteoFases = {}
    fases.forEach((fase) => {
      conteoFases[fase] = (conteoFases[fase] || 0) + 1
    })

    // Determinar la fase predominante
    let faseActual = "Recepción de CVs"
    let maxCandidatos = 0

    for (const [fase, cantidad] of Object.entries(conteoFases)) {
      if (cantidad > maxCandidatos) {
        maxCandidatos = cantidad
        faseActual = fase
      }
    }

    return faseActual
  }

  // Funciones para el formulario de nueva oferta
  const tiposPregunta = [
    { valor: "opcion_multiple", texto: "Opción múltiple", icono: <Radio className="h-4 w-4" /> },
    { valor: "checkbox", texto: "Casillas de verificación", icono: <CheckSquare className="h-4 w-4" /> },
    { valor: "texto", texto: "Respuesta de texto", icono: <AlignLeft className="h-4 w-4" /> },
  ]

  const agregarPregunta = () => {
    const nuevaPregunta: Pregunta = {
      id: Date.now().toString(),
      texto: "",
      tipo: "opcion_multiple",
      opciones: [
        { id: "opt1", texto: "Sí" },
        { id: "opt2", texto: "No" },
      ],
      esExcluyente: false,
    }
    setPreguntas([...preguntas, nuevaPregunta])
  }

  const actualizarPregunta = (id: string, campo: keyof Pregunta, valor: any) => {
    setPreguntas(preguntas.map((pregunta) => (pregunta.id === id ? { ...pregunta, [campo]: valor } : pregunta)))
  }

  const agregarOpcion = (preguntaId: string) => {
    setPreguntas(
      preguntas.map((pregunta) => {
        if (pregunta.id === preguntaId) {
          return {
            ...pregunta,
            opciones: [...pregunta.opciones, { id: `opt${Date.now()}`, texto: "Nueva opción" }],
          }
        }
        return pregunta
      }),
    )
  }

  const actualizarOpcion = (preguntaId: string, opcionId: string, texto: string) => {
    setPreguntas(
      preguntas.map((pregunta) => {
        if (pregunta.id === preguntaId) {
          return {
            ...pregunta,
            opciones: pregunta.opciones.map((opcion) => (opcion.id === opcionId ? { ...opcion, texto } : opcion)),
          }
        }
        return pregunta
      }),
    )
  }

  const eliminarOpcion = (preguntaId: string, opcionId: string) => {
    setPreguntas(
      preguntas.map((pregunta) => {
        if (pregunta.id === preguntaId) {
          return {
            ...pregunta,
            opciones: pregunta.opciones.filter((opcion) => opcion.id !== opcionId),
          }
        }
        return pregunta
      }),
    )
  }

  const eliminarPregunta = (id: string) => {
    setPreguntas(preguntas.filter((pregunta) => pregunta.id !== id))
  }

  const toggleExcluyente = (id: string) => {
    setPreguntas(
      preguntas.map((pregunta) =>
        pregunta.id === id ? { ...pregunta, esExcluyente: !pregunta.esExcluyente } : pregunta,
      ),
    )
  }

  const handleSubmitNuevaOferta = () => {
    if (!titulo.trim()) {
      toast({
        title: "Error",
        description: "El nombre del puesto es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!descripcion.trim()) {
      toast({
        title: "Error",
        description: "La descripción del puesto es obligatoria",
        variant: "destructive",
      })
      return
    }

    // Validar que todas las preguntas tengan texto
    const preguntasSinTexto = preguntas.some((p) => !p.texto.trim())
    if (preguntasSinTexto && preguntas.length > 0) {
      toast({
        title: "Error",
        description: "Todas las preguntas deben tener un texto",
        variant: "destructive",
      })
      return
    }

    // Convertir las preguntas al formato esperado por el backend
    const camposFormulario = preguntas.map((pregunta) => ({
      id: pregunta.id,
      tipo: pregunta.tipo === "opcion_multiple" ? "dropdown" : pregunta.tipo === "checkbox" ? "checkbox" : "texto",
      etiqueta: pregunta.texto,
      esExcluyente: pregunta.esExcluyente,
      opciones: pregunta.opciones?.map((opt) => opt.texto) || [],
    }))

    // Crear la oferta
    crearNuevaOferta(titulo, descripcion)

    // Limpiar el formulario
    setTitulo("")
    setDescripcion("")
    setPreguntas([])

    // Cerrar el formulario
    setMostrarFormularioNuevaOferta(false)

    toast({
      title: "Oferta creada",
      description: "La oferta ha sido creada exitosamente",
    })
  }

  // Si estamos mostrando el formulario de nueva oferta
  if (mostrarFormularioNuevaOferta) {
    return (
      <div className="container mx-auto py-6">
        <FormularioNuevaOferta
          onVolver={() => setMostrarFormularioNuevaOferta(false)}
          onGuardar={(titulo, descripcion, preguntas) => {
            // Aquí se procesaría la creación de la oferta con todos los campos
            console.log("Nueva oferta:", { titulo, descripcion, preguntas })
            setMostrarFormularioNuevaOferta(false)
            // Recargar ofertas después de crear una nueva
            setTimeout(() => {
              router.refresh()
            }, 500)
          }}
        />
      </div>
    )
  }

  // Si hay una oferta seleccionada, mostrar la vista de candidatos
  if (ofertaSeleccionada) {
    return <VistaCandidatos oferta={ofertaSeleccionada} onVolver={() => setOfertaSeleccionada(null)} />
  }

  // Si no hay oferta seleccionada, mostrar la lista de ofertas
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Barra superior con búsqueda y botón nueva oferta */}
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <div className="flex items-center flex-1 mr-4">
            <Button variant="ghost" onClick={() => router.push("/")} className="mr-2" aria-label="Volver al inicio">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <SearchIcon className="h-5 w-5 text-gray-500 mr-2" />
            <Input
              type="search"
              placeholder="Buscar ofertas..."
              className="max-w-md"
              value={busquedaOfertas}
              onChange={(e) => setBusquedaOfertas(e.target.value)}
            />
          </div>

          <Button
            onClick={() => setMostrarFormularioNuevaOferta(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 font-bold"
            size="lg"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            NUEVA OFERTA
          </Button>
        </div>

        {/* Ordenar por */}
        <div className="flex justify-end items-center">
          <span className="text-sm text-gray-500 mr-2">Ordenar por:</span>
          <Select value={ordenarPor} onValueChange={setOrdenarPor}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recientes">Más recientes</SelectItem>
              <SelectItem value="antiguos">Más antiguos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid de tarjetas de ofertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ofertasOrdenadas.map((oferta) => (
            <Card
              key={oferta.id}
              className="cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => setOfertaSeleccionada(oferta)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <h3 className="text-xl font-semibold text-center">{oferta.titulo}</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Fase actual:</span>
                      <span className="text-sm text-green-600">{obtenerFaseActual(oferta)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Candidatos:</span>
                      <span className="text-sm text-green-600 font-medium">{oferta.candidatos.length}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Creada el:</span>
                      <span className="text-sm">{format(oferta.fechaCreacion, "dd/MM/yyyy", { locale: es })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {ofertasOrdenadas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">No hay ofertas disponibles</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Crea una nueva oferta para comenzar.</p>
            <Button onClick={() => setMostrarFormularioNuevaOferta(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva oferta
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
