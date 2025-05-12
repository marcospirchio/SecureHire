"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { PerfilForm } from "@/components/configuracion/perfil-form"
import { IdiomaZonaForm } from "@/components/configuracion/idioma-zona-form"
import { SeguridadForm } from "@/components/configuracion/seguridad-form"
import { Save } from "lucide-react"

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("perfil")
  const { toast } = useToast()

  const handleSaveChanges = () => {
    toast({
      title: "Cambios guardados",
      description: "Tus cambios han sido guardados correctamente.",
      variant: "default",
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Configuración</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <div className="space-y-4">
          <Card className="p-0">
            <nav className="flex flex-col">
              <button
                className={`text-left px-4 py-3 border-b last:border-0 ${
                  activeTab === "perfil" ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
                onClick={() => setActiveTab("perfil")}
              >
                Perfil del reclutador
              </button>
              <button
                className={`text-left px-4 py-3 border-b last:border-0 ${
                  activeTab === "idioma" ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
                onClick={() => setActiveTab("idioma")}
              >
                Idioma y zona horaria
              </button>
              <button
                className={`text-left px-4 py-3 ${activeTab === "seguridad" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                onClick={() => setActiveTab("seguridad")}
              >
                Seguridad
              </button>
            </nav>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            {activeTab === "perfil" && <PerfilForm />}
            {activeTab === "idioma" && <IdiomaZonaForm />}
            {activeTab === "seguridad" && <SeguridadForm />}
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveChanges} className="px-6">
              <Save className="mr-2 h-4 w-4" />
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
