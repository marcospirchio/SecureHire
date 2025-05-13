"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ModalCVProps {
  isOpen: boolean
  onClose: () => void
  candidatoNombre: string
  cvUrl?: string
}

export function ModalCV({ isOpen, onClose, candidatoNombre, cvUrl }: ModalCVProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>CV de {candidatoNombre}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow h-[60vh]">
          {cvUrl ? (
            <iframe src={cvUrl} className="w-full h-full" title={`CV de ${candidatoNombre}`} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <p className="text-muted-foreground mb-4">No hay CV disponible para este candidato</p>
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
