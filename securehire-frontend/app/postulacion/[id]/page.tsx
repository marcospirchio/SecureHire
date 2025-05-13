"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useTheme } from "next-themes"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Package2Icon, Moon, Sun, CheckCircle, Calendar, Upload, X, FileText, ScrollText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Lista de países para los selectores
const paises = [
  "Argentina",
  "Bolivia",
  "Brasil",
  "Chile",
  "Colombia",
  "Costa Rica",
  "Cuba",
  "Ecuador",
  "El Salvador",
  "España",
  "Estados Unidos",
  "Guatemala",
  "Honduras",
  "México",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Perú",
  "Puerto Rico",
  "República Dominicana",
  "Uruguay",
  "Venezuela",
]

// Códigos de área por país
const codigosPais = [
  { pais: "Argentina", codigo: "+54" },
  { pais: "Bolivia", codigo: "+591" },
  { pais: "Brasil", codigo: "+55" },
  { pais: "Chile", codigo: "+56" },
  { pais: "Colombia", codigo: "+57" },
  { pais: "Costa Rica", codigo: "+506" },
  { pais: "Cuba", codigo: "+53" },
  { pais: "Ecuador", codigo: "+593" },
  { pais: "El Salvador", codigo: "+503" },
  { pais: "España", codigo: "+34" },
  { pais: "Estados Unidos", codigo: "+1" },
  { pais: "Guatemala", codigo: "+502" },
  { pais: "Honduras", codigo: "+504" },
  { pais: "México", codigo: "+52" },
  { pais: "Nicaragua", codigo: "+505" },
  { pais: "Panamá", codigo: "+507" },
  { pais: "Paraguay", codigo: "+595" },
  { pais: "Perú", codigo: "+51" },
  { pais: "Puerto Rico", codigo: "+1" },
  { pais: "República Dominicana", codigo: "+1" },
  { pais: "Uruguay", codigo: "+598" },
  { pais: "Venezuela", codigo: "+58" },
]

// Texto de términos y condiciones
const terminosYCondiciones = `TÉRMINOS Y CONDICIONES DE USO

Al acceder y utilizar esta plataforma, el usuario acepta quedar obligado por los presentes Términos y Condiciones, así como por todas las leyes y regulaciones aplicables en la República Argentina.

1. DEFINICIONES

Usuario: Persona física o jurídica que utiliza la plataforma, ya sea como candidato o reclutador.

Candidato: Persona que se postula a ofertas laborales a través de la plataforma.

Reclutador: Empresa o individuo que publica ofertas laborales y gestiona postulaciones.

Plataforma: Sitio web, sistema y servicios digitales ofrecidos por la empresa proveedora del servicio.

2. USO DE LA PLATAFORMA

La plataforma tiene como finalidad facilitar procesos de selección de personal, permitiendo a los candidatos completar formularios, postularse a búsquedas laborales y recibir comunicaciones, y a los reclutadores gestionar postulaciones, registrar evaluaciones, y consultar historial de comportamiento laboral de los candidatos.

3. PROTECCIÓN DE DATOS PERSONALES

Conforme a la Ley N.º 25.326 de Protección de los Datos Personales, el usuario declara conocer y aceptar que:

Sus datos personales serán tratados con confidencialidad y utilizados exclusivamente para los fines de reclutamiento y selección.

Podrá ejercer en cualquier momento sus derechos de acceso, rectificación, actualización y supresión de sus datos.

La plataforma implementará las medidas de seguridad adecuadas para evitar el acceso no autorizado, pérdida o alteración de la información almacenada.

En caso de compartir información sensible (como CVs, identificaciones u opiniones sobre terceros), el usuario asume la responsabilidad del contenido y garantiza contar con el consentimiento correspondiente cuando aplique.

4. DERECHOS DEL USUARIO

De acuerdo con la Ley N.º 24.240 de Defensa del Consumidor, el usuario tiene derecho a:

Recibir información clara, veraz y detallada sobre los servicios ofrecidos.

Presentar consultas y reclamos ante los canales habilitados por la plataforma.

Rescindir voluntariamente el uso de la plataforma, solicitar la baja de su cuenta y la eliminación de sus datos.

5. RESPONSABILIDADES DEL USUARIO

El usuario se compromete a:

Proporcionar información veraz, completa y actualizada.

Abstenerse de utilizar la plataforma para fines ilícitos, fraudulentos o que infrinjan derechos de terceros.

No realizar conductas discriminatorias, ofensivas, falsas o que atenten contra la integridad de otras personas usuarias.

No extraer, reutilizar ni redistribuir datos del sistema sin autorización expresa.

6. RESPONSABILIDADES DE LA PLATAFORMA

La plataforma:

No garantiza que los candidatos resulten contratados, ni que las evaluaciones sean infalibles.

No se responsabiliza por la veracidad de los datos ingresados por terceros.

Se reserva el derecho de suspender o eliminar cuentas que incumplan con estos términos o infrinjan normativas vigentes.

7. MODIFICACIONES

La plataforma podrá modificar estos Términos y Condiciones en cualquier momento, notificando a los usuarios a través de sus medios habituales. La continuidad en el uso implicará la aceptación de las nuevas condiciones.

8. JURISDICCIÓN

Estos Términos se regirán e interpretarán conforme a las leyes de la República Argentina. Toda controversia será resuelta ante los tribunales ordinarios del domicilio legal de la empresa.

9. CONSENTIMIENTO EXPRESO

Al aceptar estos Términos y Condiciones, el usuario declara haber leído, entendido y aceptado todas las cláusulas aquí expuestas, autorizando expresamente el tratamiento de sus datos personales según la normativa vigente.`

