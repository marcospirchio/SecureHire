"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PlusIcon, SearchIcon, ArrowLeft, Trash2, Check, Radio, CheckSquare, AlignLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { VistaCandidatos } from "@/components/ofertas/vista-candidatos"
import { useOfertas } from "@/hooks/use-ofertas"
import { ofertasEjemplo } from "@/data/ofertas"
import { useToast } from "@/hooks/use-toast"

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
        <div className="flex flex-col space-y-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => setMostrarFormularioNuevaOferta(false)} className="mr-4">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver atrás
            </Button>
            <h1 className="text-2xl font-bold">Nueva oferta</h1>
            <div className="ml-auto">
              <Button
                onClick={handleSubmitNuevaOferta}
                className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-6 py-2"
                size="lg"
              >
                PUBLICAR OFERTA
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda: Información básica */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titulo" className="flex items-center">
                  Nombre del puesto:
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Desarrollador Frontend Senior"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="flex items-center">
                  Descripción del puesto:
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe las responsabilidades, requisitos y beneficios del puesto..."
                  className="w-full min-h-[300px] p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Columna derecha: Formulario */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-2">
                  Nuevo!
                </Badge>
                <span className="text-sm text-gray-600">Ahora puedes marcar qué campos son requisitos excluyentes</span>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="preguntas" className="flex-1">
                    Preguntas Específicas
                  </TabsTrigger>
                  <TabsTrigger value="obligatorio" className="flex-1">
                    Formulario Obligatorio
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preguntas" className="space-y-4 mt-4">
                  {preguntas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-4">No hay preguntas específicas</p>
                      <Button onClick={agregarPregunta}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar pregunta
                      </Button>
                    </div>
                  ) : (
                    <>
                      {preguntas.map((pregunta) => (
                        <Card key={pregunta.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-start">
                                <Input
                                  value={pregunta.texto}
                                  onChange={(e) => actualizarPregunta(pregunta.id, "texto", e.target.value)}
                                  placeholder="Escribe tu pregunta aquí"
                                  className="flex-1 bg-gray-100 dark:bg-gray-800"
                                />
                                <Select
                                  value={pregunta.tipo}
                                  onValueChange={(valor) => actualizarPregunta(pregunta.id, "tipo", valor)}
                                >
                                  <SelectTrigger className="w-[220px] ml-2">
                                    <SelectValue placeholder="Tipo de pregunta" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tiposPregunta.map((tipo) => (
                                      <SelectItem key={tipo.valor} value={tipo.valor}>
                                        <div className="flex items-center">
                                          {tipo.icono}
                                          <span className="ml-2">{tipo.texto}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {(pregunta.tipo === "opcion_multiple" || pregunta.tipo === "checkbox") && (
                                <div className="space-y-2 pl-4">
                                  {pregunta.opciones.map((opcion) => (
                                    <div key={opcion.id} className="flex items-center">
                                      {pregunta.tipo === "opcion_multiple" ? (
                                        <Radio className="h-4 w-4 mr-2 text-gray-400" />
                                      ) : (
                                        <CheckSquare className="h-4 w-4 mr-2 text-gray-400" />
                                      )}
                                      <Input
                                        value={opcion.texto}
                                        onChange={(e) => actualizarOpcion(pregunta.id, opcion.id, e.target.value)}
                                        className="flex-1"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => eliminarOpcion(pregunta.id, opcion.id)}
                                        className="ml-2 text-gray-500 hover:text-red-500"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => agregarOpcion(pregunta.id)}
                                    className="text-gray-500"
                                  >
                                    + Agregar otra opción
                                  </Button>
                                </div>
                              )}

                              <div className="flex justify-between items-center pt-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => eliminarPregunta(pregunta.id)}
                                  className="text-gray-500 hover:text-red-500"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm">Excluyente</span>
                                  <div
                                    className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer ${
                                      pregunta.esExcluyente ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                                    onClick={() => toggleExcluyente(pregunta.id)}
                                  >
                                    {pregunta.esExcluyente && <Check className="h-4 w-4" />}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <div className="flex justify-center mt-4">
                        <Button onClick={agregarPregunta} variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva pregunta
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="obligatorio" className="space-y-4 mt-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Datos personales (obligatorios)</h3>
                        <p className="text-sm text-gray-500">
                          Estos campos se solicitarán automáticamente a todos los candidatos:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="nombre" checked disabled />
                            <Label htmlFor="nombre">Nombre</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="apellido" checked disabled />
                            <Label htmlFor="apellido">Apellido</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="email" checked disabled />
                            <Label htmlFor="email">Email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="telefono" checked disabled />
                            <Label htmlFor="telefono">Teléfono</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="dni" checked disabled />
                            <Label htmlFor="dni">DNI</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="fechaNacimiento" checked disabled />
                            <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="genero" checked disabled />
                            <Label htmlFor="genero">Género</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="nacionalidad" checked disabled />
                            <Label htmlFor="nacionalidad">Nacionalidad</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="paisResidencia" checked disabled />
                            <Label htmlFor="paisResidencia">País de residencia</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="provincia" checked disabled />
                            <Label htmlFor="provincia">Provincia</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="direccion" checked disabled />
                            <Label htmlFor="direccion">Dirección</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="cv" checked disabled />
                            <Label htmlFor="cv">Curriculum Vitae</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
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
        <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg mb-6">
          <div className="flex items-center flex-1 mr-4">
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
