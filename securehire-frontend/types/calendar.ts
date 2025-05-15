export interface CalendarEvent {
    id?: string
    date: string
    time: string
    title: string
    person?: string
    link?: string
    candidateName?: string
    jobTitle?: string
    estado?: string
    tipo: string  // debe ser obligatorio
    description: string
    ubicacion: string
  }
  