// Datos de ejemplo para una oferta
const ofertaEjemplo = {
  id: "1",
  titulo: "Desarrollador Frontend",
  empresa: "SecureHire",
  ubicacion: "Madrid, España (Remoto)",
  fechaPublicacion: new Date(2025, 3, 15),
  descripcion:
    "Buscamos un desarrollador frontend con experiencia en React y TypeScript para unirse a nuestro equipo. El candidato ideal tendrá experiencia en el desarrollo de aplicaciones web modernas y conocimientos de buenas prácticas de desarrollo.\n\nAdemás de los conocimientos técnicos, valoramos la capacidad de trabajar en equipo, la proactividad y la pasión por el desarrollo de software. Ofrecemos un ambiente de trabajo dinámico y desafiante, con oportunidades de crecimiento profesional y personal.",
  requisitos: [
    "Experiencia mínima de 3 años en desarrollo frontend",
    "Conocimientos sólidos de React, TypeScript y HTML/CSS",
    "Experiencia con herramientas modernas de desarrollo web",
    "Capacidad para trabajar en equipo y comunicarse efectivamente",
  ],
  beneficios: ["Horario flexible", "Trabajo remoto", "Seguro médico", "Oportunidades de crecimiento profesional"],
  reclutador: "Carlos Rodríguez",
  formulario: {
    campos: [
      {
        id: "experiencia",
        tipo: "texto",
        etiqueta: "Años de experiencia en React",
        esExcluyente: true,
        placeholder: "Ej: 3 años",
      },
      {
        id: "typescript",
        tipo: "checkbox",
        etiqueta: "Conocimiento de TypeScript",
        esExcluyente: true,
      },
      {
        id: "ingles",
        tipo: "dropdown",
        etiqueta: "Nivel de inglés",
        esExcluyente: false,
        opciones: ["Básico", "Intermedio", "Avanzado", "Nativo"],
      },
      {
        id: "portfolio",
        tipo: "texto",
        etiqueta: "URL de tu portfolio o GitHub",
        esExcluyente: false,
        placeholder: "https://",
      },
      {
        id: "motivacion",
        tipo: "textarea",
        etiqueta: "¿Por qué te interesa este puesto?",
        esExcluyente: false,
        placeholder: "Cuéntanos por qué te interesa trabajar con nosotros...",
      },
    ],
  },
}

