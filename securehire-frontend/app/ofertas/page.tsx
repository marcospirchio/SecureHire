"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, FolderPlusIcon, FileTextIcon, EditIcon, Package2Icon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ListaOfertas } from "@/components/ofertas/lista-ofertas"
import { ListaCandidatos } from "@/components/ofertas/lista-candidatos"
import { DetalleFormulario } from "@/components/ofertas/detalle-formulario"
import { DialogoNuevaOferta } from "@/components/ofertas/dialogo-nueva-oferta"
import { DialogoFormulario } from "@/components/ofertas/dialogo-formulario"
import { DetalleCandidato } from "@/components/dashboard/detalle-candidato"
import type { OfertaTrabajo } from "@/types/ofertas"
import type { Candidato } from "@/types/candidato"

// Importar datos de ejemplo
import { ofertasEjemplo } from "@/data/ofertas"

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState<OfertaTrabajo[]>(ofertasEjemplo)
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<OfertaTrabajo | null>(null)
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<Candidato | null>(null)
  const [mostrarSoloExcluyentes, setMostrarSoloExcluyentes] = useState(false)
  const [ordenarPor, setOrdenarPor] = useState<string | null>(null)
  const [mostrarDialogoNuevaOferta, setMostrarDialogoNuevaOferta] = useState(false)
  const [mostrarDialogoFormulario, setMostrarDialogoFormulario] = useState(false)
  const { toast } = useToast()

  const crearNuevaOferta = (titulo: string, descripcion: string) => {
    if (!titulo.trim()) return

    const nuevaOfertaObj: OfertaTrabajo = {
      id: Date.now().toString(),
      titulo,
      descripcion,
      fechaCreacion: new Date(),
      formulario: null,
      candidatos: [],
    }

    setOfertas([...ofertas, nuevaOfertaObj])
    setMostrarDialogoNuevaOferta(false)
  }

  const guardarFormulario = (nombre: string, campos: any[]) => {
    if (!nombre.trim() || !ofertaSeleccionada) return

    const formularioFinal = {
      id: Date.now().toString(),
      nombre,
      campos,
    }

    const ofertasActualizadas = ofertas.map((oferta) =>
      oferta.id === ofertaSeleccionada.id ? { ...oferta, formulario: formularioFinal } : oferta,
    )

    setOfertas(ofertasActualizadas)
    setOfertaSeleccionada({ ...ofertaSeleccionada, formulario: formularioFinal })
    setMostrarDialogoFormulario(false)
  }

  const filtrarCandidatos = () => {
    if (!ofertaSeleccionada) return []

    let candidatosFiltrados = [...ofertaSeleccionada.candidatos]

    if (mostrarSoloExcluyentes) {
      candidatosFiltrados = candidatosFiltrados.filter((candidato) => candidato.cumpleRequisitosExcluyentes)
    }

    if (ordenarPor) {
      switch (ordenarPor) {
        case "reputacion-asc":
          candidatosFiltrados.sort((a, b) => a.reputacion - b.reputacion)
          break
        case "reputacion-desc":
          candidatosFiltrados.sort((a, b) => b.reputacion - a.reputacion)
          break
        case "edad-asc":
          candidatosFiltrados.sort((a, b) => a.edad - b.edad)
          break
        case "edad-desc":
          candidatosFiltrados.sort((a, b) => b.edad - a.edad)
          break
        case "tiempo-respuesta":
          candidatosFiltrados.sort((a, b) => {
            const tiempoA = Number.parseInt(a.tiempoRespuesta.split(" ")[0])
            const tiempoB = Number.parseInt(b.tiempoRespuesta.split(" ")[0])
            return tiempoA - tiempoB
          })
          break
      }
    }

    return candidatosFiltrados
  }

  const rechazarCandidato = (idCandidato: number) => {
    if (!ofertaSeleccionada) return

    const ofertasActualizadas = ofertas.map((oferta) =>
      oferta.id === ofertaSeleccionada.id
        ? {
            ...oferta,
            candidatos: oferta.candidatos.filter((candidato) => candidato.id !== idCandidato),
          }
        : oferta,
    )

    setOfertas(ofertasActualizadas)

    const ofertaActualizada = ofertasActualizadas.find((oferta) => oferta.id === ofertaSeleccionada.id)

    if (ofertaActualizada) {
      setOfertaSeleccionada(ofertaActualizada)
    }

    setCandidatoSeleccionado(null)

    toast({
      title: "Candidato rechazado",
      description: "El candidato ha sido eliminado de la lista.",
      variant: "destructive",
    })
  }

  const confirmarEntrevista = () => {
    if (!candidatoSeleccionado || !ofertaSeleccionada) return

    const ofertasActualizadas = ofertas.map((oferta) => {
      if (oferta.id === ofertaSeleccionada.id) {
        return {
          ...oferta,
          candidatos: oferta.candidatos.map((candidato) => {
            if (candidato.id === candidatoSeleccionado.id) {
              return {
                ...candidato,
                estado: "Entrevista confirmada" as const,
              }
            }
            return candidato
          }),
        }
      }
      return oferta
    })

    setOfertas(ofertasActualizadas)

    const ofertaActualizada = ofertasActualizadas.find((oferta) => oferta.id === ofertaSeleccionada.id)
    if (ofertaActualizada) {
      setOfertaSeleccionada(ofertaActualizada)
      const candidatoActualizado = ofertaActualizada.candidatos.find(
        (candidato) => candidato.id === candidatoSeleccionado.id,
      )
      if (candidatoActualizado) {
        setCandidatoSeleccionado(candidatoActualizado)
      }
    }

    toast({
      title: "Entrevista confirmada",
      description: `La entrevista con ${candidatoSeleccionado.nombre} ha sido confirmada.`,
      variant: "default",
    })
  }

  const marcarNoAsistio = () => {
    if (!candidatoSeleccionado || !ofertaSeleccionada) return

    const ofertasActualizadas = ofertas.map((oferta) => {
      if (oferta.id === ofertaSeleccionada.id) {
        return {
          ...oferta,
          candidatos: oferta.candidatos.map((candidato) => {
            if (candidato.id === candidatoSeleccionado.id) {
              return {
                ...candidato,
                estado: "No se presentó" as const,
              }
            }
            return candidato
          }),
        }
      }
      return oferta
    })

    setOfertas(ofertasActualizadas)

    const ofertaActualizada = ofertasActualizadas.find((oferta) => oferta.id === ofertaSeleccionada.id)
    if (ofertaActualizada) {
      setOfertaSeleccionada(ofertaActualizada)
      const candidatoActualizado = ofertaActualizada.candidatos.find(
        (candidato) => candidato.id === candidatoSeleccionado.id,
      )
      if (candidatoActualizado) {
        setCandidatoSeleccionado(candidatoActualizado)
      }
    }

    toast({
      title: "Candidato no asistió",
      description: `Se ha registrado que ${candidatoSeleccionado.nombre} no asistió a la entrevista.`,
      variant: "destructive",
    })
  }

  const cancelarEntrevista = () => {
    if (!candidatoSeleccionado || !ofertaSeleccionada) return

    const ofertasActualizadas = ofertas.map((oferta) => {
      if (oferta.id === ofertaSeleccionada.id) {
        return {
          ...oferta,
          candidatos: oferta.candidatos.map((candidato) => {
            if (candidato.id === candidatoSeleccionado.id) {
              return {
                ...candidato,
                estado: "Pendiente de confirmación" as const,
                entrevistas: [
                  ...candidato.entrevistas,
                  {
                    fecha: new Date(),
                    estado: "Pendiente de confirmación",
                    notas: "Entrevista anterior cancelada. Pendiente de reprogramación.",
                  },
                ],
              }
            }
            return candidato
          }),
        }
      }
      return oferta
    })

    setOfertas(ofertasActualizadas)

    const ofertaActualizada = ofertasActualizadas.find((oferta) => oferta.id === ofertaSeleccionada.id)
    if (ofertaActualizada) {
      setOfertaSeleccionada(ofertaActualizada)
      const candidatoActualizado = ofertaActualizada.candidatos.find(
        (candidato) => candidato.id === candidatoSeleccionado.id,
      )
      if (candidatoActualizado) {
        setCandidatoSeleccionado(candidatoActualizado)
      }
    }

    toast({
      title: "Entrevista cancelada",
      description: `La entrevista con ${candidatoSeleccionado.nombre} ha sido cancelada.`,
      variant: "destructive",
    })
  }

  const contactarCandidato = () => {
    if (!candidatoSeleccionado) return

    toast({
      title: "Contactando candidato",
      description: `Se ha enviado un mensaje a ${candidatoSeleccionado.nombre}.`,
      variant: "default",
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Mis Búsquedas</h1>
        </div>
        <Button onClick={() => setMostrarDialogoNuevaOferta(true)}>
          <FolderPlusIcon className="mr-2 h-4 w-4" />
          Nueva Oferta
        </Button>
      </div>

      {candidatoSeleccionado ? (
        <div>
          <Button variant="outline" onClick={() => setCandidatoSeleccionado(null)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista de candidatos
          </Button>

          <DetalleCandidato
            candidato={candidatoSeleccionado}
            onConfirmarEntrevista={confirmarEntrevista}
            onMarcarNoAsistio={marcarNoAsistio}
            onCancelarEntrevista={cancelarEntrevista}
            onContactarCandidato={contactarCandidato}
            onClose={() => setCandidatoSeleccionado(null)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ListaOfertas
              ofertas={ofertas}
              ofertaSeleccionada={ofertaSeleccionada}
              onSelectOferta={setOfertaSeleccionada}
            />
          </div>

          <div className="md:col-span-2">
            {ofertaSeleccionada ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{ofertaSeleccionada.titulo}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ofertaSeleccionada.descripcion}</p>
                    </div>
                    <div className="flex gap-2">
                      {!ofertaSeleccionada.formulario ? (
                        <Button onClick={() => setMostrarDialogoFormulario(true)}>
                          <FileTextIcon className="mr-2 h-4 w-4" />
                          Crear Formulario
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={() => setMostrarDialogoFormulario(true)}>
                          <EditIcon className="mr-2 h-4 w-4" />
                          Editar Formulario
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-6">
                  <Tabs defaultValue="candidatos">
                    <TabsList className="mb-4">
                      <TabsTrigger value="candidatos">Candidatos</TabsTrigger>
                      <TabsTrigger value="formulario">Formulario</TabsTrigger>
                    </TabsList>

                    <TabsContent value="candidatos">
                      <ListaCandidatos
                        candidatos={filtrarCandidatos()}
                        ofertaSeleccionada={ofertaSeleccionada}
                        mostrarSoloExcluyentes={mostrarSoloExcluyentes}
                        setMostrarSoloExcluyentes={setMostrarSoloExcluyentes}
                        ordenarPor={ordenarPor}
                        setOrdenarPor={setOrdenarPor}
                        onSelectCandidato={setCandidatoSeleccionado}
                        onRechazarCandidato={rechazarCandidato}
                      />
                    </TabsContent>

                    <TabsContent value="formulario">
                      <DetalleFormulario
                        formulario={ofertaSeleccionada.formulario}
                        onEditarFormulario={() => setMostrarDialogoFormulario(true)}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <Package2Icon className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-xl font-medium mb-2">Selecciona una oferta</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Selecciona una oferta de trabajo para ver sus detalles o crea una nueva
                </p>
                <Button onClick={() => setMostrarDialogoNuevaOferta(true)}>
                  <FolderPlusIcon className="mr-2 h-4 w-4" />
                  Nueva Oferta
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Diálogos */}
      <DialogoNuevaOferta
        open={mostrarDialogoNuevaOferta}
        onOpenChange={setMostrarDialogoNuevaOferta}
        onCrearOferta={crearNuevaOferta}
      />

      <DialogoFormulario
        open={mostrarDialogoFormulario}
        onOpenChange={setMostrarDialogoFormulario}
        formularioExistente={ofertaSeleccionada?.formulario || null}
        onGuardarFormulario={guardarFormulario}
      />
    </div>
  )
}
