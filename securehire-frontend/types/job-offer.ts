export interface Candidate {
  id: string
  name: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  dni: string
  gender: string
  nationality: string
  residenceCountry: string
  province: string
  address: string
  birthDate: string
  age: number
  location: string
  cvUrl: string
  postulacion: {
    id: string
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
    linkEntrevista: string
  }
}

export interface PostulacionRequest {
  postulacion: {
    id: string
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