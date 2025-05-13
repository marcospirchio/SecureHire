"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setIsSubmitting(true)

    // Validación básica
    if (!email) {
      setMessage("Por favor ingrese su dirección de email")
      setIsSubmitting(false)
      return
    }

    // Simulación de envío de correo de recuperación
    setTimeout(() => {
      setMessage("Se ha enviado un correo con instrucciones para recuperar su contraseña")
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e3a73] relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 z-0">
        <canvas id="network-canvas" className="absolute inset-0"></canvas>
      </div>

      {/* Contenedor del formulario */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gray-100 p-3 rounded-lg mb-4">
            <Image src="/logo-securehire.png" alt="SecureHire Logo" width={32} height={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p className="text-gray-600 text-center mt-2">
            Ingrese su email y le enviaremos instrucciones para restablecer su contraseña
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-md mb-4 text-sm ${message.includes("enviado") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#111827] text-white py-3 rounded-md hover:bg-[#1e2942] transition-colors disabled:opacity-70"
          >
            {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
          </button>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-[#1e7ae0] hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </form>

        <div className="text-center mt-8 text-gray-500 text-sm">SecureHire © 2025</div>
      </div>
    </div>
  )
}
