"use client"

import { useState } from "react"
import { format, addDays, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, PlusIcon } from "lucide-react"
import { ofertasEjemplo } from "@/data/ofertas"
import { useRouter } from "next/navigation"

export default function Home() {
  const [semanaActual, setSemanaActual] = useState(new Date())
  const [mostrarDialogoNuevaOferta, setMostrarDialogoNuevaOferta] = useState(false)
  const router = useRouter()

  // Obtener el primer día de la semana (lunes)
  const primerDiaSemana = startOfWeek(semanaActual, { weekStartsOn: 1 })

  // Crear array con los días de la semana
  const diasSemana = Array.from({ length: 5 }).map((_, index) => {
    const fecha = addDays(primerDiaSemana, index)
    return {
      fecha,
      nombre: format(fecha, "EEEE", { locale: es }),
      dia: format(fecha, "d", { locale: es }),
      esHoy: format(fecha, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
    }
  })

  // Función para obtener eventos del día (simulados)
  const getEventosDia = (fecha: Date) => {
    // Simulamos algunos eventos aleatorios
    const eventos = []
    const esHoy = format(fecha, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

    // Si es hoy, añadimos un evento
    if (esHoy) {
      eventos.push({
        id: "1",
        titulo: "Entrevista con candidato",
        hora: "10:00",
      })
    }

    // Si es jueves, añadimos un evento
    if (format(fecha, "EEEE", { locale: es }) === "jueves") {
      eventos.push({
        id: "2",
        titulo: "Reunión de equipo",
        hora: "15:30",
      })
    }

    return eventos
  }

  // Función para cambiar de semana
  const cambiarSemana = (direccion: number) => {
    setSemanaActual((prevSemana) => addDays(prevSemana, direccion * 7))
  }

  // Obtener las últimas 3 ofertas
  const ultimasOfertas = [...ofertasEjemplo]
    .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime())
    .slice(0, 3)

  // Función para determinar el color de la fase
  const getColorFase = (fase: string) => {
    return "text-green-600"
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        {/* Encabezado con saludo y botón nueva oferta */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Bienvenido, Hector</h1>
          <Button onClick={() => router.push("/busquedas?nuevaOferta=true")}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva oferta
          </Button>
        </div>

        {/* Calendario semanal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Calendario Semanal</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {format(primerDiaSemana, "d 'de' MMMM", { locale: es })} -{" "}
                {format(addDays(primerDiaSemana, 4), "d 'de' MMMM", { locale: es })}
              </span>
              <div className="flex">
                <Button variant="outline" size="icon" onClick={() => cambiarSemana(-1)} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Semana anterior</span>
                </Button>
                <Button variant="outline" size="icon" onClick={() => cambiarSemana(1)} className="h-8 w-8 ml-1">
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Semana siguiente</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {diasSemana.map((dia) => (
                <div
                  key={dia.dia}
                  className={`rounded-lg border p-2 ${dia.esHoy ? "bg-primary/10 border-primary" : ""}`}
                >
                  <div className="text-center mb-2">
                    <div className="font-medium">
                      {dia.nombre} {dia.dia}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {getEventosDia(dia.fecha).map((evento) => (
                      <div key={evento.id} className="text-xs p-1 bg-primary/20 rounded">
                        <div className="font-medium">{evento.titulo}</div>
                        <div>{evento.hora}</div>
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
            <CardTitle className="text-lg">Últimas ofertas publicadas</CardTitle>
            <Button variant="link" size="sm" asChild>
              <a href="/busquedas">Ver todas</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ultimasOfertas.map((oferta) => (
                <Card key={oferta.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center mb-3">
                      <h3 className="text-lg font-semibold mb-1">{oferta.titulo}</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Fase actual:</span>
                        <span className={`text-sm ${getColorFase(oferta.estado)}`}>
                          {oferta.estado === "Activa"
                            ? "Webinar informativo"
                            : oferta.estado === "Cerrada"
                              ? "Entrevistas finales"
                              : oferta.estado === "Pausada"
                                ? "Filtrado de cv"
                                : oferta.estado === "Borrador"
                                  ? "Psicotecnicos"
                                  : "Entrevistas 1v1"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Candidatos:</span>
                        <span className="text-sm text-green-600 font-medium">{oferta.candidatos.length}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Creada el:</span>
                        <span className="text-sm">{format(oferta.fechaCreacion, "dd/MM/yyyy", { locale: es })}</span>
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
