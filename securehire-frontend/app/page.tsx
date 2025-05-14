"use client"

import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardLayout } from "@/components/dashboard/layout"
import { WeeklyCalendar } from "@/components/dashboard/weekly-calendar"
import { JobListings } from "@/components/dashboard/job-listings"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useEntrevistas } from "@/hooks/use-entrevistas"
import { useEffect, useState } from "react"
import { useBusquedas } from "@/hooks/use-busquedas"

export default function DashboardReclutamiento() {
  const router = useRouter()
  const { user, loading: authLoading, error: authError } = useAuth()
  const { entrevistas, loading: entrevistasLoading, error: entrevistasError } = useEntrevistas()
  const { busquedas, loading: busquedasLoading, error: busquedasError } = useBusquedas()

  const [conteoTotalCandidatos, setConteoTotalCandidatos] = useState(0)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  useEffect(() => {
    const total = busquedas.reduce((sum, b) => sum + (b.cantidadCandidatos || 0), 0)
    setConteoTotalCandidatos(total)
  }, [busquedas])

  const calendarEvents = entrevistas.map(entrevista => ({
    date: entrevista.fechaProgramada.split('T')[0],
    time: entrevista.horaProgramada ?? "Por confirmar",
    title: "Entrevista",
    person: `${entrevista.nombreCandidato} ${entrevista.apellidoCandidato}`,
    link: entrevista.linkEntrevista ?? undefined
  }))

  const jobListings = busquedas.slice(0, 3).map((b) => ({
    title: b.titulo,
    subtitle: `${b.cantidadCandidatos ?? 0} candidatos`,
    phase: b.faseActual || "-",
    candidates: b.cantidadCandidatos ?? 0,
    createdAt: b.fechaCreacion ? new Date(b.fechaCreacion).toLocaleDateString("es-AR") : "-",
  }))

  const handleNewJobOffer = () => {
    router.push("/busquedas/nueva-oferta")
  }

  if (authLoading || entrevistasLoading || busquedasLoading) {
    return (
      <Sidebar>
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <p>Cargando...</p>
          </div>
        </DashboardLayout>
      </Sidebar>
    )
  }

  if (authError || entrevistasError || busquedasError) {
    return (
      <Sidebar>
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <p className="text-red-500">
              Error: {authError || entrevistasError || busquedasError}
            </p>
          </div>
        </DashboardLayout>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <DashboardLayout>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg sm:text-xl font-bold">
            ¡Bienvenido, {user ? `${user.nombre} ${user.apellido}` : "Usuario"}!
          </h1>
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 h-7 text-xs" onClick={handleNewJobOffer}>
            Nueva oferta
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-2">Total de candidatos en tus búsquedas: <strong>{conteoTotalCandidatos}</strong></p>

        <WeeklyCalendar events={calendarEvents} />

        <div className="mt-6"></div>

        {jobListings.length > 0 ? (
          <JobListings listings={jobListings} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border bg-white p-3 flex items-center justify-center min-h-[120px] text-center text-gray-500 text-sm"
              >
                ¡No posees búsquedas, crea una!
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </Sidebar>
  )
}
