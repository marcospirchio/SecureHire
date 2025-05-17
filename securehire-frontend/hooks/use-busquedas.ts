import { useState, useEffect } from "react"

export interface Busqueda {
  id: string
  titulo: string
  fechaCreacion: string // ISO
  faseActual?: string
  cantidadCandidatos?: number
  archivada?: boolean
}

export interface ConteoPostulaciones {
  busquedaId: string
  cantidad: number
}

export function useBusquedas() {
  const [busquedas, setBusquedas] = useState<Busqueda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch búsquedas
        const resBusquedas = await fetch("http://localhost:8080/api/busquedas", {
          credentials: "include"
        })
        if (!resBusquedas.ok) throw new Error("No se pudieron obtener las búsquedas")
        const busquedasData = await resBusquedas.json()
        const busquedas = (Array.isArray(busquedasData.content) ? busquedasData.content : busquedasData) as Busqueda[]

        // Fetch conteo de postulaciones
        const resConteo = await fetch("http://localhost:8080/api/postulaciones/conteo-por-busqueda", {
          credentials: "include"
        })
        if (!resConteo.ok) throw new Error("No se pudo obtener el conteo de postulaciones")
        const conteos: ConteoPostulaciones[] = await resConteo.json()

        // Merge búsquedas con conteo
        const busquedasConConteo = busquedas.map((b) => {
          const conteo = conteos.find((c) => c.busquedaId === b.id)
          return {
            ...b,
            cantidadCandidatos: conteo?.cantidad || 0
          }
        })

        // Ordenar
        busquedasConConteo.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())

        setBusquedas(busquedasConConteo)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener datos")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { busquedas, loading, error }
}
