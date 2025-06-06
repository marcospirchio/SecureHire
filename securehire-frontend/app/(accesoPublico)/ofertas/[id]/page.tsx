"use client"

import type React from "react"
import { useState, useRef, use } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, CalendarIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePublicJobOffer } from "@/hooks/use-job-offer"
import { TERMS_AND_CONDITIONS } from "@/constants/terms-and-conditions"
import { toast } from "@/components/ui/use-toast"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface SuccessMessageProps {
  jobTitle: string
  onBackToHome?: () => void
}

export function SuccessMessage({ jobTitle, onBackToHome }: SuccessMessageProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">¡Postulación enviada con éxito!</h1>
        <p className="text-gray-600 mb-8">
          Gracias por postularte al puesto de {jobTitle}. Hemos recibido tu información y la revisaremos a la brevedad.
          Te contactaremos pronto con novedades sobre tu postulación.
        </p>
        <Button onClick={onBackToHome || (() => window.location.href = "/")}>
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}

export default function OfertaPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const { jobOffer, loading, error } = usePublicJobOffer(resolvedParams.id)
  
  const [tab, setTab] = useState("datos")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [documento, setDocumento] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [genero, setGenero] = useState("")
  const [nacionalidad, setNacionalidad] = useState("")
  const [pais, setPais] = useState("")
  const [provincia, setProvincia] = useState("")
  const [direccion, setDireccion] = useState("")
  const [email, setEmail] = useState("")
  const [emailConfirmacion, setEmailConfirmacion] = useState("")
  const [telefono, setTelefono] = useState("")
  const [codigoPais, setCodigoPais] = useState("")
  const [cvUrl, setCvUrl] = useState("")
  const [curriculum, setCurriculum] = useState<File | null>(null)
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [termsRead, setTermsRead] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [respuestasAdicionales, setRespuestasAdicionales] = useState<Record<string, string | string[]>>({})
  const [subiendo, setSubiendo] = useState(false)

  const termsRef = useRef<HTMLDivElement>(null)

  const handleTermsScroll = () => {
    if (!termsRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = termsRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10

    if (isAtBottom && !termsRead) {
      setTermsRead(true)
    }
  }

  const handleRespuestaChange = (campo: string, valor: string | string[]) => {
    setRespuestasAdicionales(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const renderCampoAdicional = (campo: any) => {
    switch (campo.tipo) {
      case 'select':
        return (
          <div key={campo.nombre} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {campo.nombre} {campo.obligatorio && <span className="text-red-500">*</span>}
            </label>
            <Select
              value={respuestasAdicionales[campo.nombre] as string || ""}
              onValueChange={(value) => handleRespuestaChange(campo.nombre, value)}
              required={campo.obligatorio}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Seleccione una opción`} />
              </SelectTrigger>
              <SelectContent>
                {campo.opciones.map((opcion: string) => (
                  <SelectItem key={opcion} value={opcion}>
                    {opcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'checkbox':
        return (
          <div key={campo.nombre} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {campo.nombre} {campo.obligatorio && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {campo.opciones.map((opcion: string) => (
                <div key={opcion} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${campo.nombre}-${opcion}`}
                    checked={(respuestasAdicionales[campo.nombre] as string[] || []).includes(opcion)}
                    onCheckedChange={(checked) => {
                      const currentValues = respuestasAdicionales[campo.nombre] as string[] || []
                      const newValues = checked
                        ? [...currentValues, opcion]
                        : currentValues.filter(v => v !== opcion)
                      handleRespuestaChange(campo.nombre, newValues)
                    }}
                  />
                  <label
                    htmlFor={`${campo.nombre}-${opcion}`}
                    className="text-sm text-gray-700"
                  >
                    {opcion}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )

      case 'texto':
        return (
          <div key={campo.nombre} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {campo.nombre} {campo.obligatorio && <span className="text-red-500">*</span>}
            </label>
            <Input
              value={respuestasAdicionales[campo.nombre] as string || ""}
              onChange={(e) => handleRespuestaChange(campo.nombre, e.target.value)}
              required={campo.obligatorio}
            />
          </div>
        )

      default:
        return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    const respuestas = (jobOffer?.camposAdicionales || [])
      .map((campo: any) => {
        const respuesta = respuestasAdicionales[campo.nombre];
        if (!respuesta || (typeof respuesta === 'string' && respuesta.trim() === '')) {
          return null;
        }
        return { campo: campo.nombre, respuesta };
      })
      .filter(Boolean);
  
    try {
      const formData = new FormData();
      formData.append("busquedaId", resolvedParams.id);
      formData.append("nombre", nombre);
      formData.append("apellido", apellido);
      formData.append("email", email);
      formData.append("telefono", telefono);
      formData.append("dni", documento);
      formData.append("codigoPais", codigoPais);
      formData.append("fechaNacimiento", fechaNacimiento); 
      formData.append("genero", genero);
      formData.append("nacionalidad", nacionalidad);
      formData.append("paisResidencia", pais);
      formData.append("provincia", provincia);
      formData.append("direccion", direccion);
      formData.append("respuestas", JSON.stringify(respuestas));
      
      if (curriculum) {
        formData.append("cv", curriculum); 
      }

      if (fotoPerfil) {
        formData.append("fotoPerfil", fotoPerfil);
      }
  
      const response = await fetch("http://localhost:8080/api/postulaciones", {
        method: "POST",
        body: formData 
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Error en la postulación");
      }
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Hubo un error al enviar la postulación.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isDatosPersonalesCompleto = () => {
    return nombre && 
           apellido && 
           documento && 
           fechaNacimiento && 
           genero && 
           nacionalidad && 
           pais && 
           provincia && 
           direccion && 
           email && 
           emailConfirmacion && 
           email === emailConfirmacion && 
           codigoPais && 
           telefono && 
           curriculum && 
           fotoPerfil &&
           aceptaTerminos;
  };

  const isPreguntasCompletas = () => {
    if (!jobOffer?.camposAdicionales?.length) return true;
    
    return jobOffer.camposAdicionales.every((campo: any) => {
      const respuesta = respuestasAdicionales[campo.nombre];
      if (campo.obligatorio) {
        if (Array.isArray(respuesta)) {
          return respuesta.length > 0;
        }
        return respuesta && respuesta.trim() !== '';
      }
      return true;
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          Error al cargar la oferta: {error}
        </div>
      </div>
    )
  }

  if (!jobOffer) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-600">
          No se encontró la oferta solicitada
        </div>
      </div>
    )
  }

  if (success) {
    return <SuccessMessage jobTitle={jobOffer.titulo} />
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información de la oferta */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-2">{jobOffer.titulo}</h1>
            <p className="text-gray-600 mb-4">
              {jobOffer.empresa} • {jobOffer.ubicacion} ({jobOffer.modalidad})
            </p>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Tipo de contrato</p>
              <p className="text-gray-600">{jobOffer.tipoContrato}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Salario</p>
              <p className="text-gray-600">{jobOffer.salario}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Publicado el</p>
              <p className="text-gray-600">{jobOffer.fechaCreacion}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Descripción del puesto</h2>
              <p className="text-gray-600 whitespace-pre-line">{jobOffer.descripcion}</p>
            </div>

            {jobOffer.beneficios && jobOffer.beneficios.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Beneficios</h2>
                <ul className="list-disc pl-5 text-gray-600">
                  {jobOffer.beneficios.map((beneficio: string, index: number) => (
                    <li key={index} className="mb-1">
                      {beneficio}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Formulario de postulación */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-2">Formulario de postulación</h2>
            <p className="text-gray-600 mb-6">
              Complete el siguiente formulario para postularse a esta oferta. Los campos marcados con{" "}
              <span className="text-red-500">*</span> son obligatorios.
            </p>

            <Tabs value={tab} onValueChange={setTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="datos">Datos Personales</TabsTrigger>
                <TabsTrigger value="preguntas">Preguntas Específicas</TabsTrigger>
              </TabsList>

              <TabsContent value="datos" className="pt-4">
                <form onSubmit={(e) => {
                  e.preventDefault()
                  
                  if (nombre && apellido && documento && fechaNacimiento && genero && nacionalidad && pais && provincia && direccion && email && emailConfirmacion && email === emailConfirmacion && codigoPais && telefono && curriculum && fotoPerfil && aceptaTerminos) {
                    setTab("preguntas")
                  }
                }}>
                  {/* Nombre y Apellido */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Ingrese su nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Ingrese su apellido"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Documento y Fecha de nacimiento */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Documento de Identidad <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Ingrese su Documento de Identidad"
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de nacimiento <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={fechaNacimiento}
                          onChange={(e) => setFechaNacimiento(e.target.value)}
                          required
                          className="pl-10"
                        />
                        <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Género y Nacionalidad */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Género <span className="text-red-500">*</span>
                      </label>
                      <Select value={genero} onValueChange={setGenero} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione su género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                          <SelectItem value="no-especificar">Prefiero no especificar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nacionalidad <span className="text-red-500">*</span>
                      </label>
                      <Select value={nacionalidad} onValueChange={setNacionalidad} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione su nacionalidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="argentina">Argentina</SelectItem>
                          <SelectItem value="brasil">Brasil</SelectItem>
                          <SelectItem value="chile">Chile</SelectItem>
                          <SelectItem value="colombia">Colombia</SelectItem>
                          <SelectItem value="espana">España</SelectItem>
                          <SelectItem value="mexico">México</SelectItem>
                          <SelectItem value="peru">Perú</SelectItem>
                          <SelectItem value="uruguay">Uruguay</SelectItem>
                          <SelectItem value="venezuela">Venezuela</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* País de residencia y Provincia */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        País de residencia <span className="text-red-500">*</span>
                      </label>
                      <Select value={pais} onValueChange={setPais} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione su país de residencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="argentina">Argentina</SelectItem>
                          <SelectItem value="brasil">Brasil</SelectItem>
                          <SelectItem value="chile">Chile</SelectItem>
                          <SelectItem value="colombia">Colombia</SelectItem>
                          <SelectItem value="espana">España</SelectItem>
                          <SelectItem value="mexico">México</SelectItem>
                          <SelectItem value="peru">Perú</SelectItem>
                          <SelectItem value="uruguay">Uruguay</SelectItem>
                          <SelectItem value="venezuela">Venezuela</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provincia/Estado <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Ingrese su provincia o estado"
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Ingrese su dirección completa"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email y Confirmación de Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={emailConfirmacion}
                        onChange={(e) => setEmailConfirmacion(e.target.value)}
                        required
                      />
                      {email && emailConfirmacion && email !== emailConfirmacion && (
                        <p className="text-red-500 text-sm mt-1">Los emails no coinciden</p>
                      )}
                    </div>
                  </div>

                  {/* Código de país y Teléfono */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código de país <span className="text-red-500">*</span>
                      </label>
                      <Select value={codigoPais} onValueChange={setCodigoPais} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Código" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+54">Argentina (+54)</SelectItem>
                          <SelectItem value="+55">Brasil (+55)</SelectItem>
                          <SelectItem value="+56">Chile (+56)</SelectItem>
                          <SelectItem value="+57">Colombia (+57)</SelectItem>
                          <SelectItem value="+34">España (+34)</SelectItem>
                          <SelectItem value="+52">México (+52)</SelectItem>
                          <SelectItem value="+51">Perú (+51)</SelectItem>
                          <SelectItem value="+598">Uruguay (+598)</SelectItem>
                          <SelectItem value="+58">Venezuela (+58)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        placeholder="612345678"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Foto de Perfil */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foto de Perfil <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50">
                      <input
                        type="file"
                        id="fotoPerfil"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (!file.type.startsWith('image/')) {
                            toast({
                              title: "Error",
                              description: "Por favor, seleccioná una imagen válida.",
                              variant: "destructive",
                            });
                            e.target.value = "";
                            return;
                          }

                          if (file.size > 5 * 1024 * 1024) {
                            toast({
                              title: "Error",
                              description: "La imagen excede el tamaño máximo de 5MB.",
                              variant: "destructive",
                            });
                            e.target.value = "";
                            return;
                          }

                          setFotoPerfil(file);
                        }}
                      />
                      <label htmlFor="fotoPerfil" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        {fotoPerfil ? (
                          <span className="text-blue-600 font-medium">{fotoPerfil.name}</span>
                        ) : (
                          <>
                            <span className="text-gray-700 font-medium">Seleccionar foto de perfil</span>
                            <span className="text-gray-500 text-sm mt-1">
                              Formatos permitidos: JPG, PNG. Tamaño máximo: 5MB
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Curriculum */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currículum <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50">
                      <input
                        type="file"
                        id="curriculum"
                        className="hidden"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          if (file.type !== "application/pdf") {
                            alert("Por favor, seleccioná un archivo PDF.");
                            e.target.value = "";
                            return;
                          }

                          if (file.size > 10 * 1024 * 1024) {
                            alert("El archivo excede el tamaño máximo de 10MB.");
                            e.target.value = "";
                            return;
                          }

                          setCurriculum(file);
                        }}
                      />
                      <label htmlFor="curriculum" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        {curriculum ? (
                          <span className="text-blue-600 font-medium">{curriculum.name}</span>
                        ) : (
                          <>
                            <span className="text-gray-700 font-medium">Seleccionar archivo</span>
                            <span className="text-gray-500 text-sm mt-1">
                              Único formato permitido: PDF. Tamaño máximo: 10MB
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Términos y condiciones */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Términos y condiciones <span className="text-red-500">*</span>
                    </label>

                    <div
                      ref={termsRef}
                      onScroll={handleTermsScroll}
                      className="border border-gray-300 rounded-md p-4 h-60 overflow-y-auto mb-3 text-sm text-gray-700 whitespace-pre-line"
                    >
                      {TERMS_AND_CONDITIONS}
                    </div>

                    {!termsRead && (
                      <p className="text-amber-600 text-sm mb-3">
                        Por favor, desplácese hasta el final para poder aceptar los términos y condiciones.
                      </p>
                    )}

                    {termsRead && (
                      <p className="text-green-600 text-sm mb-3">
                        Gracias por leer los términos y condiciones. Ahora puede marcar la casilla para aceptarlos.
                      </p>
                    )}

                    <div className="flex items-start">
                      <Checkbox
                        id="terminos"
                        checked={aceptaTerminos}
                        onCheckedChange={(checked) => setAceptaTerminos(checked as boolean)}
                        disabled={!termsRead}
                        className="mt-1"
                      />
                      <label
                        htmlFor="terminos"
                        className={`ml-2 text-sm ${!termsRead ? "text-gray-400" : "text-gray-700"}`}
                      >
                        Acepto los términos y condiciones <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>

                  {/* Botón de envío */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        !nombre ||
                        !apellido ||
                        !documento ||
                        !fechaNacimiento ||
                        !genero ||
                        !nacionalidad ||
                        !pais ||
                        !provincia ||
                        !direccion ||
                        !email ||
                        !emailConfirmacion ||
                        email !== emailConfirmacion ||
                        !codigoPais ||
                        !telefono ||
                        !curriculum ||
                        !fotoPerfil ||
                        !aceptaTerminos ||
                        isSubmitting
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          Enviando...
                        </>
                      ) : (
                        "Continuar"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="preguntas" className="pt-4">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {jobOffer?.camposAdicionales && jobOffer.camposAdicionales.length > 0 ? (
                      jobOffer.camposAdicionales.map(campo => renderCampoAdicional(campo))
                    ) : (
                      <div className="p-8 text-center">
                        <h3 className="text-lg font-medium mb-2">Preguntas específicas</h3>
                        <p className="text-gray-600 mb-4">Esta oferta no tiene preguntas específicas adicionales.</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-6">
                    <Button onClick={() => setTab("datos")} variant="outline">
                      Volver a datos personales
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !isPreguntasCompletas()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          Enviando...
                        </>
                      ) : (
                        "Enviar postulación"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
