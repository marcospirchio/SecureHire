import { useState, useEffect } from "react"

interface Entrevista {
  id: string
  fechaProgramada: string
  horaProgramada: string
  estado: string
  linkEntrevista: string
  nombreCandidato: string
  apellidoCandidato: string
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

        const data: Entrevista[] = await response.json()
        setEntrevistas(data)
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
