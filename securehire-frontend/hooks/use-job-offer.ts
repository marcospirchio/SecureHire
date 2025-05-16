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
        
        const [busquedaRes, postulacionesRes, entrevistasRes] = await Promise.all([
          fetch(`http://localhost:8080/api/busquedas/${id}`, { 
            credentials: "include",
            headers: {
              'Accept': 'application/json'
            }
          }),
          fetch(`http://localhost:8080/api/postulaciones/busqueda/${id}/completas`, { 
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

        if (!busquedaRes.ok || !postulacionesRes.ok || !entrevistasRes.ok) {
          throw new Error('Error al obtener los datos')
        }

        const busquedaData = await busquedaRes.json()
        const postulacionesData: PostulacionRequest[] = await postulacionesRes.json()
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
          fechaCreacion: new Date(busquedaData.fechaCreacion).toLocaleDateString("es-AR"),
          descripcion: busquedaData.descripcion || "",
          beneficios: busquedaData.beneficios || [],
          candidates: postulacionesData
            .filter(p => p.candidato && p.postulacion)
            .map(p => {
              // Buscar la entrevista correspondiente
              const entrevista = entrevistasData.find(
                (e: any) => e.postulacionId === p.postulacion.id
              )

              return {
                id: p.postulacion.id,
                name: p.candidato.nombre,
                lastName: p.candidato.apellido,
                age: calcularEdad(p.candidato.fechaNacimiento),
                gender: p.candidato.genero || "No especificado",
                location: p.candidato.provincia || "No especificada",
                email: p.candidato.email,
                phone: p.candidato.telefono,
                countryCode: "+54",
                dni: p.candidato.dni,
                birthDate: new Date(p.candidato.fechaNacimiento).toLocaleDateString("es-AR"),
                nationality: p.candidato.nacionalidad,
                residenceCountry: p.candidato.paisResidencia,
                province: p.candidato.provincia,
                address: p.candidato.direccion,
                cvUrl: p.candidato.cvUrl || "",
                postulacion: {
                  id: p.postulacion.id,
                  candidatoId: p.candidato.id,
                  requisitosExcluyentes: p.postulacion.requisitosExcluyentes || [],
                  notas: p.postulacion.notas || []
                },
                entrevista: entrevista ? {
                  id: entrevista.id,
                  fechaProgramada: entrevista.fechaProgramada,
                  horaProgramada: entrevista.horaProgramada,
                  estado: entrevista.estado,
                  linkEntrevista: entrevista.linkEntrevista || ""
                } : undefined
              }
            })
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
        
        // Obtener la búsqueda y sus postulaciones en una sola llamada
        const response = await fetch(`http://localhost:8080/api/busquedas/${id}/completa`, { 
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
        
        // Asegurarnos de que todos los campos estén presentes
        const jobOfferData: JobOffer = {
          id: busquedaData._id || busquedaData.id,
          titulo: busquedaData.titulo || "",
          empresa: busquedaData.empresa || "",
          ubicacion: busquedaData.ubicacion || "",
          modalidad: busquedaData.modalidad || "",
          tipoContrato: busquedaData.tipoContrato || "",
          salario: busquedaData.salario || "",
          fechaCreacion: new Date(busquedaData.fechaCreacion).toLocaleDateString("es-AR"),
          descripcion: busquedaData.descripcion || "",
          beneficios: busquedaData.beneficios || [],
          candidates: busquedaData.postulaciones?.map((p: any) => ({
            id: p.candidato.id,
            name: p.candidato.nombre,
            lastName: p.candidato.apellido,
            email: p.candidato.email,
            phone: p.candidato.telefono,
            countryCode: "+54",
            dni: p.candidato.dni,
            gender: p.candidato.genero || "No especificado",
            nationality: p.candidato.nacionalidad,
            residenceCountry: p.candidato.paisResidencia,
            province: p.candidato.provincia,
            address: p.candidato.direccion,
            birthDate: new Date(p.candidato.fechaNacimiento).toLocaleDateString("es-AR"),
            age: calcularEdad(p.candidato.fechaNacimiento),
            location: p.candidato.provincia,
            cvUrl: p.candidato.cvUrl || "",
            postulacion: {
              id: p.id,
              candidatoId: p.candidato.id,
              requisitosExcluyentes: p.requisitosExcluyentes || [],
              notas: p.notas || []
            }
          })) || [],
          camposAdicionales: busquedaData.camposAdicionales || [],
          camposPorDefecto: busquedaData.camposPorDefecto || [],
          fases: busquedaData.fases || [],
          usuarioId: busquedaData.usuarioId || "",
          archivada: busquedaData.archivada || false
        }

        console.log('Datos procesados:', jobOfferData)
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