import type { Candidato } from "./candidato"

export interface CampoFormulario {
  id: string
  tipo: "texto" | "checkbox" | "dropdown" | "numero"
  etiqueta: string
  esExcluyente: boolean
  opciones?: string[] // Para dropdown
}

export interface Formulario {
  id: string
  nombre: string
  campos: CampoFormulario[]
}

export interface OfertaTrabajo {
  id: string
  titulo: string
  descripcion: string
  fechaCreacion: Date
  formulario: Formulario | null
  candidatos: Candidato[]
}
