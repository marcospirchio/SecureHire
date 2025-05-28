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

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("presencial");
  const [description, setDescription] = useState("");
  const [contractType, setContractType] = useState("fullTime");
  const [salary, setSalary] = useState("");
  const [phases, setPhases] = useState(["Preselección", "Entrevista", "Oferta"]);
  const [urlPublica, setUrlPublica] = useState("");

  const [preguntas, setPreguntas] = useState([
    {
      texto: "",
      tipo: "checkbox", 
      opciones: [
        { valor: "Sí", excluyente: false },
        { valor: "No", excluyente: false }
      ],
    },
  ]);

  const handleGoBack = () => {
    router.back()
  }

  const handleRemovePregunta = (index: number) => {
    const updated = [...preguntas];
    updated.splice(index, 1);
    setPreguntas(updated);
  };

  const handlePublish = async () => {
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

    const camposAdicionales = preguntas
      .filter(preg => preg.texto.trim() !== "") 
      .map(preg => {
        if (preg.tipo === "texto") {
          return {
            nombre: preg.texto,
            tipo: "texto",
            esExcluyente: false,
            opciones: [],
            valoresExcluyentes: [],
            opcionesObligatorias: []
          };
        } else {
          return {
            nombre: preg.texto,
            tipo: preg.tipo === "radio" ? "select" : "checkbox",
            esExcluyente: false,
            opciones: preg.opciones.map(op => op.valor),
            valoresExcluyentes: preg.opciones.filter(op => op.excluyente).map(op => op.valor),
            opcionesObligatorias: []
          };
        }
      });

    const uuid = crypto.randomUUID()
    const urlPublica = `https://securehire.com/postulacion/${uuid}`

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
      urlPublica: urlPublica
    };

    try {
      const res = await fetch("http://localhost:8080/api/busquedas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Error al crear la búsqueda");
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

            {/* Preguntas adicionales (sin tabs) */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Preguntas adicionales</h2>
              <div className="bg-white p-4 rounded-lg border">
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
                              {preg.tipo === "checkbox"
                                ? "Casillas de verificación"
                                : preg.tipo === "radio"
                                ? "Opción única"
                                : "Respuesta de texto"}
                            </span>
                            <select
                              className="ml-auto border rounded-md p-1"
                              value={preg.tipo}
                              onChange={e => handlePreguntaChange(idx, "tipo", e.target.value)}
                            >
                              <option value="checkbox">Casillas de verificación</option>
                              <option value="radio">Opción única</option>
                              <option value="texto">Respuesta de texto</option>
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

                      {/* Renderizado de opciones solo si no es texto */}
                      {preg.tipo !== "texto" ? (
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
                      ) : (
                        <div className="mt-2">
                          <input
                            type="text"
                            className="w-full border rounded-md p-2 bg-gray-50"
                            placeholder="Respuesta del candidato..."
                            disabled
                          />
                        </div>
                      )}

                      {/* Botón para agregar opción solo si no es texto */}
                      {preg.tipo !== "texto" && (
                        <div className="flex items-center justify-between w-full mt-2">
                          <button
                            type="button"
                            className="text-gray-500 flex items-center gap-1"
                            onClick={() => handleAddOpcion(idx)}
                          >
                            <Plus className="h-4 w-4" /> Agregar otra opción
                          </button>
                          <span className="text-xs text-gray-400 whitespace-nowrap">Puedes elegir si quieres que la respuesta sea excluyente o no</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-center mt-6">
                    <Button type="button" className="flex items-center gap-2" onClick={handleAddPregunta}>
                      <Plus className="h-4 w-4" /> Nueva pregunta
                    </Button>
                  </div>
                </div>
              </div>
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
