import { useState, useEffect } from "react"

export interface ConteoPostulaciones {
  busquedaId: string
  cantidad: number
}

export function usePostulacionesConteo() {
  const [conteo, setConteo] = useState<ConteoPostulaciones[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConteo = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/postulaciones/conteo-por-busqueda", {
          credentials: "include"
        })
        if (!response.ok) throw new Error("No se pudo obtener el conteo de postulaciones")
        const data = await response.json()
        setConteo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener el conteo de postulaciones")
      } finally {
        setLoading(false)
      }
    }

    fetchConteo()
  }, [])

  return { conteo, loading, error }
} 