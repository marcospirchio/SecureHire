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
        },
        credentials: "include", // Importante para manejar las cookies
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al iniciar sesión")
      }

      const data: LoginResponse = await response.json()
      
      // Guardar el token en localStorage
      localStorage.setItem("token", data.token)
      
      // Redirigir al dashboard
      router.push("/")
      
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { login, loading, error }
} 