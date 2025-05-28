import { useState, useEffect } from "react"

interface Entrevista {  
  id: string
  candidatoId: string 
  fechaProgramada: string
  horaProgramada: string | null
  estado: string
  linkEntrevista: string | null
  nombreCandidato: string
  apellidoCandidato: string
  tituloPuesto: string
}

export function useEntrevistas() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEntrevistas = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/entrevistas/mis-entrevistas-con-candidato", {
          credentials: "include"
        })

        if (!response.ok) {
          throw new Error("Error al obtener las entrevistas")
        }

        const data = await response.json()

        const entrevistasConCandidatoId = await Promise.all(
          data.map(async (e: any) => {
            if (!e.postulacionId) {
              console.warn("postulacionId es undefined para la entrevista:", e)
              return { ...e, candidatoId: null } 
            }
        
            const res = await fetch(`http://localhost:8080/api/postulaciones/${e.postulacionId}`, {
              credentials: "include",
              headers: { 'Accept': 'application/json' }
            })
        
            const post = await res.json()
            return { ...e, candidatoId: post.candidatoId }
          })
        )
        

        setEntrevistas(entrevistasConCandidatoId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener las entrevistas")
      } finally {
        setLoading(false)
      }
    }

    fetchEntrevistas()
  }, [])

  return { entrevistas, loading, error }
}
