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

interface CampoAdicional {
  nombre: string;
  tipo: "texto" | "select" | "checkbox";
  esExcluyente: boolean;
  opciones: string[];
  valoresExcluyentes: string[];
  opcionesObligatorias: string[];
}

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

  // Estado para los campos obligatorios
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("presencial");
  const [description, setDescription] = useState("");
  const [contractType, setContractType] = useState("fullTime");
  const [salary, setSalary] = useState("");
  const [phases, setPhases] = useState(["Preselección", "Entrevista", "Oferta"]);
  const [urlPublica, setUrlPublica] = useState("");

  // Estado y helpers para preguntas adicionales con opciones excluyentes
  const [preguntas, setPreguntas] = useState([
    {
      texto: "",
      tipo: "checkbox", // "checkbox" (opción múltiple) o "radio" (opción única)
      opciones: [
        { valor: "Sí", excluyente: false },
        { valor: "No", excluyente: false }
      ],
    },
  ]);

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

  // Función para eliminar una pregunta
  const handleRemovePregunta = (index: number) => {
    const updated = [...preguntas];
    updated.splice(index, 1);
    setPreguntas(updated);
  };

  // Manejar publicación de la oferta
  const handlePublish = async () => {
    // Armar camposPorDefecto
    const camposPorDefecto = [
      {
        nombre: "Nombre completo",
        tipo: "texto",
        esExcluyente: false,
        opciones: [],
        valoresExcluyentes: [],
        opcionesObligatorias: []
      },
      {
        nombre: "Email",
        tipo: "texto",
        esExcluyente: false,
        opciones: [],
        valoresExcluyentes: [],
        opcionesObligatorias: []
      },
      {
        nombre: "CV",
        tipo: "file",
        esExcluyente: false,
        opciones: [],
        valoresExcluyentes: [],
        opcionesObligatorias: []
      }
    ];

    // Armar el body
    const camposAdicionales = preguntas
      .filter(preg => preg.texto.trim() !== "") // Solo incluir preguntas con texto
      .map(preg => ({
        nombre: preg.texto,
        tipo: preg.tipo === "radio" ? "select" : "checkbox",
        esExcluyente: false,
        opciones: preg.opciones.map(op => op.valor),
        valoresExcluyentes: preg.opciones.filter(op => op.excluyente).map(op => op.valor),
      }));

    const body = {
      titulo: jobTitle,
      descripcion: description,
      empresa: company,
      ubicacion: location,
      modalidad: workMode,
      tipoContrato: contractType,
      salario: salary,
      camposPorDefecto,
      camposAdicionales,
      fases: phases,
      urlPublica: urlPublica || undefined
    };

    try {
      const res = await fetch("http://localhost:8080/api/busquedas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Error al crear la búsqueda");
      // Redirigir o mostrar éxito
      router.push("/busquedas");
    } catch (err) {
      alert("Error al crear la búsqueda");
      console.error(err);
    }
  };

  const handlePreguntaChange = (idx: number, field: string, value: any) => {
    const updated = [...preguntas];
    (updated[idx] as any)[field] = value;
    setPreguntas(updated);
  };

  const handleOpcionChange = (qIdx: number, opIdx: number, value: string) => {
    const updated = [...preguntas];
    updated[qIdx].opciones[opIdx].valor = value;
    setPreguntas(updated);
  };

  const handleAddOpcion = (qIdx: number) => {
    const updated = [...preguntas];
    updated[qIdx].opciones.push({ valor: "", excluyente: false });
    setPreguntas(updated);
  };

  const handleRemoveOpcion = (qIdx: number, opIdx: number) => {
    const updated = [...preguntas];
    updated[qIdx].opciones.splice(opIdx, 1);
    setPreguntas(updated);
  };

  const handleToggleExcluyente = (qIdx: number, opIdx: number) => {
    const updated = [...preguntas];
    if (updated[qIdx].tipo === "radio") {
      // Solo una opción excluyente
      updated[qIdx].opciones = updated[qIdx].opciones.map((op, i) => ({ ...op, excluyente: i === opIdx }));
    } else {
      updated[qIdx].opciones[opIdx].excluyente = !updated[qIdx].opciones[opIdx].excluyente;
    }
    setPreguntas(updated);
  };

  const handleAddPregunta = () => {
    setPreguntas([
      ...preguntas,
      {
        texto: "",
        tipo: "checkbox",
        opciones: [
          { valor: "Sí", excluyente: false },
          { valor: "No", excluyente: false }
        ],
      },
    ]);
  };

  return (
    <Sidebar>
      <DashboardLayout>
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-8 mb-8 border border-gray-100">
          {/* Encabezado */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Nueva oferta</h1>
          </div>

          {/* Contenido principal */}
          <div className="space-y-10">
            {/* Información básica */}
            <section className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Información básica</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="jobTitle" className="block font-medium mb-1 text-gray-700">
                    Título del puesto: <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    placeholder="Ej: Contador Semi Senior"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company" className="block font-medium mb-1 text-gray-700">
                      Empresa: <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="company"
                      type="text"
                      placeholder="Ej: Acme Inc."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block font-medium mb-1 text-gray-700">
                      Ubicación: <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="location"
                      type="text"
                      placeholder="Ej: Buenos Aires"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="workMode" className="block font-medium mb-1 text-gray-700">
                    Modalidad:
                  </label>
                  <div className="relative">
                    <select
                      id="workMode"
                      className="w-full p-3 border border-gray-200 rounded-lg appearance-none pr-10 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                      value={workMode}
                      onChange={e => setWorkMode(e.target.value)}
                    >
                      <option value="presencial">Presencial</option>
                      <option value="remoto">Remoto</option>
                      <option value="hibrido">Híbrido</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block font-medium mb-1 text-gray-700">
                    Descripción del puesto: <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Describe las responsabilidades, requisitos y expectativas del puesto..."
                    className="min-h-[120px] w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Beneficios */}
            <section className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Beneficios:</h2>
                <Button onClick={handleAddBenefit} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Añadir
                </Button>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center justify-between border border-gray-100 rounded-md p-3 mb-2 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">-</span>
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
            <section className="bg-gray-50 rounded-xl p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contractType" className="block font-medium mb-1 text-gray-700">
                  Tipo de contrato:
                </label>
                <div className="relative">
                  <select
                    id="contractType"
                    className="w-full p-3 border border-gray-200 rounded-lg appearance-none pr-10 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                    value={contractType}
                    onChange={e => setContractType(e.target.value)}
                  >
                    <option value="fullTime">Tiempo completo</option>
                    <option value="partTime">Tiempo parcial</option>
                    <option value="freelance">Freelance</option>
                    <option value="contract">Contrato por obra</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label htmlFor="salary" className="block font-medium mb-1 text-gray-700">
                  Salario:
                </label>
                <input
                  id="salary"
                  type="text"
                  placeholder="Competitivo (según experiencia)"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                />
              </div>
            </section>

            {/* Preguntas adicionales */}
            <section className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Nuevo!</div>
                <p className="text-gray-600">Marca las opciones excluyentes para filtrar candidatos automáticamente</p>
              </div>
              <Tabs defaultValue="preguntas" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="preguntas">Preguntas Específicas</TabsTrigger>
                  <TabsTrigger value="formulario">Formulario Obligatorio</TabsTrigger>
                </TabsList>

                <TabsContent value="preguntas" className="bg-white p-4 rounded-lg border">
                  <div className="space-y-4">
                    {preguntas.map((preg, idx) => (
                      <div key={idx} className="space-y-4 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                        <div className="flex justify-between items-start">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                            <input
                              type="text"
                              placeholder="Escribe tu pregunta aquí"
                              className="p-2 border rounded-md"
                              value={preg.texto}
                              onChange={e => handlePreguntaChange(idx, "texto", e.target.value)}
                            />
                            <div className="flex items-center gap-2 border rounded-md p-2">
                              <Check className="h-5 w-5" />
                              <span>
                                {preg.tipo === "checkbox" ? "Casillas de verificación" : "Opción única"}
                              </span>
                              <select
                                className="ml-auto border rounded-md p-1"
                                value={preg.tipo}
                                onChange={e => handlePreguntaChange(idx, "tipo", e.target.value)}
                              >
                                <option value="checkbox">Casillas de verificación</option>
                                <option value="radio">Opción única</option>
                              </select>
                              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => handleRemovePregunta(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {preg.opciones.map((op, opIdx) => (
                            <div key={opIdx} className="flex items-center justify-between border rounded-md p-3">
                              <div className="flex items-center gap-2">
                                <Square className="h-4 w-4 text-gray-400" />
                                <input
                                  type="text"
                                  className="border-b border-gray-200 focus:border-blue-400 outline-none bg-transparent"
                                  value={op.valor}
                                  onChange={e => handleOpcionChange(idx, opIdx, e.target.value)}
                                  placeholder={`Opción ${opIdx + 1}`}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Excluyente</span>
                                {preg.tipo === "radio" ? (
                                  <input
                                    type="radio"
                                    name={`excluyente-${idx}`}
                                    checked={op.excluyente}
                                    onChange={() => handleToggleExcluyente(idx, opIdx)}
                                    title="Marcar como excluyente"
                                  />
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={op.excluyente}
                                    onChange={() => handleToggleExcluyente(idx, opIdx)}
                                    title="Marcar como excluyente"
                                  />
                                )}
                                <Trash2
                                  className="h-4 w-4 text-gray-400 cursor-pointer"
                                  onClick={() => handleRemoveOpcion(idx, opIdx)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="text-gray-500 flex items-center gap-1"
                          onClick={() => handleAddOpcion(idx)}
                        >
                          <Plus className="h-4 w-4" /> Agregar otra opción
                        </button>
                      </div>
                    ))}

                    <div className="flex justify-center mt-6">
                      <Button type="button" className="flex items-center gap-2" onClick={handleAddPregunta}>
                        <Plus className="h-4 w-4" /> Nueva pregunta
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="formulario" className="bg-white p-4 rounded-lg border">
                  {/* Aquí puedes poner los campos obligatorios si lo deseas */}
                  <p className="text-gray-500">Estos campos se solicitarán automáticamente a todos los candidatos.</p>
                </TabsContent>
              </Tabs>
            </section>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-8">
              <Button variant="outline" onClick={handleGoBack}>Cancelar</Button>
              <Button onClick={handlePublish} className="bg-blue-600 hover:bg-blue-700 text-white">Publicar oferta</Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </Sidebar>
  )
}