export default function PostulacionPage({ params }: { params: { id: string } }) {
  const { theme, setTheme } = useTheme()
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [enviado, setEnviado] = useState(false)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("datos-personales")
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | undefined>(undefined)
  const [curriculum, setCurriculum] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [terminosDialogOpen, setTerminosDialogOpen] = useState(false)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const terminosContentRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
    // Limpiar error si el campo se completa
    if (errores[id]) {
      setErrores((prev) => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      // Validar tipo de archivo
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(file.type)) {
        setErrores((prev) => ({
          ...prev,
          curriculum: "El archivo debe ser PDF, DOC o DOCX",
        }))
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrores((prev) => ({
          ...prev,
          curriculum: "El archivo no debe superar los 5MB",
        }))
        return
      }

      setCurriculum(file)
      // Limpiar error si existía
      if (errores.curriculum) {
        setErrores((prev) => {
          const newErrors = { ...prev }
          delete newErrors.curriculum
          return newErrors
        })
      }
    }
  }

  const removeFile = () => {
    setCurriculum(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleScroll = () => {
    if (terminosContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = terminosContentRef.current
      // Consideramos que ha llegado al final si está a menos de 10px del final
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
      setScrolledToBottom(isAtBottom)
    }
  }

  const handleAceptarTerminos = () => {
    handleInputChange("terminos", true)
    setTerminosDialogOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar campos excluyentes
    const nuevosErrores: Record<string, string> = {}
    ofertaEjemplo.formulario.campos.forEach((campo) => {
      if (campo.esExcluyente && (!formData[campo.id] || formData[campo.id] === "")) {
        nuevosErrores[campo.id] = "Este campo es obligatorio"
      }
    })

    // Validar campos básicos
    if (!formData.nombre || formData.nombre.trim() === "") {
      nuevosErrores.nombre = "El nombre es obligatorio"
    }

    if (!formData.apellido || formData.apellido.trim() === "") {
      nuevosErrores.apellido = "El apellido es obligatorio"
    }

    if (!formData.dni || formData.dni.trim() === "") {
      nuevosErrores.dni = "El documento de identidad es obligatorio"
    }

    if (!fechaNacimiento) {
      nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria"
    }

    if (!formData.genero) {
      nuevosErrores.genero = "El género es obligatorio"
    }

    if (!formData.nacionalidad) {
      nuevosErrores.nacionalidad = "La nacionalidad es obligatoria"
    }

    if (!formData.paisResidencia) {
      nuevosErrores.paisResidencia = "El país de residencia es obligatorio"
    }

    if (!formData.provincia) {
      nuevosErrores.provincia = "La provincia/estado es obligatorio"
    }

    if (!formData.direccion) {
      nuevosErrores.direccion = "La dirección es obligatoria"
    }

    if (!formData.email || formData.email.trim() === "") {
      nuevosErrores.email = "El email es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nuevosErrores.email = "El email no es válido"
    }

    if (!formData.confirmarEmail || formData.confirmarEmail.trim() === "") {
      nuevosErrores.confirmarEmail = "Debe confirmar su email"
    } else if (formData.email !== formData.confirmarEmail) {
      nuevosErrores.confirmarEmail = "Los emails no coinciden"
    }

    if (!formData.codigoPais) {
      nuevosErrores.codigoPais = "El código de país es obligatorio"
    }

    if (!formData.telefono || formData.telefono.trim() === "") {
      nuevosErrores.telefono = "El teléfono es obligatorio"
    }

    if (!curriculum) {
      nuevosErrores.curriculum = "Debe adjuntar su currículum"
    }

    if (!formData.terminos) {
      nuevosErrores.terminos = "Debe aceptar los términos y condiciones"
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    // Simular envío exitoso
    setEnviado(true)
    window.scrollTo(0, 0)
  }

  // Resetear el estado de scroll cuando se abre el diálogo
  useEffect(() => {
    if (terminosDialogOpen) {
      setScrolledToBottom(false)
      // Asegurarse de que el scroll comience desde arriba
      if (terminosContentRef.current) {
        terminosContentRef.current.scrollTop = 0
      }
    }
  }, [terminosDialogOpen])

  if (enviado) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <header className="mb-12">
            <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-lg">
                  <Package2Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <span className="text-xl font-bold text-black dark:text-white">SecureHire</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Plataforma de reclutamiento</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full bg-gray-100 dark:bg-gray-700"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Cambiar tema</span>
              </Button>
            </div>
          </header>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 flex flex-col items-center text-center p-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold mb-4">¡Postulación enviada con éxito!</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Gracias por postularte para el puesto de {ofertaEjemplo.titulo}. Hemos recibido tu información y nos
                pondremos en contacto contigo pronto.
              </p>
              <Button asChild>
                <a href="/">Volver al inicio</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <header className="mb-12">
          <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-lg">
                <Package2Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="text-xl font-bold text-black dark:text-white">SecureHire</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Plataforma de reclutamiento</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full bg-gray-100 dark:bg-gray-700"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Cambiar tema</span>
            </Button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-[55%]">
            <Card className="sticky top-6 shadow-lg border-2 border-primary/10">
              <CardHeader>
                <CardTitle className="text-xl">{ofertaEjemplo.titulo}</CardTitle>
                <CardDescription>
                  {ofertaEjemplo.empresa} • {ofertaEjemplo.ubicacion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-medium mb-1">Publicado el</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(ofertaEjemplo.fechaPublicacion, "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-1">Reclutador</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ofertaEjemplo.reclutador}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-base font-medium mb-1">Descripción del puesto</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
                      {ofertaEjemplo.descripcion}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-1">Requisitos</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                      {ofertaEjemplo.requisitos.map((requisito, index) => (
                        <li key={index}>{requisito}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-1">Beneficios</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                      {ofertaEjemplo.beneficios.map((beneficio, index) => (
                        <li key={index}>{beneficio}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-1">Ubicación</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ofertaEjemplo.ubicacion}</p>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-1">Tipo de contrato</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tiempo completo</p>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-1">Salario</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Competitivo (según experiencia)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:w-[45%]">
            <Card>
              <CardHeader>
                <CardTitle>Formulario de postulación</CardTitle>
                <CardDescription>
                  Complete el siguiente formulario para postularse a esta oferta. Los campos marcados con{" "}
                  <span className="text-red-500">*</span> son obligatorios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) => {
                      // Solo permitir cambiar a "preguntas-especificas" mediante el botón continuar
                      if (value === "datos-personales" || activeTab === "preguntas-especificas") {
                        setActiveTab(value)
                      }
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="datos-personales">Datos Personales</TabsTrigger>
                      <TabsTrigger value="preguntas-especificas" disabled={activeTab !== "preguntas-especificas"}>
                        Preguntas Específicas
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="datos-personales" className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">
                            Nombre <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="nombre"
                            placeholder="Ingrese su nombre"
                            value={formData.nombre || ""}
                            onChange={(e) => handleInputChange("nombre", e.target.value)}
                          />
                          {errores.nombre && <p className="text-sm text-red-500">{errores.nombre}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apellido">
                            Apellido <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="apellido"
                            placeholder="Ingrese su apellido"
                            value={formData.apellido || ""}
                            onChange={(e) => handleInputChange("apellido", e.target.value)}
                          />
                          {errores.apellido && <p className="text-sm text-red-500">{errores.apellido}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dni">
                            Documento de Identidad <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="dni"
                            placeholder="Ingrese su Documento de Identidad"
                            value={formData.dni || ""}
                            onChange={(e) => handleInputChange("dni", e.target.value)}
                          />
                          {errores.dni && <p className="text-sm text-red-500">{errores.dni}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fecha-nacimiento">
                            Fecha de nacimiento <span className="text-red-500">*</span>
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="fecha-nacimiento"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !fechaNacimiento && "text-muted-foreground",
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {fechaNacimiento ? (
                                  format(fechaNacimiento, "d 'de' MMMM 'de' yyyy", { locale: es })
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={fechaNacimiento}
                                onSelect={(date) => {
                                  setFechaNacimiento(date)
                                  handleInputChange("fechaNacimiento", date)
                                }}
                                initialFocus
                                locale={es}
                                captionLayout="dropdown-buttons"
                                fromYear={1940}
                                toYear={2006}
                              />
                            </PopoverContent>
                          </Popover>
                          {errores.fechaNacimiento && <p className="text-sm text-red-500">{errores.fechaNacimiento}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="genero">
                            Género <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.genero || ""}
                            onValueChange={(value) => handleInputChange("genero", value)}
                          >
                            <SelectTrigger id="genero">
                              <SelectValue placeholder="Seleccione su género" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="femenino">Femenino</SelectItem>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="no-especificado">No especificado</SelectItem>
                            </SelectContent>
                          </Select>
                          {errores.genero && <p className="text-sm text-red-500">{errores.genero}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nacionalidad">
                            Nacionalidad <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.nacionalidad || ""}
                            onValueChange={(value) => handleInputChange("nacionalidad", value)}
                          >
                            <SelectTrigger id="nacionalidad">
                              <SelectValue placeholder="Seleccione su nacionalidad" />
                            </SelectTrigger>
                            <SelectContent>
                              {paises.map((pais) => (
                                <SelectItem key={pais} value={pais}>
                                  {pais}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errores.nacionalidad && <p className="text-sm text-red-500">{errores.nacionalidad}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paisResidencia">
                          País de residencia <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.paisResidencia || ""}
                          onValueChange={(value) => handleInputChange("paisResidencia", value)}
                        >
                          <SelectTrigger id="paisResidencia">
                            <SelectValue placeholder="Seleccione su país de residencia" />
                          </SelectTrigger>
                          <SelectContent>
                            {paises.map((pais) => (
                              <SelectItem key={pais} value={pais}>
                                {pais}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errores.paisResidencia && <p className="text-sm text-red-500">{errores.paisResidencia}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="provincia">
                          Provincia/Estado <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="provincia"
                          placeholder="Ingrese su provincia o estado"
                          value={formData.provincia || ""}
                          onChange={(e) => handleInputChange("provincia", e.target.value)}
                        />
                        {errores.provincia && <p className="text-sm text-red-500">{errores.provincia}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="direccion">
                          Dirección <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="direccion"
                          placeholder="Ingrese su dirección completa"
                          value={formData.direccion || ""}
                          onChange={(e) => handleInputChange("direccion", e.target.value)}
                        />
                        {errores.direccion && <p className="text-sm text-red-500">{errores.direccion}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="ejemplo@correo.com"
                          value={formData.email || ""}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                        {errores.email && <p className="text-sm text-red-500">{errores.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmarEmail">
                          Confirmar Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="confirmarEmail"
                          type="email"
                          placeholder="ejemplo@correo.com"
                          value={formData.confirmarEmail || ""}
                          onChange={(e) => handleInputChange("confirmarEmail", e.target.value)}
                        />
                        {errores.confirmarEmail && <p className="text-sm text-red-500">{errores.confirmarEmail}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="codigoPais">
                            Código de país <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.codigoPais || ""}
                            onValueChange={(value) => handleInputChange("codigoPais", value)}
                          >
                            <SelectTrigger id="codigoPais">
                              <SelectValue placeholder="Código" />
                            </SelectTrigger>
                            <SelectContent>
                              {codigosPais.map((item) => (
                                <SelectItem key={item.codigo} value={item.codigo}>
                                  {item.pais} ({item.codigo})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errores.codigoPais && <p className="text-sm text-red-500">{errores.codigoPais}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="telefono">
                            Teléfono <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="telefono"
                            placeholder="612345678"
                            value={formData.telefono || ""}
                            onChange={(e) => handleInputChange("telefono", e.target.value)}
                          />
                          {errores.telefono && <p className="text-sm text-red-500">{errores.telefono}</p>}
                        </div>
                      </div>

                      {/* Campo para subir el currículum */}
                      <div className="space-y-2">
                        <Label htmlFor="curriculum">
                          Currículum <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              ref={fileInputRef}
                              id="curriculum"
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Seleccionar archivo
                            </Button>
                          </div>

                          {curriculum ? (
                            <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm truncate max-w-[200px]">{curriculum.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({(curriculum.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={removeFile}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">
                              Formatos permitidos: PDF, DOC, DOCX. Tamaño máximo: 5MB
                            </p>
                          )}
                          {errores.curriculum && <p className="text-sm text-red-500">{errores.curriculum}</p>}
                        </div>
                      </div>

                      {/* Botón para abrir el diálogo de términos y condiciones */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="terminos"
                            checked={formData.terminos || false}
                            onCheckedChange={(checked) => handleInputChange("terminos", checked)}
                          />
                          <div className="flex items-center gap-1">
                            <label
                              htmlFor="terminos"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Acepto los
                            </label>
                            <Button
                              type="button"
                              variant="link"
                              className="h-auto p-0 text-sm font-medium"
                              onClick={() => setTerminosDialogOpen(true)}
                            >
                              términos y condiciones
                            </Button>
                            <span className="text-red-500">*</span>
                          </div>
                        </div>
                        {errores.terminos && <p className="text-sm text-red-500">{errores.terminos}</p>}
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => {
                            // Validar campos básicos antes de continuar
                            const nuevosErrores: Record<string, string> = {}

                            if (!formData.nombre || formData.nombre.trim() === "") {
                              nuevosErrores.nombre = "El nombre es obligatorio"
                            }

                            if (!formData.apellido || formData.apellido.trim() === "") {
                              nuevosErrores.apellido = "El apellido es obligatorio"
                            }

                            if (!formData.dni || formData.dni.trim() === "") {
                              nuevosErrores.dni = "El documento de identidad es obligatorio"
                            }

                            if (!fechaNacimiento) {
                              nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria"
                            }

                            if (!formData.genero) {
                              nuevosErrores.genero = "El género es obligatorio"
                            }

                            if (!formData.nacionalidad) {
                              nuevosErrores.nacionalidad = "La nacionalidad es obligatoria"
                            }

                            if (!formData.paisResidencia) {
                              nuevosErrores.paisResidencia = "El país de residencia es obligatorio"
                            }

                            if (!formData.provincia) {
                              nuevosErrores.provincia = "La provincia/estado es obligatorio"
                            }

                            if (!formData.direccion) {
                              nuevosErrores.direccion = "La dirección es obligatoria"
                            }

                            if (!formData.email || formData.email.trim() === "") {
                              nuevosErrores.email = "El email es obligatorio"
                            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                              nuevosErrores.email = "El email no es válido"
                            }

                            if (!formData.confirmarEmail || formData.confirmarEmail.trim() === "") {
                              nuevosErrores.confirmarEmail = "Debe confirmar su email"
                            } else if (formData.email !== formData.confirmarEmail) {
                              nuevosErrores.confirmarEmail = "Los emails no coinciden"
                            }

                            if (!formData.codigoPais) {
                              nuevosErrores.codigoPais = "El código de país es obligatorio"
                            }

                            if (!formData.telefono || formData.telefono.trim() === "") {
                              nuevosErrores.telefono = "El teléfono es obligatorio"
                            }

                            if (!curriculum) {
                              nuevosErrores.curriculum = "Debe adjuntar su currículum"
                            }

                            if (!formData.terminos) {
                              nuevosErrores.terminos = "Debe aceptar los términos y condiciones"
                            }

                            if (Object.keys(nuevosErrores).length > 0) {
                              setErrores(nuevosErrores)
                              return
                            }

                            // Si no hay errores, avanzar a la siguiente pestaña
                            setActiveTab("preguntas-especificas")
                          }}
                        >
                          Continuar
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="preguntas-especificas" className="space-y-6 pt-4">
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Preguntas específicas para el puesto</h3>

                        {ofertaEjemplo.formulario.campos.map((campo) => (
                          <div key={campo.id} className="space-y-2">
                            <Label htmlFor={campo.id}>
                              {campo.etiqueta}
                              {campo.esExcluyente && <span className="text-red-500"> *</span>}
                            </Label>

                            {campo.tipo === "texto" && (
                              <Input
                                id={campo.id}
                                placeholder={campo.placeholder}
                                value={formData[campo.id] || ""}
                                onChange={(e) => handleInputChange(campo.id, e.target.value)}
                              />
                            )}

                            {campo.tipo === "textarea" && (
                              <Textarea
                                id={campo.id}
                                placeholder={campo.placeholder}
                                value={formData[campo.id] || ""}
                                onChange={(e) => handleInputChange(campo.id, e.target.value)}
                                className="min-h-[120px]"
                              />
                            )}

                            {campo.tipo === "checkbox" && (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={campo.id}
                                  checked={formData[campo.id] || false}
                                  onCheckedChange={(checked) => handleInputChange(campo.id, checked)}
                                />
                                <label
                                  htmlFor={campo.id}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Sí
                                </label>
                              </div>
                            )}

                            {campo.tipo === "dropdown" && campo.opciones && (
                              <Select
                                value={formData[campo.id] || ""}
                                onValueChange={(value) => handleInputChange(campo.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione una opción" />
                                </SelectTrigger>
                                <SelectContent>
                                  {campo.opciones.map((opcion) => (
                                    <SelectItem key={opcion} value={opcion}>
                                      {opcion}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            {errores[campo.id] && <p className="text-sm text-red-500">{errores[campo.id]}</p>}
                          </div>
                        ))}

                        <div className="flex justify-between">
                          <Button type="button" variant="outline" onClick={() => setActiveTab("datos-personales")}>
                            Volver
                          </Button>
                          <Button type="submit">Enviar postulación</Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Diálogo de Términos y Condiciones */}
      <Dialog open={terminosDialogOpen} onOpenChange={setTerminosDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              Términos y Condiciones
            </DialogTitle>
            <DialogDescription>
              Por favor, lea atentamente los siguientes términos y condiciones antes de continuar.
            </DialogDescription>
          </DialogHeader>

          <div
            ref={terminosContentRef}
            className="flex-1 overflow-y-auto pr-2 my-4 text-sm"
            onScroll={handleScroll}
            style={{ maxHeight: "50vh" }}
          >
            <pre className="whitespace-pre-wrap font-sans">{terminosYCondiciones}</pre>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <div className="text-xs text-muted-foreground italic mb-2 sm:mb-0">
              {!scrolledToBottom && "Por favor, desplácese hasta el final para continuar"}
            </div>
            <Button onClick={handleAceptarTerminos} disabled={!scrolledToBottom} className="ml-auto">
              Aceptar y Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
