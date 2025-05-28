"use client"

import { useState, useEffect } from "react"
import { Calendar, Briefcase, User, Building } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface EntrevistaPublica {
  fecha: string;
  hora: string;
  estado: string;
  candidatoId: string;
  titulo: string;
  empresa: string;
  reclutador: {
    nombre: string;
    apellido: string;
  };
}

interface Oferta {
  titulo: string;
  empresa: {
    nombre: string;
  };
  reclutador: {
    nombre: string;
    apellido: string;
  };
}

export default function EntrevistaPage({ token }: { token: string }) {
  const [action, setAction] = useState<"confirmar" | "cancelar" | "reprogramar" | null>(null)
  const [motivo, setMotivo] = useState("")
  const [motivoCancelacion, setMotivoCancelacion] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [entrevista, setEntrevista] = useState<EntrevistaPublica | null>(null)
  const [oferta, setOferta] = useState<Oferta | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos de la entrevista
        const entrevistaResponse = await fetch(`http://localhost:8080/api/entrevistas/publica/${token}`)
        if (!entrevistaResponse.ok) throw new Error('Error al cargar la entrevista')
        const entrevistaData = await entrevistaResponse.json()
        setEntrevista(entrevistaData)

        
        setOferta({
          titulo: entrevistaData.titulo,
          empresa: { nombre: entrevistaData.empresa },
          reclutador: {
            nombre: entrevistaData.reclutador.nombre,
            apellido: entrevistaData.reclutador.apellido
          }
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar la información",
          variant: "destructive"
        })
      }
    }
    fetchData()
  }, [token, toast])

  const handleSubmit = async () => {
    if (!entrevista) return
    setLoading(true)

    try {
      let response
      if (action === "confirmar") {
        response = await fetch(`http://localhost:8080/api/entrevistas/confirmar/${token}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        })
      } else if (action === "cancelar") {
        response = await fetch(`http://localhost:8080/api/entrevistas/publica/${token}/cancelar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ motivo: motivoCancelacion })
        })
      } else if (action === "reprogramar") {
        response = await fetch(`http://localhost:8080/api/entrevistas/publica/${token}/solicitar-reprogramacion`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ motivo })
        })
      }

      if (!response?.ok) {
        throw new Error('Error al procesar la solicitud')
      }

      setSuccess(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!entrevista || !oferta) {
    return (
      <div className="mx-auto max-w-3xl p-6 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando información...</span>
        </div>
      </div>
    )
  }

  if (entrevista.estado && entrevista.estado.toLowerCase() === "cancelada") {
    return (
      <div className="mx-auto max-w-md p-8 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center mt-24">
        <div className="flex flex-col items-center">
          <div className="bg-red-100 rounded-full p-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fee2e2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6m0-6l6 6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Entrevista cancelada</h2>
          <p className="text-gray-700 text-center mb-6">La entrevista ya se encuentra cancelada.<br />No es posible realizar ninguna acción sobre esta entrevista.</p>
          <Button onClick={() => window.close()} className="bg-gray-100 text-gray-800 hover:bg-gray-200">Cerrar ventana</Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-3xl p-6 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Solicitud procesada</h1>

        {action === "confirmar" && (
          <div className="p-4 bg-green-50 rounded-md mb-6">
            <p className="text-green-800">
              Tu entrevista ha sido confirmada correctamente.
            </p>
          </div>
        )}

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="mx-auto max-w-3xl p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-2">Gestionar entrevista</h1>
      <p className="text-gray-600 mb-8">
        Puedes confirmar, cancelar o solicitar reprogramar tu entrevista para el puesto de {oferta.titulo}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Fecha y hora</p>
            <p className="text-gray-600">
              {formatDate(entrevista.fecha)} a las {entrevista.hora}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Puesto</p>
            <p className="text-gray-600">{oferta.titulo}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Reclutador</p>
            <p className="text-gray-600">
              {oferta.reclutador.nombre} {oferta.reclutador.apellido}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Building className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">Empresa</p>
            <p className="text-gray-600">{oferta.empresa.nombre}</p>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">¿Qué deseas hacer con esta entrevista?</h2>
        <RadioGroup value={action || ""} onValueChange={(value) => setAction(value as any)}>
          {entrevista.estado.toLowerCase() === "pendiente de confirmación" && (
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="confirmar" id="confirmar" />
              <label htmlFor="confirmar" className="text-base cursor-pointer">
                Confirmar entrevista
              </label>
            </div>
          )}
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
            !action || 
            (action === "cancelar" && !motivoCancelacion) || 
            (action === "reprogramar" && !motivo) || 
            loading
          }
          className={
            action === "confirmar"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : action === "cancelar"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
          }
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Procesando...
            </>
          ) : action === "confirmar" ? (
            "Confirmar entrevista"
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