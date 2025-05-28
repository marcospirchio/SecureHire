import { useState, useEffect } from "react"

export interface Busqueda {
  id: string
  titulo: string
  descripcion: string
  faseActual: string
  fechaCreacion: string
  empresa: string
  ubicacion: string
  modalidad: string
  beneficios: string[]
}

export interface Postulacion {
  id: string
  candidatoId: string
  busquedaId: string
  fase: string
  estado: string
  fechaPostulacion: string
  candidato: {
    id: string
    nombre: string
    apellido: string
    email: string
    telefono: string
    dni: string
    fechaNacimiento: string
    nacionalidad: string
    paisResidencia: string
    provincia: string
    direccion: string
    cvUrl: string
  }
}

export function useBusqueda(id: string) {
  const [busqueda, setBusqueda] = useState<Busqueda | null>(null)
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusqueda = async () => {
      try {
        const busquedaRes = await fetch(`http://localhost:8080/api/busquedas/${id}`, {
          credentials: "include"
        })
        if (!busquedaRes.ok) throw new Error("No se pudo obtener la búsqueda")
        const busquedaData = await busquedaRes.json()
        setBusqueda(busquedaData)

        const postulacionesRes = await fetch(`http://localhost:8080/api/postulaciones/busqueda/${id}`, {
          credentials: "include"
        })
        if (!postulacionesRes.ok) throw new Error("No se pudieron obtener las postulaciones")
        const postulacionesData = await postulacionesRes.json()
        setPostulaciones(postulacionesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchBusqueda()
    }
  }, [id])

  return { busqueda, postulaciones, loading, error }
}  