"use client"

import type React from "react"

import { useState } from "react"
import { useTheme } from "next-themes"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Package2Icon, Moon, Sun, Calendar, User, Briefcase, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Datos de ejemplo para una entrevista
const entrevistaEjemplo = {
  id: "1",
  candidato: "María Pérez",
  puesto: "Desarrollador Frontend",
  reclutador: "Carlos Rodríguez",
  empresa: "SecureHire",
  fecha: new Date(2025, 4, 15, 10, 0),
  ubicacion: "Videollamada (Zoom)",
  estado: "Confirmada",
}

// Motivos de cancelación
const motivosCancelacion = [
  "Ya no estoy interesado/a en el puesto",
  "He encontrado otra oportunidad laboral",
  "No puedo asistir por motivos personales",
  "No puedo asistir por motivos de salud",
  "La fecha/hora no me conviene",
  "Otro motivo",
]

export default function EntrevistaPage({ params }: { params: { id: string } }) {
  const { theme, setTheme } = useTheme()
  const [accion, setAccion] = useState<"cancelar" | "reprogramar" | null>(null)
  const [motivo, setMotivo] = useState<string>("")
  const [otroMotivo, setOtroMotivo] = useState<string>("")
  const [enviado, setEnviado] = useState(false)
  const [resultado, setResultado] = useState<"exito" | "error" | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que se haya seleccionado un motivo
    if (accion === "cancelar" && !motivo) {
      return
    }

    // Simular envío exitoso
    setEnviado(true)
    setResultado("exito")
    window.scrollTo(0, 0)
  }

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
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
                  resultado === "exito" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                {resultado === "exito" ? (
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                )}
              </div>
              <h1 className="text-2xl font-bold mb-4">
                {accion === "cancelar" ? "Entrevista cancelada correctamente" : "Solicitud de reprogramación enviada"}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {accion === "cancelar"
                  ? "Hemos notificado al reclutador sobre la cancelación de tu entrevista."
                  : "Hemos enviado tu solicitud de reprogramación al reclutador. Te contactaremos pronto para confirmar una nueva fecha."}
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
              <div className="bg-primary/10 p-1.5 rounded-md">
                <Package2Icon className="h-5 w-5" />
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

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Gestionar entrevista</CardTitle>
              <CardDescription>
                Puedes cancelar o solicitar reprogramar tu entrevista para el puesto de {entrevistaEjemplo.puesto}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Fecha y hora</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(entrevistaEjemplo.fecha, "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Puesto</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{entrevistaEjemplo.puesto}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Reclutador</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{entrevistaEjemplo.reclutador}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Package2Icon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Empresa</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{entrevistaEjemplo.empresa}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">¿Qué deseas hacer con esta entrevista?</h3>

                    <RadioGroup
                      value={accion || ""}
                      onValueChange={(value) => setAccion(value as "cancelar" | "reprogramar")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cancelar" id="cancelar" />
                        <Label htmlFor="cancelar">Cancelar entrevista</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="reprogramar" id="reprogramar" />
                        <Label htmlFor="reprogramar">Solicitar reprogramación</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {accion === "cancelar" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="motivo">Motivo de cancelación</Label>
                        <Select value={motivo} onValueChange={setMotivo}>
                          <SelectTrigger id="motivo">
                            <SelectValue placeholder="Selecciona un motivo" />
                          </SelectTrigger>
                          <SelectContent>
                            {motivosCancelacion.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {motivo === "Otro motivo" && (
                        <div className="space-y-2">
                          <Label htmlFor="otro-motivo">Especifica el motivo</Label>
                          <Textarea
                            id="otro-motivo"
                            placeholder="Describe el motivo de la cancelación..."
                            value={otroMotivo}
                            onChange={(e) => setOtroMotivo(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {accion === "reprogramar" && (
                    <div className="space-y-4">
                      <Alert>
                        <AlertTitle>Información importante</AlertTitle>
                        <AlertDescription>
                          Al solicitar una reprogramación, el reclutador recibirá tu solicitud y se pondrá en contacto
                          contigo para acordar una nueva fecha y hora.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label htmlFor="motivo-reprogramacion">Motivo de reprogramación</Label>
                        <Textarea
                          id="motivo-reprogramacion"
                          placeholder="Explica por qué necesitas reprogramar la entrevista..."
                          value={otroMotivo}
                          onChange={(e) => setOtroMotivo(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" asChild>
                      <a href="/">Cancelar</a>
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        !accion ||
                        (accion === "cancelar" && !motivo) ||
                        (motivo === "Otro motivo" && !otroMotivo) ||
                        (accion === "reprogramar" && !otroMotivo)
                      }
                    >
                      {accion === "cancelar" ? "Confirmar cancelación" : "Solicitar reprogramación"}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
