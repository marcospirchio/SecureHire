"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, CalendarIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OfertaPage({ params }: { params: { id: string } }) {
  // Estados para el formulario
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
  const [curriculum, setCurriculum] = useState<File | null>(null)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [termsRead, setTermsRead] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const termsRef = useRef<HTMLDivElement>(null)

  // Datos de ejemplo de la oferta (en una aplicación real, estos datos vendrían de una API)
  const oferta = {
    id: params.id,
    titulo: "Desarrollador Frontend",
    empresa: "SecureHire",
    ubicacion: "Madrid, España",
    modalidad: "Remoto",
    fechaPublicacion: "15 de abril de 2025",
    reclutador: "Carlos Rodríguez",
    descripcion: `Buscamos un desarrollador frontend con experiencia en React y TypeScript para unirse a nuestro equipo. 
    El candidato ideal tendrá experiencia en el desarrollo de aplicaciones web modernas y conocimientos de buenas prácticas de desarrollo.
    
    Además de los conocimientos técnicos, valoramos la capacidad de trabajar en equipo, la proactividad y la pasión por el desarrollo de software. Ofrecemos un ambiente de trabajo dinámico y desafiante, con oportunidades de crecimiento profesional y personal.`,
    requisitos: [
      "Experiencia mínima de 3 años en desarrollo frontend",
      "Conocimientos sólidos de React, TypeScript y HTML/CSS",
      "Experiencia con herramientas modernas de desarrollo web",
      "Capacidad para trabajar en equipo y comunicarse efectivamente",
    ],
  }

  // Función para manejar el scroll en los términos y condiciones
  const handleTermsScroll = () => {
    if (!termsRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = termsRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10

    if (isAtBottom && !termsRead) {
      setTermsRead(true)
    }
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulación de envío de datos a un servidor
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setSuccess(true)
    setLoading(false)
  }

  // Términos y condiciones
  const termsAndConditions = `
TÉRMINOS Y CONDICIONES DE USO

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

Al aceptar estos Términos y Condiciones, el usuario declara haber leído, entendido y aceptado todas las cláusulas aquí expuestas, autorizando expresamente el tratamiento de sus datos personales según la normativa vigente.
  `

  // Si la postulación fue exitosa, mostrar mensaje de confirmación
  if (success) {
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
            Gracias por postularte al puesto de {oferta.titulo}. Hemos recibido tu información y la revisaremos a la
            brevedad. Te contactaremos pronto con novedades sobre tu postulación.
          </p>
          <Button onClick={() => (window.location.href = "/")}>Volver al inicio</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información de la oferta */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-2">{oferta.titulo}</h1>
            <p className="text-gray-600 mb-4">
              {oferta.empresa} • {oferta.ubicacion} ({oferta.modalidad})
            </p>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Publicado el</p>
              <p className="text-gray-600">{oferta.fechaPublicacion}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Reclutador</p>
              <p className="text-gray-600">{oferta.reclutador}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Descripción del puesto</h2>
              <p className="text-gray-600 whitespace-pre-line">{oferta.descripcion}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Requisitos</h2>
              <ul className="list-disc pl-5 text-gray-600">
                {oferta.requisitos.map((requisito, index) => (
                  <li key={index} className="mb-1">
                    {requisito}
                  </li>
                ))}
              </ul>
            </div>
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
                <form onSubmit={handleSubmit}>
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
                    <Textarea
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
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setCurriculum(e.target.files[0])
                          }
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
                              Formatos permitidos: PDF, DOC, DOCX. Tamaño máximo: 5MB
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
                      {termsAndConditions}
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
                        !aceptaTerminos ||
                        loading
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loading ? (
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
                <div className="p-8 text-center">
                  <h3 className="text-lg font-medium mb-2">Preguntas específicas</h3>
                  <p className="text-gray-600 mb-4">Esta oferta no tiene preguntas específicas adicionales.</p>
                  <Button onClick={() => setTab("datos")} variant="outline">
                    Volver a datos personales
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
