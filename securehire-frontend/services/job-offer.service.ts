import { JobOffer, Candidate, TimeSlot, Interview, PostulacionRequest } from "@/types/job-offer"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export const jobOfferService = {
  async getJobOffer(id: string): Promise<JobOffer> {
    return fetchWithAuth(`${API_URL}/busquedas/${id}`)
  },

  async getCandidates(jobOfferId: string): Promise<PostulacionRequest[]> {
    return fetchWithAuth(`${API_URL}/postulaciones/busqueda/${jobOfferId}`)
  },

  async getTimeSlots(date: string): Promise<TimeSlot[]> {
    return fetchWithAuth(`${API_URL}/time-slots?date=${date}`)
  },

  async scheduleInterview(jobOfferId: string, candidateId: string, date: string, timeSlotId: string): Promise<Interview> {
    return fetchWithAuth(`${API_URL}/entrevistas`, {
      method: 'POST',
      body: JSON.stringify({
        busquedaId: jobOfferId,
        postulacionId: candidateId,
        fechaProgramada: date,
        horaProgramada: timeSlotId,
        estado: "Pendiente de confirmación",
        linkEntrevista: "",
        motivoCancelacion: null,
        comentarios: []
      })
    })
  },

  async updateCandidateStatus(jobOfferId: string, candidateId: string, status: string, feedback: string): Promise<Candidate> {
    return fetchWithAuth(`${API_URL}/postulaciones/${candidateId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, feedback })
    })
  },

  async addNote(jobOfferId: string, candidateId: string, content: string): Promise<Candidate> {
    return fetchWithAuth(`${API_URL}/postulaciones/${candidateId}/notas`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  }
} 