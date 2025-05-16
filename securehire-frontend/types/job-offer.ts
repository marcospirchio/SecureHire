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
    estado?: string
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
    postulacionId?: string
  }
}

export interface PostulacionRequest {
  postulacion: {
    id: string
    fase: string
    estado?: string
    requisitosExcluyentes?: string[]
    notas?: {
      author: string
      company: string
      date: string
      content: string
    }[]
  }
  candidato: {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono: string
    dni: string
    genero?: string
    nacionalidad: string
    paisResidencia: string
    provincia: string
    direccion: string
    fechaNacimiento: string
    cvUrl?: string
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