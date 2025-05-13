import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import type { Comentario } from "@/types/candidato"

interface ComentariosTabProps {
  comentarios: Comentario[]
}

export function ComentariosTab({ comentarios }: ComentariosTabProps) {
  return (
    <div className="space-y-4">
      {comentarios.map((comentario, index) => (
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

      {comentarios.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No hay comentarios registrados</div>
      )}
    </div>
  )
}
