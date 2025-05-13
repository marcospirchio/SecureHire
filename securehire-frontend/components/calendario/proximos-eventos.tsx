import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Evento {
  id: number
  titulo: string
  fecha: Date
  candidato: string
}

interface ProximosEventosProps {
  eventos: Evento[]
  formatEventDate: (date: Date) => string
}

export function ProximosEventos({ eventos, formatEventDate }: ProximosEventosProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Entrevistas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {eventos.map((evento) => (
            <Card key={evento.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{evento.candidato}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatEventDate(evento.fecha)}</p>
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
  )
}
