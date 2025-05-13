"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ModalFeedbackProps {
  isOpen: boolean
  onClose: () => void
  candidatoId: string
  candidatoNombre: string
  onSubmit: (feedback: string) => void
}

export function ModalFeedback({ isOpen, onClose, candidatoId, candidatoNombre, onSubmit }: ModalFeedbackProps) {
  const [feedback, setFeedback] = useState("")

  const handleSubmit = () => {
    onSubmit(feedback)
    setFeedback("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir feedback para {candidatoNombre}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Escribe tu feedback sobre este candidato..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
