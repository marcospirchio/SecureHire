export type Estado = "Entrevista confirmada" | "Pendiente de confirmación" | "No se presentó"

export interface Entrevista {
  fecha: Date
  estado: Estado
  notas: string
}

export interface Comentario {
  reclutador: string
  fecha: Date
  texto: string
}

export interface AnotacionPersonal {
  id: number
  fecha: Date
  texto: string
}

export interface Candidato {
  id: number
  _id?: string // Añadido para compatibilidad
  nombre: string
  apellido?: string // Añadido
  dni?: string // Añadido
  edad: number // Añadido
  sexo: string // Añadido
  puesto: string
  reputacion: number
  estado: Estado
  email: string
  telefono: string
  tiempoRespuesta: string
  entrevistas: Entrevista[]
  comentarios: Comentario[]
  anotacionesPersonales: AnotacionPersonal[]
  respuestas?: Record<string, any> // Añadido
  cumpleRequisitosExcluyentes?: boolean // Añadido
}

export interface EventoReciente {
  id: number
  candidato: string
  accion: string
  fecha: Date
  tipo: "confirmacion" | "cancelacion" | "nuevo"
}
