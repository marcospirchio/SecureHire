import { useState, useEffect } from "react"

export interface Busqueda {
  id: string
  titulo: string
  fechaCreacion: string
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
        const [busquedasRes, conteoRes] = await Promise.all([
          fetch("http://localhost:8080/api/busquedas", { credentials: "include" }),
          fetch("http://localhost:8080/api/postulaciones/conteo-por-busqueda", { credentials: "include" }),
        ])

        if (!busquedasRes.ok) throw new Error("No se pudieron obtener las búsquedas")
        if (!conteoRes.ok) throw new Error("No se pudo obtener el conteo")

        const busquedasData = await busquedasRes.json()
        const conteoData: { busquedaId: string; cantidad: number }[] = await conteoRes.json()

        const conteoMap: Record<string, number> = {}
        conteoData.forEach(({ busquedaId, cantidad }) => {
          conteoMap[busquedaId] = cantidad
        })

        const items = Array.isArray(busquedasData.content) ? busquedasData.content : busquedasData
        items.sort((a: Busqueda, b: Busqueda) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())

        const busquedasConConteo: Busqueda[] = items.map((b: Busqueda) => ({
          ...b,
          cantidadCandidatos: conteoMap[b.id] ?? 0,
        }))

        setBusquedas(busquedasConConteo)
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
