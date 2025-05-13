"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Trash2, Check, Radio, CheckSquare, AlignLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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

interface FormularioNuevaOfertaProps {
  onVolver: () => void
  onGuardar: (titulo: string, descripcion: string, preguntas: Pregunta[]) => void
}

export function FormularioNuevaOferta({ onVolver, onGuardar }: FormularioNuevaOfertaProps) {
  const [datosOferta, setDatosOferta] = useState({
    titulo: "",
    empresa: "",
    ubicacion: "",
    modalidad: "presencial", // presencial o remoto
    descripcion: "",
    beneficios: ["Horario flexible", "Trabajo remoto", "Seguro médico", "Oportunidades de crecimiento profesional"],
    tipoContrato: "Tiempo completo",
    salario: "Competitivo (según experiencia)",
  })
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [activeTab, setActiveTab] = useState("preguntas")

  const { toast } = useToast()
  const router = useRouter()

  const tiposPregunta = [
    { valor: "opcion_multiple", texto: "Opción múltiple", icono: <Radio className="h-4 w-4" /> },
    { valor: "checkbox", texto: "Casillas de verificación", icono: <CheckSquare className="h-4 w-4" /> },
    { valor: "texto", texto: "Respuesta de texto", icono: <AlignLeft className="h-4 w-4" /> },
  ]

  const handleChange = (campo: string, valor: string) => {
    setDatosOferta({
      ...datosOferta,
      [campo]: valor,
    })
  }

  const handleBeneficioChange = (index: number, valor: string) => {
    const nuevosBeneficios = [...datosOferta.beneficios]
    nuevosBeneficios[index] = valor
    setDatosOferta({
      ...datosOferta,
      beneficios: nuevosBeneficios,
    })
  }

  const agregarBeneficio = () => {
    setDatosOferta({
      ...datosOferta,
      beneficios: [...datosOferta.beneficios, ""],
    })
  }

  const eliminarBeneficio = (index: number) => {
    const nuevosBeneficios = [...datosOferta.beneficios]
    nuevosBeneficios.splice(index, 1)
    setDatosOferta({
      ...datosOferta,
      beneficios: nuevosBeneficios,
    })
  }

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

  const handleSubmit = () => {
    if (!datosOferta.titulo.trim()) {
      toast({
        title: "Error",
        description: "El nombre del puesto es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!datosOferta.empresa.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la empresa es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!datosOferta.descripcion.trim()) {
      toast({
        title: "Error",
        description: "La descripción del puesto es obligatoria",
        variant: "destructive",
      })
      return
    }

    // Validar que todas las preguntas tengan texto
    const preguntasSinTexto = preguntas.some((p) => !p.texto.trim())
    if (preguntasSinTexto) {
      toast({
        title: "Error",
        description: "Todas las preguntas deben tener un texto",
        variant: "destructive",
      })
      return
    }

    // Construir el título completo con el formato requerido
    const tituloCompleto = `${datosOferta.titulo} - ${datosOferta.empresa} - ${datosOferta.ubicacion} (${datosOferta.modalidad})`

    // Construir la descripción completa con todos los campos
    const descripcionCompleta = `
Descripción del puesto:
${datosOferta.descripcion}

Beneficios:
${datosOferta.beneficios.map((b) => `- ${b}`).join("\n")}

Tipo de contrato:
${datosOferta.tipoContrato}

Salario:
${datosOferta.salario}
  `.trim()

    onGuardar(tituloCompleto, descripcionCompleta, preguntas)

    toast({
      title: "Oferta creada",
      description: "La oferta ha sido creada exitosamente",
    })

    router.push("/ofertas")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onVolver} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Nueva oferta</h1>
          <div className="ml-auto">
            <Button onClick={handleSubmit} className="bg-navy text-white hover:bg-navy/90">
              Publicar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda: Información básica */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información básica</h3>

              <div className="space-y-2">
                <Label htmlFor="titulo" className="flex items-center">
                  Título del puesto:
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="titulo"
                  value={datosOferta.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  placeholder="Ej: Contador Semi Senior"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa" className="flex items-center">
                    Empresa:
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="empresa"
                    value={datosOferta.empresa}
                    onChange={(e) => handleChange("empresa", e.target.value)}
                    placeholder="Ej: Acme Inc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacion" className="flex items-center">
                    Ubicación:
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="ubicacion"
                    value={datosOferta.ubicacion}
                    onChange={(e) => handleChange("ubicacion", e.target.value)}
                    placeholder="Ej: Buenos Aires"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modalidad" className="flex items-center">
                  Modalidad:
                </Label>
                <Select value={datosOferta.modalidad} onValueChange={(valor) => handleChange("modalidad", valor)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="remoto">Remoto</SelectItem>
                    <SelectItem value="híbrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="flex items-center">
                  Descripción del puesto:
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <textarea
                  id="descripcion"
                  value={datosOferta.descripcion}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  placeholder="Describe las responsabilidades, requisitos y expectativas del puesto..."
                  className="w-full min-h-[150px] p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center">Beneficios:</Label>
                  <Button type="button" variant="outline" size="sm" onClick={agregarBeneficio} className="h-8">
                    <Plus className="h-4 w-4 mr-1" /> Añadir
                  </Button>
                </div>
                <div className="space-y-2 border rounded-md p-3 bg-gray-50 dark:bg-gray-900">
                  {datosOferta.beneficios.map((beneficio, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-gray-500">-</span>
                      <Input
                        value={beneficio}
                        onChange={(e) => handleBeneficioChange(index, e.target.value)}
                        placeholder="Ej: Horario flexible"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => eliminarBeneficio(index)}
                        className="h-8 w-8 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {datosOferta.beneficios.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No hay beneficios añadidos</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoContrato">Tipo de contrato:</Label>
                  <Select
                    value={datosOferta.tipoContrato}
                    onValueChange={(valor) => handleChange("tipoContrato", valor)}
                  >
                    <SelectTrigger id="tipoContrato">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tiempo completo">Tiempo completo</SelectItem>
                      <SelectItem value="Medio tiempo">Medio tiempo</SelectItem>
                      <SelectItem value="Por proyecto">Por proyecto</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Pasantía">Pasantía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salario">Salario:</Label>
                  <Input
                    id="salario"
                    value={datosOferta.salario}
                    onChange={(e) => handleChange("salario", e.target.value)}
                    placeholder="Ej: Competitivo (según experiencia)"
                  />
                </div>
              </div>
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
