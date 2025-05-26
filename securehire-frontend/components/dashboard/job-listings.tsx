import { ChevronRight } from "lucide-react"
import Link from "next/link"

interface JobListing {
  id: string
  title: string
  subtitle?: string
  phase: string
  candidates: number
  createdAt: string
}

interface JobListingsProps {
  listings: JobListing[]
  onJobClick?: (id: string) => void
}

export function JobListings({ listings, onJobClick }: JobListingsProps) {
  // Ordenar las ofertas por fecha de creación (más recientes primero)
  const sortedListings = [...listings].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="rounded-lg border bg-white p-3 w-full">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Últimas ofertas publicadas</h2>
          <p className="text-xs text-gray-500">Tus búsquedas más recientes</p>
        </div>
        <Link
          href="/busquedas"
          className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
        >
          Ver todas
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {sortedListings.map((listing) => (
          <div
            key={listing.id}
            className="rounded-lg border p-3 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => onJobClick && onJobClick(listing.id)}
          >
            <h3 className="text-sm font-bold mb-2">{listing.title}</h3>
            {listing.subtitle && <p className="text-xs font-medium mb-2">{listing.subtitle}</p>}

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Fase actual:</span>
                <span className="font-medium">{listing.phase}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Candidatos:</span>
                <span className="font-medium text-green-600">{listing.candidates}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Creada el:</span>
                <span className="font-medium">{new Date(listing.createdAt).toLocaleDateString("es-AR")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
