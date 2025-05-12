"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { OfertaTrabajo } from "@/types/ofertas"

interface ListaOfertasProps {
  ofertas: OfertaTrabajo[]
  ofertaSeleccionada: OfertaTrabajo | null
  onSelectOferta: (oferta: OfertaTrabajo) => void
}

export function ListaOfertas({ ofertas, ofertaSeleccionada, onSelectOferta }: ListaOfertasProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Ofertas de Trabajo</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-2">
            {ofertas.map((oferta) => (
              <Card
                key={oferta.id}
                className={`cursor-pointer hover:border-gray-400 transition-colors ${
                  ofertaSeleccionada?.id === oferta.id ? "border-primary" : ""
                }`}
                onClick={() => onSelectOferta(oferta)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{oferta.titulo}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(oferta.fechaCreacion, "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                    <Badge>{oferta.candidatos.length} candidatos</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
