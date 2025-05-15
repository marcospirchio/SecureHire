import { useState, useEffect } from "react"
import { JobOffer, PostulacionRequest } from "@/types/job-offer"
import { calcularEdad } from "@/utils/date-utils"

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
          title: busquedaData.titulo,
          phase: busquedaData.faseActual || "Sin fase",
          company: busquedaData.empresa || "",
          location: busquedaData.ubicacion || "",
          workMode: busquedaData.modalidad || "",
          publishedDate: new Date(busquedaData.fechaCreacion).toLocaleDateString("es-AR"),
          description: busquedaData.descripcion || "",
          benefits: busquedaData.beneficios || [],
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
                cvUrl: p.candidato.cvUrl,
                postulacion: {
                  id: p.postulacion.id,
                  fase: p.postulacion.fase || "Sin fase",
                  requisitosExcluyentes: p.postulacion.requisitosExcluyentes || [],
                  notas: p.postulacion.notas || []
                },
                entrevista: entrevista ? {
                  id: entrevista.id,
                  fechaProgramada: entrevista.fechaProgramada,
                  horaProgramada: entrevista.horaProgramada,
                  estado: entrevista.estado
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