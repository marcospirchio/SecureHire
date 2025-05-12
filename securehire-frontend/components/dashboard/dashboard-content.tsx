"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, UserPlus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronRightIcon } from "./icons"
import { CalendarioSemanal } from "./calendario-semanal"
import type { EventoReciente } from "@/types/candidato"

interface DashboardContentProps {
  usuarioLogueado: string
  eventosRecientes: EventoReciente[]
  ultimasOfertas: {
    id: string
    titulo: string
    descripcion: string
  }[]
  entrevistas: {
    id: number
    titulo: string
    fecha: Date
    candidato: string
  }[]
}

export function DashboardContent({
  usuarioLogueado,
  eventosRecientes,
  ultimasOfertas,
  entrevistas,
}: DashboardContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">¡Bienvenido, {usuarioLogueado}!</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-medium">Últimas actualizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventosRecientes.map((evento) => (
              <div key={evento.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    evento.tipo === "confirmacion"
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : evento.tipo === "cancelacion"
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                  )}
                >
                  {evento.tipo === "confirmacion" ? (
                    <Calendar className="h-4 w-4" />
                  ) : evento.tipo === "cancelacion" ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    <span className="font-semibold">{evento.candidato}</span> {evento.accion}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(evento.fecha, "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CalendarioSemanal eventos={entrevistas} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Últimas ofertas publicadas</CardTitle>
          <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full">
            <ChevronRightIcon className="h-4 w-4" />
            <span className="sr-only">Ver más</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {ultimasOfertas.map((oferta) => (
              <Card key={oferta.id}>
                <CardHeader className="flex flex-row items-center pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{oferta.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {oferta.descripcion.length > 100
                      ? `${oferta.descripcion.substring(0, 100)}...`
                      : oferta.descripcion}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
