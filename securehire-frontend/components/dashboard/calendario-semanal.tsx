"use client"

import { useState } from "react"
import { format, startOfWeek, addDays, isToday, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Evento {
  id: number
  titulo: string
  fecha: Date
  candidato: string
}

interface CalendarioSemanalProps {
  eventos: Evento[]
}

export function CalendarioSemanal({ eventos }: CalendarioSemanalProps) {
  const [semanaActual, setSemanaActual] = useState(new Date())

  const inicioSemana = startOfWeek(semanaActual, { weekStartsOn: 1 }) // Lunes como inicio de semana
  const diasSemana = Array.from({ length: 5 }).map((_, i) => addDays(inicioSemana, i)) // Lunes a viernes

  const semanaAnterior = () => {
    setSemanaActual((prev) => addDays(prev, -7))
  }

  const semanaSiguiente = () => {
    setSemanaActual((prev) => addDays(prev, 7))
  }

  const getEventosDia = (dia: Date) => {
    return eventos.filter((evento) => isSameDay(evento.fecha, dia))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-medium">Calendario Semanal</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={semanaAnterior}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {format(inicioSemana, "d 'de' MMMM", { locale: es })} -{" "}
            {format(addDays(inicioSemana, 4), "d 'de' MMMM", { locale: es })}
          </span>
          <Button variant="outline" size="icon" onClick={semanaSiguiente}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {diasSemana.map((dia) => (
            <div key={dia.toString()} className="flex flex-col">
              <div
                className={cn(
                  "text-center p-2 text-sm font-medium rounded-t-md",
                  isToday(dia) ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {format(dia, "EEEE d", { locale: es })}
              </div>
              <div className="flex-1 min-h-[100px] border rounded-b-md p-1 space-y-1">
                {getEventosDia(dia).map((evento) => (
                  <div
                    key={evento.id}
                    className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                  >
                    <div className="font-medium">{evento.titulo}</div>
                    <div>{evento.candidato}</div>
                    <div>{format(evento.fecha, "HH:mm")}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
