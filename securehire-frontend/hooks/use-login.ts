import { useState } from "react"
import { useRouter } from "next/navigation"

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: {
    id: string
    nombre: string
    apellido: string
    email: string
    rol: string
  }
}

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const login = async (credentials: LoginCredentials) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        let errorMessage = "Error al iniciar sesión"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      let data: LoginResponse
      try {
        data = await response.json()
      } catch (e) {
        throw new Error("Error al procesar la respuesta del servidor")
      }

      if (!data.token || !data.user) {
        throw new Error("Respuesta del servidor incompleta")
      }

      localStorage.setItem("token", data.token)
      
      router.push("/")
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesión"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { login, loading, error }
} 