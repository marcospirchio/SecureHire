import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { formatDate, isToday } from "@/utils/date-utils"

interface CalendarProps {
  currentMonth: Date
  selectedDate: string | null
  onPrevMonth: () => void
  onNextMonth: () => void
  onDateSelect: (day: number, month: number, year: number) => void
  isDateSelected: (day: number, month: number, year: number) => boolean
}

export function Calendar({
  currentMonth,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
  isDateSelected
}: CalendarProps) {
  // Función para generar los días del calendario
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Primer día del mes
    const firstDay = new Date(year, month, 1)
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0)

    // Ajustar para que la semana comience en lunes (0 = lunes, 6 = domingo)
    let firstDayOfWeek = firstDay.getDay() - 1
    if (firstDayOfWeek === -1) firstDayOfWeek = 6 // Si es domingo (0), convertir a 6

    const daysInMonth = lastDay.getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days = []

    // Días del mes anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      })
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
      })
    }

    // Días del mes siguiente para completar la última semana
    const remainingDays = 7 - (days.length % 7 || 7)
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      })
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const formattedMonthYear = formatDate(currentMonth)

  return (
    <div>
      {/* Encabezado del calendario con navegación */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{formattedMonthYear}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 p-0" onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 p-0" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendario */}
      <div className="border rounded-lg overflow-hidden">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 text-center border-b">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, i) => (
            <div key={i} className="py-2 text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 text-center">
          {calendarDays.map((date, index) => (
            <div
              key={index}
              className={`py-2 ${
                !date.isCurrentMonth
                  ? "text-gray-400"
                  : isToday(date.day, date.month, date.year)
                    ? "border border-gray-900 rounded-md"
                    : isDateSelected(date.day, date.month, date.year)
                      ? "bg-blue-100"
                      : "hover:bg-gray-50"
              } ${date.isCurrentMonth ? "cursor-pointer" : ""}`}
              onClick={() => date.isCurrentMonth && onDateSelect(date.day, date.month, date.year)}
            >
              {date.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 