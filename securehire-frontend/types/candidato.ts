export type Estado = "Entrevista confirmada" | "Pendiente de confirmación" | "No se presentó" | string

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
  autor?: string
  empresa?: string
}

export interface Candidato {
  id: number
  _id?: string
  nombre: string
  apellido?: string
  dni?: string
  edad: number
  sexo: string
  localidad?: string
  puesto: string
  reputacion: number
  estado: Estado
  email: string
  telefono: string
  tiempoRespuesta: string
  entrevistas: Entrevista[]
  comentarios: Comentario[]
  anotacionesPersonales: AnotacionPersonal[]
  respuestas?: Record<string, any>
  cumpleRequisitosExcluyentes?: boolean
  fechaNacimiento?: Date
  genero?: string
  nacionalidad?: string
  paisResidencia?: string
  provincia?: string
  direccion?: string
}

export interface EventoReciente {
  id: number
  candidato: string
  accion: string
  fecha: Date
  tipo: "confirmacion" | "cancelacion" | "nuevo"
}
