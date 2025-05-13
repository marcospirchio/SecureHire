"use client"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardLayout } from "@/components/dashboard/layout"
import { WeeklyCalendar } from "@/components/dashboard/weekly-calendar"
import { JobListings } from "@/components/dashboard/job-listings"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useEntrevistas } from "@/hooks/use-entrevistas"
import { useEffect } from "react"

export default function DashboardReclutamiento() {
  const router = useRouter()
  const { user, loading: authLoading, error: authError } = useAuth()
  const { entrevistas, loading: entrevistasLoading, error: entrevistasError } = useEntrevistas()

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  // Convertir las entrevistas al formato esperado por el calendario
  const calendarEvents = entrevistas.map(entrevista => ({
    date: entrevista.fechaProgramada.split('T')[0],
    time: entrevista.horaProgramada,
    title: "Entrevista",
    person: `${entrevista.nombreCandidato} ${entrevista.apellidoCandidato}`,
    link: entrevista.linkEntrevista
  }))

  // Datos de ejemplo para las ofertas de trabajo
  const jobListings = [
    {
      title: "Pasantía",
      subtitle: "Desarrollador Backend Trainee",
      phase: "Webinar informativo",
      candidates: 133,
      createdAt: "17/04/2025",
    },
    {
      title: "Contador Ssr.",
      phase: "Filtrado de cv",
      candidates: 340,
      createdAt: "04/04/2025",
    },
    {
      title: "Secretario",
      phase: "Entrevistas finales",
      candidates: 10,
      createdAt: "22/02/2025",
    },
  ]

  const handleNewJobOffer = () => {
    router.push("/busquedas/nueva-oferta")
  }

  if (authLoading || entrevistasLoading) {
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

  if (authError || entrevistasError) {
    return (
      <Sidebar>
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <p className="text-red-500">
              Error: {authError || entrevistasError}
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
            Bienvenido, {user ? `${user.nombre} ${user.apellido}` : "Usuario"}
          </h1>
          <Button size="sm" className="bg-gray-900 hover:bg-gray-800 h-7 text-xs" onClick={handleNewJobOffer}>
            Nueva oferta
          </Button>
        </div>

        <WeeklyCalendar events={calendarEvents} />

        <div className="mt-6"></div>

        <JobListings listings={jobListings} />
      </DashboardLayout>
    </Sidebar>
  )
}
