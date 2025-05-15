import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Calendar } from "./calendar"
import { TimeSlots } from "./time-slots"
import { formatDate, isToday } from "@/utils/date-utils"

interface InterviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (date: string, timeSlotId: string) => void
  candidateName: string
  currentMonth: Date
  selectedDate: string | null
  selectedTimeSlot: string | null
  timeSlots: Array<{
    id: string
    time: string
    isAvailable: boolean
  }>
  onPrevMonth: () => void
  onNextMonth: () => void
  onDateSelect: (day: number, month: number, year: number) => void
  onTimeSlotSelect: (timeSlotId: string) => void
  isDateSelected: (day: number, month: number, year: number) => boolean
}

export function InterviewModal({
  isOpen,
  onClose,
  onConfirm,
  candidateName,
  currentMonth,
  selectedDate,
  selectedTimeSlot,
  timeSlots,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
  onTimeSlotSelect,
  isDateSelected
}: InterviewModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    if (selectedDate && selectedTimeSlot) {
      onConfirm(selectedDate, selectedTimeSlot)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Agendar entrevista con {candidateName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Calendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              onPrevMonth={onPrevMonth}
              onNextMonth={onNextMonth}
              onDateSelect={onDateSelect}
              isDateSelected={isDateSelected}
            />
          </div>

          <div>
            <TimeSlots
              selectedDate={selectedDate}
              timeSlots={timeSlots}
              selectedTimeSlot={selectedTimeSlot}
              onTimeSlotSelect={onTimeSlotSelect}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTimeSlot}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
} 