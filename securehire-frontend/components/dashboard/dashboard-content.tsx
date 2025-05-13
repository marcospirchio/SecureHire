"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import { format, startOfWeek, addDays } from "date-fns"
import { es } from "date-fns/locale"

interface DashboardContentProps {
  usuarioLogueado: string
  ultimasOfertas: Array<{
    id: string
    titulo: string
    fase: string
    candidatos: number
    fechaCreacion: Date
  }>
  entrevistas: Array<{
    id: number
    titulo: string
    fecha: Date
    candidato: string
  }>
}

export function DashboardContent({ usuarioLogueado, ultimasOfertas, entrevistas = [] }: DashboardContentProps) {
  const router = useRouter()
  const [semanaActual, setSemanaActual] = useState(new Date())

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Generar los días de la semana actual
  const inicioDeSemana = startOfWeek(semanaActual, { weekStartsOn: 1 }) // Lunes como inicio de semana
  const diasDeLaSemana = Array.from({ length: 5 }, (_, i) => addDays(inicioDeSemana, i)) // Lunes a viernes

  // Función para obtener los eventos de un día específico
  const getEventosDia = (dia: Date) => {
    return entrevistas.filter((evento) => {
      const fechaEvento = new Date(evento.fecha)
      return (
        fechaEvento.getDate() === dia.getDate() &&
        fechaEvento.getMonth() === dia.getMonth() &&
        fechaEvento.getFullYear() === dia.getFullYear()
      )
    })
  }

  // Función para ir a la semana anterior
  const irASemanaAnterior = () => {
    setSemanaActual((prevSemana) => addDays(prevSemana, -7))
  }

  // Función para ir a la semana siguiente
  const irASemanaSiguiente = () => {
    setSemanaActual((prevSemana) => addDays(prevSemana, 7))
  }

  // Formatear el rango de fechas para mostrar
  const formatoRangoFechas = () => {
    const inicio = format(diasDeLaSemana[0], "d 'de' MMMM", { locale: es })
    const fin = format(diasDeLaSemana[4], "d 'de' MMMM", { locale: es })
    return `${inicio} - ${fin}`
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {usuarioLogueado}</h1>
        <Button onClick={() => router.push("/ofertas?nueva=true")}>
          <span className="hidden sm:inline-block">Nueva oferta</span>
          <span className="sm:hidden">+ Oferta</span>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Calendario Semanal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Calendario Semanal</CardTitle>
              <CardDescription>{formatoRangoFechas()}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={irASemanaAnterior}>
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span className="sr-only">Anterior</span>
              </Button>
              <Button variant="outline" size="icon" onClick={irASemanaSiguiente}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Siguiente</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {diasDeLaSemana.map((dia, index) => (
                <div key={index} className="flex flex-col">
                  <div
                    className={`text-center p-2 font-medium ${
                      dia.getDate() === new Date().getDate()
                        ? "bg-blue-600 text-white rounded-t-md"
                        : "bg-gray-100 dark:bg-gray-800 rounded-t-md"
                    }`}
                  >
                    <div>{format(dia, "EEEE", { locale: es })}</div>
                    <div>{format(dia, "d", { locale: es })}</div>
                  </div>
                  <div className="border rounded-b-md p-2 flex-1 min-h-[100px] bg-white dark:bg-gray-950">
                    {getEventosDia(dia).map((evento) => (
                      <div key={evento.id} className="mb-1 p-1 text-xs bg-blue-100 dark:bg-blue-900 rounded">
                        <div className="font-medium">{evento.titulo}</div>
                        <div>{evento.candidato}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Últimas ofertas publicadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Últimas ofertas publicadas</CardTitle>
              <CardDescription>Tus búsquedas más recientes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ofertas">
                Ver todas
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ultimasOfertas.map((oferta) => (
                <Card key={oferta.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{oferta.titulo}</h3>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fase actual:</span>
                          <span>{oferta.fase}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Candidatos:</span>
                          <span className="text-green-600 font-medium">{oferta.candidatos}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Creada el:</span>
                          <span>{formatearFecha(oferta.fechaCreacion)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
