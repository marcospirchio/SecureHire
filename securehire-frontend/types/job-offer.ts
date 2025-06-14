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
  fotoPerfil?: string
  postulacion: {
    id: string
    candidatoId: string
    busquedaId: string
    estado?: string
    requisitosExcluyentes?: { campo: string, respuesta: string | string[] }[]
    notas?: {
      author: string
      company: string
      date: string
      content: string
    }[]
    resumenCv?: string
    respuestas?: {
      campo: string
      respuesta: string | string[]
    }[]
    fotoPerfil?: string
    opinionComentariosIA?: string
    esFavorito?: boolean
    puntajeGeneral?: number | null
    motivosIA?: string[] | null
    puntajeRequisitosClave?: number | null
    puntajeExperienciaLaboral?: number | null
    puntajeFormacionAcademica?: number | null
    puntajeIdiomasYSoftSkills?: number | null
    puntajeOtros?: number | null
    perfilDetectadoIA?: string | null
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

export interface CampoAdicional {
  nombre: string;
  tipo: string;
  esExcluyente: boolean;
  opciones: string[];
  valoresExcluyentes: string[];
  obligatorio: boolean;
}

export interface CampoPorDefecto {
  nombre: string;
  tipo: string;
  esExcluyente: boolean;
  opciones: string[];
  valoresExcluyentes: string[];
  obligatorio: boolean;
}

export interface JobOffer {
  id: string
  titulo: string
  empresa: string
  ubicacion: string
  modalidad: string
  tipoContrato: string
  salario: string
  fechaCreacion: string
  descripcion: string
  beneficios: string[]
  candidates: Candidate[]
  camposAdicionales?: CampoAdicional[]
  camposPorDefecto?: CampoPorDefecto[]
  fases?: string[]
  usuarioId?: string
  archivada?: boolean
  urlPublica?: string
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

export interface Postulacion {
  id: string;
  candidatoId: string;
  busquedaId: string;
  estado?: string;
  requisitosExcluyentes?: {
    campo: string;
    respuesta: string | string[];
  }[];
  notas?: {
    author: string;
    company: string;
    date: string;
    content: string;
  }[];
  resumenCv?: string;
  respuestas?: {
    campo: string;
    respuesta: string | string[];
  }[];
  esFavorito?: boolean;
  puntajeGeneral?: number | null;
  motivosIA?: string[] | null;
  puntajeRequisitosClave?: number | null;
  puntajeExperienciaLaboral?: number | null;
  puntajeFormacionAcademica?: number | null;
  puntajeIdiomasYSoftSkills?: number | null;
  puntajeOtros?: number | null;
  perfilDetectadoIA?: string | null;
} 