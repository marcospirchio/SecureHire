import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Candidate } from "@/types/job-offer";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, getDay, parse } from "date-fns";
import { es } from "date-fns/locale";

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onConfirm: (date: string, time: string) => void;
}

export function InterviewModal({ isOpen, onClose, candidate, onConfirm }: InterviewModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4, 13)); 
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6;

    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
      });
    }

    const remainingDays = 7 - (days.length % 7 || 7);
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const formattedMonthYear = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date(2025, 4, 13); 
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isDateSelected = (day: number, month: number, year: number) => {
    if (!selectedDate) return false;

    const [selectedDay, selectedMonth, selectedYear] = selectedDate.split("/").map(Number);
    return day === selectedDay && month + 1 === selectedMonth && year === selectedYear;
  };

  const handleDateSelect = (day: number, month: number, year: number) => {
    
    if (month === currentMonth.getMonth() && year === currentMonth.getFullYear()) {
      setSelectedDate(`${day}/${month + 1}/${year}`);
      setSelectedTime(null); 
    }
  };

  const handleConfirmInterview = () => {
    if (selectedDate && selectedTime) {
      onConfirm(selectedDate, selectedTime);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  };

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", 
    "18:00", "18:30", "19:00", "19:30"
  ];

  const isConfirmed = candidate?.entrevista?.estado.toLowerCase() === "confirmada"
  const isPending = candidate?.entrevista?.estado.toLowerCase() === "pendiente de confirmación"

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-y-auto max-h-[85vh]">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle>Agendar entrevista</DialogTitle>
            <DialogDescription>
              Seleccione una fecha y horario para la entrevista con {candidate?.name} {candidate?.lastName}
            </DialogDescription>
            {candidate?.entrevista && (
              <div className="mt-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full flex items-center w-fit ${
                    isConfirmed
                      ? "bg-green-100 text-green-800" 
                      : isPending
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  ENTREVISTA {formatDate(candidate.entrevista.fechaProgramada)} | {candidate.entrevista.horaProgramada}
                  {isConfirmed ? (
                    <CheckCircle2 className="h-3 w-3 ml-1 text-green-600" />
                  ) : isPending ? (
                    <AlertTriangle className="h-3 w-3 ml-1 text-yellow-600" />
                  ) : (
                    <AlertCircle className="h-3 w-3 ml-1 text-amber-600" />
                  )}
                </span>
              </div>
            )}
          </DialogHeader>

          <div className="py-4">
            {/* Encabezado del calendario con navegación */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{formattedMonthYear}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 p-0" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 p-0" onClick={goToNextMonth}>
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
                    onClick={() => date.isCurrentMonth && handleDateSelect(date.day, date.month, date.year)}
                  >
                    {date.day}
                  </div>
                ))}
              </div>
            </div>

            {/* Selección de horario */}
            {selectedDate && (
              <div className="mt-6">
                <h4 className="flex items-center text-base font-medium mb-4">
                  <Clock className="mr-2 h-5 w-5" />
                  Horario para el{" "}
                  {new Date(
                    parseInt(selectedDate.split("/")[2]),
                    parseInt(selectedDate.split("/")[1]) - 1,
                    parseInt(selectedDate.split("/")[0])
                  ).toLocaleDateString("es-ES", { weekday: "long" })}{" "}
                  {selectedDate.split("/")[0]} de{" "}
                  {new Date(
                    parseInt(selectedDate.split("/")[2]), 
                    parseInt(selectedDate.split("/")[1]) - 1, 
                    1
                  ).toLocaleDateString("es-ES", { month: "long" })}:
                </h4>

                <div className="pr-2">
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        className={`py-3 px-4 border rounded-md text-center hover:bg-gray-50 ${
                          selectedTime === time ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6 mt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmInterview} 
              disabled={!selectedDate || !selectedTime}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Agendar entrevista
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 