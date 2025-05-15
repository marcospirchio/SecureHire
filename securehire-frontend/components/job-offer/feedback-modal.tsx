import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (feedback: string, status: string) => void
  candidateName: string
}

export function FeedbackModal({
  isOpen,
  onClose,
  onConfirm,
  candidateName
}: FeedbackModalProps) {
  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const feedback = formData.get('feedback') as string
    const status = formData.get('status') as string
    onConfirm(feedback, status)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Finalizar proceso con {candidateName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado final
              </label>
              <Select name="status" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="hired">Contratado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Feedback
              </label>
              <Textarea
                id="feedback"
                name="feedback"
                placeholder="Escribe tu feedback sobre el candidato..."
                className="min-h-[150px]"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Confirmar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 