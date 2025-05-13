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
import { useBusquedas } from "@/hooks/use-busquedas"

export default function DashboardReclutamiento() {
  const router = useRouter()
  const { user, loading: authLoading, error: authError } = useAuth()
  const { entrevistas, loading: entrevistasLoading, error: entrevistasError } = useEntrevistas()
  const { busquedas, loading: busquedasLoading, error: busquedasError } = useBusquedas()

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  // Convertir las entrevistas al formato esperado por el calendario
  const calendarEvents = entrevistas.map(entrevista => ({
    date: entrevista.fechaProgramada.split('T')[0],
    time: entrevista.horaProgramada ?? "Por confirmar", // <- Garantizamos que sea string
    title: "Entrevista",
    person: `${entrevista.nombreCandidato} ${entrevista.apellidoCandidato}`,
    link: entrevista.linkEntrevista ?? undefined
  }))

  // Adaptar las búsquedas al formato esperado por JobListings
  const jobListings = busquedas.slice(0, 3).map((b) => ({
    title: b.titulo,
    subtitle: b.faseActual || "-",
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
