"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Evento {
  id: number
  titulo: string
  fecha: Date
  candidato: string
  descripcion?: string
}

export function useCalendario(eventosIniciales: Evento[]) {
  const [eventos, setEventos] = useState<Evento[]>(eventosIniciales)
  const [activeTab, setActiveTab] = useState("calendario")
  const [showNewEventDialog, setShowNewEventDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("09:00")
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")

  const handleCreateEvent = () => {
    if (!selectedDate || !eventTitle) return

    const [hours, minutes] = selectedTime.split(":").map(Number)
    const eventDate = new Date(selectedDate)
    eventDate.setHours(hours, minutes)

    const newEvent = {
      id: eventos.length + 1,
      titulo: eventTitle,
      fecha: eventDate,
      candidato: eventTitle, // Usamos el título como nombre del candidato para mantener compatibilidad
      descripcion: eventDescription,
    }

    setEventos([...eventos, newEvent])
    setShowNewEventDialog(false)
    resetForm()
  }

  const resetForm = () => {
    setEventTitle("")
    setEventDescription("")
    setSelectedDate(new Date())
    setSelectedTime("09:00")
  }

  const getProximosEventos = () => {
    return eventos.filter((evento) => evento.fecha > new Date()).sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
  }

  const formatEventDate = (date: Date) => {
    return format(date, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })
  }

  return {
    eventos,
    activeTab,
    setActiveTab,
    showNewEventDialog,
    setShowNewEventDialog,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    eventTitle,
    setEventTitle,
    eventDescription,
    setEventDescription,
    handleCreateEvent,
    getProximosEventos,
    formatEventDate,
  }
}
