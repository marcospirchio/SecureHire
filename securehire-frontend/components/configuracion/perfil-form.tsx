"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function PerfilForm() {
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | undefined>(new Date(1985, 5, 15))
  const [imagenPerfil, setImagenPerfil] = useState<string>("/diverse-avatars.png")

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagenPerfil(event.target.result.toString())
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Perfil del reclutador</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Actualiza tu información personal y de contacto.
        </p>
      </div>

      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md">
            <img
              src={imagenPerfil || "/placeholder.svg"}
              alt="Imagen de perfil"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative">
            <Input type="file" accept="image/*" id="imagen-perfil" className="hidden" onChange={handleImagenChange} />
            <Label
              htmlFor="imagen-perfil"
              className="flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
            >
              <Upload className="h-4 w-4" />
              Cambiar imagen
            </Label>
          </div>
        </div>

        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" defaultValue="Carlos" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellido(s)</Label>
              <Input id="apellidos" defaultValue="Rodríguez" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="carlos.rodriguez@ejemplo.com" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha-nacimiento">Fecha de nacimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaNacimiento && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaNacimiento ? (
                      format(fechaNacimiento, "d 'de' MMMM 'de' yyyy", { locale: es })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fechaNacimiento}
                    onSelect={setFechaNacimiento}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI (Número de documento)</Label>
              <Input id="dni" defaultValue="12345678A" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
