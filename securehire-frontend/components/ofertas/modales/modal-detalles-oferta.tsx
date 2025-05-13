"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface ModalDetallesOfertaProps {
  isOpen: boolean
  onClose: () => void
  oferta: {
    id: string
    titulo: string
    descripcion: string
    empresa: string
    ubicacion: string
    fechaPublicacion: string
    requisitos: { nombre: string; obligatorio: boolean }[]
    beneficios?: string[]
    tipoContrato?: string
    salario?: string
  }
}

export function ModalDetallesOferta({ isOpen, onClose, oferta }: ModalDetallesOfertaProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{oferta.titulo}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm">Empresa</h3>
              <p>{oferta.empresa}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Ubicación</h3>
              <p>{oferta.ubicacion}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Fecha de publicación</h3>
              <p>{oferta.fechaPublicacion}</p>
            </div>

            {oferta.tipoContrato && (
              <div>
                <h3 className="font-medium text-sm">Tipo de contrato</h3>
                <p>{oferta.tipoContrato}</p>
              </div>
            )}

            {oferta.salario && (
              <div>
                <h3 className="font-medium text-sm">Salario</h3>
                <p>{oferta.salario}</p>
              </div>
            )}

            <div>
              <h3 className="font-medium text-sm">Descripción</h3>
              <p className="text-sm">{oferta.descripcion}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm">Requisitos</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {oferta.requisitos.map((req, index) => (
                  <Badge key={index} variant={req.obligatorio ? "default" : "outline"}>
                    {req.nombre} {req.obligatorio && "*"}
                  </Badge>
                ))}
              </div>
            </div>

            {oferta.beneficios && oferta.beneficios.length > 0 && (
              <div>
                <h3 className="font-medium text-sm">Beneficios</h3>
                <ul className="list-disc pl-5 text-sm">
                  {oferta.beneficios.map((beneficio, index) => (
                    <li key={index}>{beneficio}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
