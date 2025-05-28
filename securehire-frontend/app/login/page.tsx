"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useLogin } from "@/hooks/use-login"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, loading, error: loginError } = useLogin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, password })
    } catch (err) {
      console.error("Error en el login:", err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e3a73] relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 z-0">
        <NetworkBackground />
      </div>

      {/* Contenedor del formulario */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gray-100 p-3 rounded-lg mb-4">
            <Image src="/logo-securehire.png" alt="SecureHire Logo" width={32} height={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SecureHire</h1>
          <p className="text-gray-600 text-center mt-2">Ingrese sus credenciales para acceder a su cuenta</p>
        </div>

        {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">{loginError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-gray-700">
                Contraseña
              </label>
              <Link href="/recuperar-contrasena" className="text-[#1e7ae0] text-sm hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#111827] text-white py-3 rounded-md hover:bg-[#1e2942] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="text-center mt-8 text-gray-500 text-sm">SecureHire © 2025</div>
      </div>
    </div>
  )
}

function NetworkBackground() {
  useEffect(() => {
    const canvas = document.getElementById("network-canvas") as HTMLCanvasElement
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const particleCount = 70
    const particles: Particle[] = []
    const connectionDistance = 150
    const colors = ["#4a88eb", "#6ad0c5", "#ffffff"]

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width || this.x < 0) {
          this.speedX = -this.speedX
        }
        if (this.y > canvas.height || this.y < 0) {
          this.speedY = -this.speedY
        }
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            if (!ctx) return
            const opacity = 1 - distance / connectionDistance
            ctx.beginPath()
            ctx.strokeStyle = `rgba(100, 150, 200, ${opacity * 0.5})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particles) {
        particle.update()
        particle.draw()
      }

      drawConnections()

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas id="network-canvas" className="absolute inset-0" />
}
