import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock } from "lucide-react"

interface InterviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (date: string, time: string) => void
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
]

export function InterviewModal({ isOpen, onClose, onConfirm }: InterviewModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")

  // Resetear la fecha cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const today = new Date()
      setSelectedDate(today)
    }
  }, [isOpen])

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onConfirm(
        format(selectedDate, "dd/MM/yyyy"),
        selectedTime
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendar Entrevista</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Seleccionar Fecha</h4>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={es}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
              defaultMonth={new Date()}
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Seleccionar Hora</h4>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                  className="w-full"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 