"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, Mail, Pencil, Phone, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EstrellasReputacion } from "./estrella-reputacion"
import { EtiquetaEstado } from "./etiqueta-estado"
import type { Candidato, AnotacionPersonal } from "@/types/candidato"

interface DetalleCandidatoProps {
  candidato: Candidato
  onConfirmarEntrevista: () => void
  onMarcarNoAsistio: () => void
  onCancelarEntrevista: () => void
  onContactarCandidato: () => void
  onClose?: () => void
}

export function DetalleCandidato({
  candidato,
  onConfirmarEntrevista,
  onMarcarNoAsistio,
  onCancelarEntrevista,
  onContactarCandidato,
  onClose,
}: DetalleCandidatoProps) {
  const [nuevaAnotacion, setNuevaAnotacion] = useState("")
  const [anotaciones, setAnotaciones] = useState<AnotacionPersonal[]>(candidato.anotacionesPersonales)
  const [editandoAnotacion, setEditandoAnotacion] = useState<number | null>(null)
  const [textoEditado, setTextoEditado] = useState("")
  const [activeTab, setActiveTab] = useState("entrevistas")

  const guardarAnotacion = () => {
    if (nuevaAnotacion.trim() === "") return

    const nuevaAnotacionObj: AnotacionPersonal = {
      id: Date.now(),
      fecha: new Date(),
      texto: nuevaAnotacion,
    }

    setAnotaciones([nuevaAnotacionObj, ...anotaciones])
    setNuevaAnotacion("")
  }

  const eliminarAnotacion = (id: number) => {
    setAnotaciones(anotaciones.filter((a) => a.id !== id))
  }

  const iniciarEdicion = (anotacion: AnotacionPersonal) => {
    setEditandoAnotacion(anotacion.id)
    setTextoEditado(anotacion.texto)
  }

  const guardarEdicion = () => {
    if (editandoAnotacion === null) return

    setAnotaciones(
      anotaciones.map((a) => (a.id === editandoAnotacion ? { ...a, texto: textoEditado, fecha: new Date() } : a)),
    )

    setEditandoAnotacion(null)
    setTextoEditado("")
  }

  const cancelarEdicion = () => {
    setEditandoAnotacion(null)
    setTextoEditado("")
  }

  // Formatear el nombre completo del candidato
  const nombreCompleto = candidato.apellido ? `${candidato.nombre} ${candidato.apellido}` : candidato.nombre

  return (
    <div className="space-y-6 bg-gray-100/40 dark:bg-gray-800/40 p-6 rounded-lg">
      {onClose && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Volver a la lista
          </Button>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">{nombreCompleto}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xl">{candidato.puesto}</p>
        </div>
        <EtiquetaEstado estado={candidato.estado} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Correo electrónico</h3>
            <div className="flex items-center mt-1">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              <span>{candidato.email}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</h3>
            <div className="flex items-center mt-1">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <span>{candidato.telefono}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reputación</h3>
            <div className="flex items-center mt-1">
              <EstrellasReputacion valor={candidato.reputacion} />
              <span className="ml-2">{candidato.reputacion}/5</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tiempo de respuesta estimado</h3>
            <div className="flex items-center mt-1">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span>{candidato.tiempoRespuesta}</span>
            </div>
          </div>

          {candidato.edad && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Edad</h3>
              <div className="flex items-center mt-1">
                <span>{candidato.edad} años</span>
              </div>
            </div>
          )}

          {candidato.sexo && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sexo</h3>
              <div className="flex items-center mt-1">
                <span>{candidato.sexo}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-xl">Acciones</h3>
          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" onClick={onContactarCandidato} className="justify-center">
              Contactar candidato
            </Button>

            <Button variant="default" onClick={onConfirmarEntrevista} className="justify-center">
              Confirmar entrevista
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="justify-center">
                  Reprogramar entrevista
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reprogramar entrevista</DialogTitle>
                  <DialogDescription id="dialog-description">
                    Selecciona una nueva fecha y hora para la entrevista con {nombreCompleto}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <input
                      type="date"
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <input
                      type="time"
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Guardar cambios</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={onMarcarNoAsistio} className="justify-center">
              Marcar como no asistió
            </Button>

            <Button variant="destructive" onClick={onCancelarEntrevista} className="justify-center">
              Cancelar entrevista
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="entrevistas" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entrevistas">Historial de entrevistas</TabsTrigger>
          <TabsTrigger value="comentarios">Comentarios de reclutadores</TabsTrigger>
          <TabsTrigger value="anotaciones">Mis anotaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="entrevistas" className="mt-6">
          <div className="space-y-4">
            {candidato.entrevistas.map((entrevista, index) => (
              <Card key={index} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">
                          {format(entrevista.fecha, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{entrevista.notas}</p>
                    </div>
                    <EtiquetaEstado estado={entrevista.estado} />
                  </div>
                </CardContent>
              </Card>
            ))}

            {candidato.entrevistas.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">No hay entrevistas registradas</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comentarios" className="mt-6">
          <div className="space-y-4">
            {candidato.comentarios.map((comentario, index) => (
              <Card key={index} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div>
                    <div className="flex justify-between">
                      <span className="font-medium">{comentario.reclutador}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(comentario.fecha, "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{comentario.texto}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {candidato.comentarios.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">No hay comentarios registrados</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="anotaciones" className="mt-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Añadir nueva anotación</h3>
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Escribe tus anotaciones personales sobre este candidato..."
                  value={nuevaAnotacion}
                  onChange={(e) => setNuevaAnotacion(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button onClick={guardarAnotacion}>Guardar anotación</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 mt-4">
            {anotaciones.map((anotacion) => (
              <Card key={anotacion.id} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(anotacion.fecha, "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => iniciarEdicion(anotacion)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => eliminarAnotacion(anotacion.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {editandoAnotacion === anotacion.id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          className="w-full min-h-[80px] p-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          value={textoEditado}
                          onChange={(e) => setTextoEditado(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={cancelarEdicion}>
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={guardarEdicion}>
                            Guardar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm">{anotacion.texto}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {anotaciones.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">No hay anotaciones personales</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
