import { Button } from "@/components/ui/button"

interface TimeSlot {
  id: string
  time: string
  isAvailable: boolean
}

interface TimeSlotsProps {
  selectedDate: string | null
  timeSlots: TimeSlot[]
  selectedTimeSlot: string | null
  onTimeSlotSelect: (timeSlotId: string) => void
}

export function TimeSlots({
  selectedDate,
  timeSlots,
  selectedTimeSlot,
  onTimeSlotSelect
}: TimeSlotsProps) {
  if (!selectedDate) {
    return (
      <div className="text-center text-gray-500 py-8">
        Selecciona una fecha para ver los horarios disponibles
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Horarios disponibles</h3>
      <div className="grid grid-cols-3 gap-2">
        {timeSlots.map((slot) => (
          <Button
            key={slot.id}
            variant={selectedTimeSlot === slot.id ? "default" : "outline"}
            className={`h-9 text-sm ${
              !slot.isAvailable ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!slot.isAvailable}
            onClick={() => slot.isAvailable && onTimeSlotSelect(slot.id)}
          >
            {slot.time}
          </Button>
        ))}
      </div>
    </div>
  )
} 