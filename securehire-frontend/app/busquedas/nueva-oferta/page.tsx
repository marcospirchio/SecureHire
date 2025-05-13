"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Check, Square, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export default function NuevaOfertaPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("preguntas")
  const [benefits, setBenefits] = useState([
    "Horario flexible",
    "Trabajo remoto",
    "Seguro médico",
    "Oportunidades de crecimiento profesional",
  ])
  const [newBenefit, setNewBenefit] = useState("")

  // Función para volver a la página anterior
  const handleGoBack = () => {
    router.back()
  }

  // Función para añadir un nuevo beneficio
  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()])
      setNewBenefit("")
    }
  }

  // Función para eliminar un beneficio
  const handleRemoveBenefit = (index: number) => {
    const updatedBenefits = [...benefits]
    updatedBenefits.splice(index, 1)
    setBenefits(updatedBenefits)
  }

  return (
    <Sidebar>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Encabezado */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Nueva oferta</h1>
          </div>

          {/* Contenido principal */}
          <div className="space-y-8">
            {/* Información básica */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Información básica</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="jobTitle" className="block font-medium mb-1">
                    Título del puesto: <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    placeholder="Ej: Contador Semi Senior"
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block font-medium mb-1">
                      Empresa: <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="company"
                      type="text"
                      placeholder="Ej: Acme Inc."
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block font-medium mb-1">
                      Ubicación: <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="location"
                      type="text"
                      placeholder="Ej: Buenos Aires"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="workMode" className="block font-medium mb-1">
                    Modalidad:
                  </label>
                  <div className="relative">
                    <select id="workMode" className="w-full p-2 border rounded-md appearance-none pr-10">
                      <option value="presencial">Presencial</option>
                      <option value="remoto">Remoto</option>
                      <option value="hibrido">Híbrido</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block font-medium mb-1">
                    Descripción del puesto: <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Describe las responsabilidades, requisitos y expectativas del puesto..."
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </section>

            {/* Pestañas para preguntas específicas y formulario obligatorio */}
            <section>
              <div className="flex justify-between items-center mb-2">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Nuevo!</div>
                <p className="text-gray-600">Ahora puedes marcar qué campos son requisitos excluyentes</p>
              </div>

              <Tabs defaultValue="preguntas" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="preguntas">Preguntas Específicas</TabsTrigger>
                  <TabsTrigger value="formulario">Formulario Obligatorio</TabsTrigger>
                </TabsList>

                <TabsContent value="preguntas" className="bg-white p-4 rounded-lg border">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Escribe tu pregunta aquí" className="p-2 border rounded-md" />
                      <div className="flex items-center gap-2 border rounded-md p-2">
                        <Check className="h-5 w-5" />
                        <span>Casillas de verificación</span>
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <div className="flex items-center gap-2">
                          <Square className="h-4 w-4 text-gray-400" />
                          <span>Sí</span>
                        </div>
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <div className="flex items-center gap-2">
                          <Square className="h-4 w-4 text-gray-400" />
                          <span>No</span>
                        </div>
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <button className="text-gray-500 flex items-center gap-1">
                      <Plus className="h-4 w-4" /> Agregar otra opción
                    </button>

                    <div className="flex items-center justify-between mt-4">
                      <Trash2 className="h-4 w-4 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <span>Excluyente</span>
                        <Switch />
                      </div>
                    </div>

                    <div className="flex justify-center mt-6">
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Nueva pregunta
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="formulario" className="bg-white p-4 rounded-lg border">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Datos personales (obligatorios)</h3>
                    <p className="text-gray-600 mb-4">
                      Estos campos se solicitarán automáticamente a todos los candidatos:
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded p-1">
                          <Check className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>Nombre</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded p-1">
                          <Check className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>Apellido</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded p-1">
                          <Check className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>Email</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded p-1">
                          <Check className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>Teléfono</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded p-1">
                          <Check className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>DNI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded p-1">
                          <Check className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>Fecha de nacimiento</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded p-1">
                          <Check className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>Género</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded p-1">
                          <Check className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>Nacionalidad</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded p-1">
                          <Check className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>País de residencia</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded p-1">
                          <Check className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>Provincia</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded p-1">
                          <Check className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>Dirección</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-200 rounded p-1">
                          <Check className="h-4 w-4 text-gray-600" />
                        </div>
                        <span>Curriculum Vitae</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </section>

            {/* Beneficios */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Beneficios:</h2>
                <Button onClick={handleAddBenefit} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Añadir
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center justify-between border rounded-md p-3 mb-2 bg-white">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">-</span>
                      <span>{benefit}</span>
                    </div>
                    <button onClick={() => handleRemoveBenefit(index)}>
                      <Trash2 className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Tipo de contrato y Salario */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contractType" className="block font-medium mb-1">
                  Tipo de contrato:
                </label>
                <div className="relative">
                  <select id="contractType" className="w-full p-2 border rounded-md appearance-none pr-10">
                    <option value="fullTime">Tiempo completo</option>
                    <option value="partTime">Tiempo parcial</option>
                    <option value="freelance">Freelance</option>
                    <option value="contract">Contrato por obra</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="salary" className="block font-medium mb-1">
                  Salario:
                </label>
                <input
                  id="salary"
                  type="text"
                  placeholder="Competitivo (según experiencia)"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </section>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline">Cancelar</Button>
              <Button>Publicar oferta</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </Sidebar>
  )
}
