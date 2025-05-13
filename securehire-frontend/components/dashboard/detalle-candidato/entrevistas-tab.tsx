import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { EtiquetaEstado } from "@/components/dashboard/etiqueta-estado"
import type { Entrevista } from "@/types/candidato"

interface EntrevistasTabProps {
  entrevistas: Entrevista[]
}

export function EntrevistasTab({ entrevistas }: EntrevistasTabProps) {
  return (
    <div className="space-y-4">
      {entrevistas.map((entrevista, index) => (
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

      {entrevistas.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No hay entrevistas registradas</div>
      )}
    </div>
  )
}
