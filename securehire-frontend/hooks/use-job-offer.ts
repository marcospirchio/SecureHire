import { useState, useEffect } from "react"
import { Candidate, JobOffer, PostulacionRequest } from "@/types/job-offer"
import { calcularEdad } from "@/utils/date-utils"

interface CampoAdicional {
  nombre: string;
  tipo: string;
  esExcluyente: boolean;
  opciones: string[];
  valoresExcluyentes: string[];
  obligatorio: boolean;
}

export function useJobOffer(id: string) {
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data for busqueda ID:', id)
        
        const [busquedaRes, entrevistasRes] = await Promise.all([
          fetch(`http://localhost:8080/api/busquedas/${id}`, { 
            credentials: "include",
            headers: {
              'Accept': 'application/json'
            }
          }),
          fetch(`http://localhost:8080/api/entrevistas/mis-entrevistas-con-candidato`, {
            credentials: "include",
            headers: {
              'Accept': 'application/json'
            }
          })
        ])

        if (!busquedaRes.ok) {
          throw new Error('Error al obtener los datos')
        }

        const busquedaData = await busquedaRes.json()
        const entrevistasData = await entrevistasRes.json()
        console.log('Datos de entrevistas:', entrevistasData)

        // Convertir los datos al formato esperado por el componente
        const jobOfferData: JobOffer = {
          id: busquedaData.id,
          titulo: busquedaData.titulo,
          empresa: busquedaData.empresa || "No especificada",
          ubicacion: busquedaData.ubicacion || "No especificada",
          modalidad: busquedaData.modalidad || "No especificada",
          tipoContrato: busquedaData.tipoContrato || "No especificado",
          salario: busquedaData.salario || "No especificado",
          fechaCreacion: busquedaData.fechaCreacion,
          descripcion: busquedaData.descripcion || "",
          beneficios: busquedaData.beneficios || [],
          candidates: busquedaData.candidates || [],
          camposAdicionales: busquedaData.camposAdicionales || [],
          camposPorDefecto: busquedaData.camposPorDefecto || [],
          fases: busquedaData.fases || [],
          usuarioId: busquedaData.usuarioId || "",
          archivada: busquedaData.archivada || false
        }
        setJobOffer(jobOfferData)
      } catch (error) {
        console.error("Error al cargar los datos:", error)
        setError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { jobOffer, loading, error, setJobOffer }
}

export function usePublicJobOffer(id: string) {
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching public job offer data for ID:', id)
        const response = await fetch(`http://localhost:8080/api/busquedas/${id}`, { 
          credentials: "include",
          headers: {
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Error al obtener los datos de la oferta')
        }

        const busquedaData = await response.json()
        console.log('Datos recibidos del backend:', busquedaData)
        const jobOfferData: JobOffer = {
          id: busquedaData.id,
          titulo: busquedaData.titulo || "",
          empresa: busquedaData.empresa || "",
          ubicacion: busquedaData.ubicacion || "",
          modalidad: busquedaData.modalidad || "",
          tipoContrato: busquedaData.tipoContrato || "",
          salario: busquedaData.salario || "",
          fechaCreacion: busquedaData.fechaCreacion,
          descripcion: busquedaData.descripcion || "",
          beneficios: busquedaData.beneficios || [],
          candidates: [],
          camposAdicionales: busquedaData.camposAdicionales || [],
          camposPorDefecto: busquedaData.camposPorDefecto || [],
          fases: busquedaData.fases || [],
          usuarioId: busquedaData.usuarioId || "",
          archivada: busquedaData.archivada || false
        }
        setJobOffer(jobOfferData)
      } catch (error) {
        console.error("Error al cargar los datos:", error)
        setError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  return { jobOffer, loading, error }
} 