import { useState, useEffect } from "react"

export interface EventoCalendario {
  id: string
  usuarioId: string
  titulo: string
  descripcion?: string
  tipo: string
  fechaHora: string // ISO date string
  ubicacion?: string
  color?: string
  creadoEn: string
}

export function useEventosCalendario() {
  const [eventos, setEventos] = useState<EventoCalendario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const inicio = new Date()
        inicio.setDate(inicio.getDate() - 30)
        const fin = new Date()
        fin.setDate(fin.getDate() + 30)

        const url = `http://localhost:8080/api/calendario/eventos?inicio=${inicio.toISOString()}&fin=${fin.toISOString()}`

        const res = await fetch(url, {
          credentials: "include"
        })
        if (!res.ok) throw new Error("No se pudieron obtener los eventos")
        const data: EventoCalendario[] = await res.json()
        setEventos(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener eventos")
      } finally {
        setLoading(false)
      }
    }
    fetchEventos()
  }, [])

  return { eventos, loading, error }
}
