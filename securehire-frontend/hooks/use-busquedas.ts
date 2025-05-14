import { useState, useEffect } from "react"

export interface Busqueda {
  id: string
  titulo: string
  fechaCreacion: string // ISO
  faseActual?: string
  cantidadCandidatos?: number
}

export function useBusquedas() {
  const [busquedas, setBusquedas] = useState<Busqueda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusquedas = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/busquedas", {
          credentials: "include"
        })
        if (!response.ok) throw new Error("No se pudieron obtener las búsquedas")
        const data = await response.json()
        // data.content es el array de búsquedas si viene paginado
        const items = (Array.isArray(data.content) ? data.content : data) as Busqueda[]
        // Ordenar por fechaCreacion descendente
        items.sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime())
        setBusquedas(items)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener búsquedas")
      } finally {
        setLoading(false)
      }
    }
    fetchBusquedas()
  }, [])

  return { busquedas, loading, error }
} 