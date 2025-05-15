export const calcularEdad = (fechaNacimiento: string): number => {
  const hoy = new Date()
  const fechaNac = new Date(fechaNacimiento)
  let edad = hoy.getFullYear() - fechaNac.getFullYear()
  const m = hoy.getMonth() - fechaNac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--
  }
  return edad
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  })
}

export function isToday(day: number, month: number, year: number): boolean {
  const today = new Date()
  return (
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  )
}

export function formatDateForAPI(day: number, month: number, year: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function parseDateFromAPI(dateString: string): { day: number; month: number; year: number } {
  const [year, month, day] = dateString.split('-').map(Number)
  return {
    day,
    month: month - 1,
    year
  }
}

export const isDateSelected = (day: number, month: number, year: number, selectedDate: string | null): boolean => {
  if (!selectedDate) return false

  // Parsear la fecha seleccionada
  const [selectedDay, selectedMonth, selectedYear] = selectedDate.split("/").map(Number)
  return day === selectedDay && month + 1 === selectedMonth && year === selectedYear
} 