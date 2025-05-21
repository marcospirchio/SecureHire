import { ArrowLeft, Copy } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"

interface JobOfferHeaderProps {
  title: string
  onBack: () => void
  onOpenJobDetails: () => void
  busquedaId: string
  urlPublica?: string
}

export function JobOfferHeader({ title, onBack, onOpenJobDetails, busquedaId, urlPublica }: JobOfferHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [jobDetails, setJobDetails] = useState<any>(null)

  const handleCopyLink = async () => {
    if (!urlPublica) return
    
    try {
      await navigator.clipboard.writeText(urlPublica)
      toast({
        title: "Link copiado",
        description: "El link de la publicación ha sido copiado al portapapeles.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar el link.",
        variant: "destructive",
      })
    }
  }

  const handleTitleClick = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/busquedas/${busquedaId}`, {
        credentials: "include",
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) throw new Error("Error al obtener detalles de la búsqueda")

      const data = await response.json()
      setJobDetails(data)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full h-7 w-7 p-0"
            onClick={onBack}
          >
            <ArrowLeft className="h-3 w-3" />
          </Button>
          <div className="flex items-center gap-2">
            <h1
              className="text-lg font-bold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleTitleClick}
            >
              {title}
            </h1>
            {urlPublica && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={handleCopyLink}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar link
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalles de la oferta</DialogTitle>
          </DialogHeader>
          
          {jobDetails && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{jobDetails.titulo}</h2>
                <p className="text-sm text-gray-500">
                  Creada el {new Date(jobDetails.fechaCreacion).toLocaleDateString("es-AR")}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{jobDetails.descripcion}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Empresa</h3>
                  <p className="text-gray-700">{jobDetails.empresa || "No especificada"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ubicación</h3>
                  <p className="text-gray-700">{jobDetails.ubicacion || "No especificada"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Modalidad</h3>
                  <p className="text-gray-700">{jobDetails.modalidad || "No especificada"}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tipo de contrato</h3>
                  <p className="text-gray-700">{jobDetails.tipoContrato || "No especificado"}</p>
                </div>
              </div>

              {jobDetails.beneficios && jobDetails.beneficios.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Beneficios</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {jobDetails.beneficios.map((beneficio: string, index: number) => (
                      <li key={index} className="text-gray-700">{beneficio}</li>
                    ))}
                  </ul>
                </div>
              )}

              {jobDetails.camposAdicionales && jobDetails.camposAdicionales.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Requisitos adicionales</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {jobDetails.camposAdicionales.map((campo: any, index: number) => (
                      <li key={index} className="text-gray-700">
                        {campo.nombre}
                        {campo.esExcluyente && (
                          <span className="text-red-500 ml-1">(Excluyente)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 