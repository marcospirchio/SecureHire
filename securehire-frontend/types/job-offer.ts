export interface Candidate {
  id: string
  name: string
  lastName: string
  age: number
  gender: string
  location: string
  email: string
  phone: string
  countryCode: string
  dni: string
  birthDate: string
  nationality: string
  residenceCountry: string
  province: string
  address: string
  cvUrl: string
  postulacion: {
    id: string
    fase: string
    requisitosExcluyentes?: string[]
    notas?: {
      author: string
      company: string
      date: string
      content: string
    }[]
  }
  entrevista?: {
    id: string
    fechaProgramada: string
    horaProgramada: string
    estado: string
    linkEntrevista?: string
  }
}

export interface PostulacionRequest {
  candidato: {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono: string
    dni: string
    fechaNacimiento: string
    genero?: string
    nacionalidad: string
    paisResidencia: string
    provincia: string
    direccion: string
    cvUrl: string | undefined
  }
  postulacion: {
    id: string
    fase: string
    requisitosExcluyentes?: string[]
    notas?: Array<{
      author: string
      company: string
      date: string
      content: string
    }>
  }
}

export interface JobOffer {
  id: string
  titulo: string
  faseActual: string
  empresa: string
  ubicacion: string
  modalidad: string
  fechaCreacion: string
  descripcion: string
  beneficios: string[]
  candidates: Candidate[]
}

export interface TimeSlot {
  id: string
  time: string
  isAvailable: boolean
}

export interface Interview {
  id: string
  candidateId: string
  date: string
  timeSlotId: string
  status: string
  estado: string
  feedback?: string
  createdAt: string
  updatedAt: string
  linkEntrevista?: string
} 