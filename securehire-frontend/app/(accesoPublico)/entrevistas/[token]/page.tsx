"use client"

import { useState } from "react"
import { Calendar, Briefcase, User, Building } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EntrevistaPage({ params }: { params: { token: string } }) {
  const [action, setAction] = useState<"cancelar" | "reprogramar" | null>(null)
  const [motivo, setMotivo] = useState("")
  const [motivoCancelacion, setMotivoCancelacion] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Datos de ejemplo de la entrevista (en una aplicación real, estos datos vendrían de una API)
  const entrevista = {
    puesto: "Desarrollador Frontend",
    fecha: "jueves, 15 de mayo de 2025",
    hora: "10:00",
    reclutador: "Carlos Rodríguez",
    empresa: "SecureHire",
  }

  const handleSubmit = async () => {
    setLoading(true)

    // Simulación de envío de datos a un servidor
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="mx-auto max-w-3xl p-6 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Solicitud procesada</h1>

        {action === "cancelar" && (
          <div className="p-4 bg-green-50 rounded-md mb-6">
            <p className="text-green-800">
              Tu entrevista ha sido cancelada correctamente. Hemos notificado al reclutador.
            </p>
          </div>
        )}

        {action === "reprogramar" && (
          <div className="p-4 bg-green-50 rounded-md mb-6">
            <p className="text-green-800">
              Tu solicitud de reprogramación ha sido enviada. El reclutador se pondrá en contacto contigo pronto.
            </p>
          </div>
        )}

        <Button onClick={() => window.close()} className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          Cerrar ventana
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-2">Gestionar entrevista</h1>
      <p className="text-gray-600 mb-8">
        Puedes cancelar o solicitar reprogramar tu entrevista para el puesto de {entrevista.puesto}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Fecha y hora</p>
            <p className="text-gray-600">
              {entrevista.fecha} a las {entrevista.hora}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Puesto</p>
            <p className="text-gray-600">{entrevista.puesto}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Reclutador</p>
            <p className="text-gray-600">{entrevista.reclutador}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Building className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Empresa</p>
            <p className="text-gray-600">{entrevista.empresa}</p>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">¿Qué deseas hacer con esta entrevista?</h2>
        <RadioGroup value={action || ""} onValueChange={(value) => setAction(value as any)}>
          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="cancelar" id="cancelar" />
            <label htmlFor="cancelar" className="text-base cursor-pointer">
              Cancelar entrevista
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="reprogramar" id="reprogramar" />
            <label htmlFor="reprogramar" className="text-base cursor-pointer">
              Solicitar reprogramación
            </label>
          </div>
        </RadioGroup>
      </div>

      {action === "cancelar" && (
        <div className="mb-6 animate-in fade-in duration-300">
          <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de cancelación</label>
          <Select value={motivoCancelacion} onValueChange={setMotivoCancelacion}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un motivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conflicto">Conflicto de horario</SelectItem>
              <SelectItem value="otra-oferta">Acepté otra oferta</SelectItem>
              <SelectItem value="no-interesado">Ya no estoy interesado</SelectItem>
              <SelectItem value="otro">Otro motivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {action === "reprogramar" && (
        <div className="mb-6 animate-in fade-in duration-300">
          <div className="p-4 bg-blue-50 rounded-md mb-4">
            <p className="text-blue-800 text-sm">
              <strong>Información importante</strong>
            </p>
            <p className="text-blue-800 text-sm">
              Al solicitar una reprogramación, el reclutador recibirá tu solicitud y se pondrá en contacto contigo para
              acordar una nueva fecha y hora.
            </p>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de reprogramación</label>
          <Textarea
            placeholder="Explica por qué necesitas reprogramar la entrevista..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      )}

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={() => window.history.back()} disabled={loading}>
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={
            !action || (action === "cancelar" && !motivoCancelacion) || (action === "reprogramar" && !motivo) || loading
          }
          className={
            action === "cancelar"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Procesando...
            </>
          ) : action === "cancelar" ? (
            "Confirmar cancelación"
          ) : (
            "Solicitar reprogramación"
          )}
        </Button>
      </div>
    </div>
  )
}
