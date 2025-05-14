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
import { usePostulacionesConteo } from "@/hooks/use-postulaciones-conteo"

export default function DashboardReclutamiento() {
  const router = useRouter()
  const { user, loading: authLoading, error: authError } = useAuth()
  const { entrevistas, loading: entrevistasLoading, error: entrevistasError } = useEntrevistas()
  const { busquedas, loading: busquedasLoading, error: busquedasError } = useBusquedas()
  const { conteo, loading: conteoLoading, error: conteoError } = usePostulacionesConteo()

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  // Convertir las entrevistas al formato esperado por el calendario
  const calendarEvents = entrevistas.map(entrevista => ({
    date: entrevista.fechaProgramada.split('T')[0],
    time: entrevista.horaProgramada ?? "Por confirmar",
    title: "Entrevista",
    person: `${entrevista.nombreCandidato} ${entrevista.apellidoCandidato}`,
    link: entrevista.linkEntrevista ?? undefined
  }))

  // Adaptar las búsquedas al formato de JobListings
  const jobListings = busquedas
    .slice()
    .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
    .slice(0, 3)
    .map(b => {
      // Buscar el conteo de postulaciones para esta búsqueda
      const conteoBusqueda = conteo.find(c => c.busquedaId === b.id)
      return {
        title: b.titulo,
        subtitle: b.faseActual ?? "",
        phase: b.faseActual ?? "",
        candidates: conteoBusqueda?.cantidad ?? 0,
        createdAt: new Date(b.fechaCreacion).toLocaleDateString("es-AR"),
      }
    })

  const handleNewJobOffer = () => {
    router.push("/busquedas/nueva-oferta")
  }

  if (authLoading || entrevistasLoading || busquedasLoading || conteoLoading) {
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

  if (authError || entrevistasError || busquedasError || conteoError) {
    return (
      <Sidebar>
        <DashboardLayout>
          <div className="flex items-center justify-center h-screen">
            <p className="text-red-500">
              Error: {authError || entrevistasError || busquedasError || conteoError}
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

        {jobListings.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="border rounded-lg p-6 flex items-center justify-center text-center text-gray-500 bg-gray-50 h-32"
              >
                ¡No posees búsquedas, crea una!
              </div>
            ))}
          </div>
        ) : (
          <JobListings listings={jobListings} />
        )}
      </DashboardLayout>
    </Sidebar>
  )
} 