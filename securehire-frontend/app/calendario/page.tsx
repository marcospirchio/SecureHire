"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarioMensual } from "@/components/calendario/calendario-mensual"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, PlusCircle } from "lucide-react"

// Datos de ejemplo para eventos
const eventosEjemplo = [
  {
    id: 1,
    titulo: "Entrevista",
    fecha: new Date(2025, 4, 15, 10, 0),
    candidato: "María Pérez",
  },
  {
    id: 2,
    titulo: "Entrevista",
    fecha: new Date(2025, 4, 18, 15, 30),
    candidato: "Javier González",
  },
  {
    id: 3,
    titulo: "Entrevista",
    fecha: new Date(2025, 4, 20, 9, 0),
    candidato: "Elena Martín",
  },
  {
    id: 4,
    titulo: "Entrevista",
    fecha: new Date(2025, 4, 22, 11, 0),
    candidato: "Carlos Rodríguez",
  },
  {
    id: 5,
    titulo: "Entrevista",
    fecha: new Date(2025, 4, 25, 16, 0),
    candidato: "Ana López",
  },
]

export default function CalendarioPage() {
  const [eventos, setEventos] = useState(eventosEjemplo)
  const [activeTab, setActiveTab] = useState("calendario")

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
          <h1 className="text-3xl font-bold">Calendario de Entrevistas</h1>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Entrevista
        </Button>
      </div>

      <Tabs defaultValue="calendario" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="proximas">Próximas Entrevistas</TabsTrigger>
        </TabsList>

        <TabsContent value="calendario">
          <CalendarioMensual eventos={eventos} />
        </TabsContent>

        <TabsContent value="proximas">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Entrevistas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventos
                  .filter((evento) => evento.fecha > new Date())
                  .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
                  .map((evento) => (
                    <Card key={evento.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{evento.candidato}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {format(evento.fecha, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Reprogramar
                            </Button>
                            <Button variant="destructive" size="sm">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
