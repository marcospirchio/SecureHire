"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  isToday,
} from "date-fns"
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

interface CalendarioMensualProps {
  eventos: Evento[]
}

export function CalendarioMensual({ eventos }: CalendarioMensualProps) {
  const [mesActual, setMesActual] = useState(new Date())

  const inicioMes = startOfMonth(mesActual)
  const finMes = endOfMonth(mesActual)
  const diasMes = eachDayOfInterval({ start: inicioMes, end: finMes })

  const mesAnterior = () => {
    setMesActual((prev) => addMonths(prev, -1))
  }

  const mesSiguiente = () => {
    setMesActual((prev) => addMonths(prev, 1))
  }

  const getEventosDia = (dia: Date) => {
    return eventos.filter((evento) => isSameDay(evento.fecha, dia))
  }

  // Crear una matriz de semanas para el mes
  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
  const semanas: Date[][] = []
  let diasActuales: Date[] = []

  // Rellenar con días del mes anterior hasta el primer día del mes
  const primerDiaSemana = inicioMes.getDay() || 7 // 0 es domingo, lo convertimos a 7
  for (let i = 1; i < primerDiaSemana; i++) {
    diasActuales.push(new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 1 - (primerDiaSemana - i)))
  }

  // Añadir todos los días del mes
  diasMes.forEach((dia) => {
    if (diasActuales.length === 7) {
      semanas.push(diasActuales)
      diasActuales = []
    }
    diasActuales.push(dia)
  })

  // Rellenar con días del mes siguiente hasta completar la última semana
  if (diasActuales.length > 0) {
    for (let i = diasActuales.length; i < 7; i++) {
      diasActuales.push(
        new Date(finMes.getFullYear(), finMes.getMonth(), finMes.getDate() + (i - diasActuales.length + 1)),
      )
    }
    semanas.push(diasActuales)
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xl font-medium">{format(mesActual, "MMMM yyyy", { locale: es })}</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={mesAnterior}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={mesSiguiente}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {diasSemana.map((dia) => (
            <div key={dia} className="text-center p-2 text-sm font-medium text-gray-500">
              {dia}
            </div>
          ))}
          {semanas.flatMap((semana) =>
            semana.map((dia) => {
              const eventosDia = getEventosDia(dia)
              const esMismoMes = isSameMonth(dia, mesActual)

              return (
                <div
                  key={dia.toString()}
                  className={cn(
                    "min-h-[80px] p-1 border text-sm",
                    !esMismoMes && "text-gray-400 bg-gray-50 dark:bg-gray-800/50",
                    isToday(dia) && "border-primary",
                  )}
                >
                  <div className="text-right mb-1">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-6 h-6 rounded-full",
                        isToday(dia) && "bg-primary text-primary-foreground",
                      )}
                    >
                      {format(dia, "d")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {eventosDia.map((evento) => (
                      <div
                        key={evento.id}
                        className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 truncate"
                      >
                        {format(evento.fecha, "HH:mm")} - {evento.titulo}
                      </div>
                    ))}
                  </div>
                </div>
              )
            }),
          )}
        </div>
      </CardContent>
    </Card>
  )
}
