import { useState, useEffect } from "react"

interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: string
  fotoPerfil?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/auth/me", {
          credentials: "include" // Importante para enviar las cookies
        })

        if (!response.ok) {
          throw new Error("No se pudo obtener la información del usuario")
        }

        const data = await response.json()
        setUser(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener datos del usuario")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, error }
} 