"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function IdiomaZonaForm() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Idioma y zona horaria</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Configura tus preferencias de idioma y zona horaria.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="idioma">Idioma</Label>
          <Select defaultValue="es">
            <SelectTrigger id="idioma" className="w-full">
              <SelectValue placeholder="Selecciona un idioma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">Inglés</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Este es el idioma que se utilizará en toda la aplicación.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zona-horaria">Zona horaria</Label>
          <Select defaultValue="GMT-3">
            <SelectTrigger id="zona-horaria" className="w-full">
              <SelectValue placeholder="Selecciona una zona horaria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GMT-3">GMT-3 (Buenos Aires, São Paulo)</SelectItem>
              <SelectItem value="GMT-5">GMT-5 (Bogotá, Lima, Quito)</SelectItem>
              <SelectItem value="GMT-6">GMT-6 (Ciudad de México, Guatemala)</SelectItem>
              <SelectItem value="GMT+1">GMT+1 (Madrid, París, Roma)</SelectItem>
              <SelectItem value="GMT+0">GMT+0 (Londres, Lisboa, Dublín)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Esta zona horaria se utilizará para mostrar fechas y horas en la aplicación.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="formato-fecha">Formato de fecha</Label>
          <Select defaultValue="dd/mm/yyyy">
            <SelectTrigger id="formato-fecha" className="w-full">
              <SelectValue placeholder="Selecciona un formato de fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dd/mm/yyyy">DD/MM/YYYY (31/12/2025)</SelectItem>
              <SelectItem value="mm/dd/yyyy">MM/DD/YYYY (12/31/2025)</SelectItem>
              <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (2025-12-31)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Este formato se utilizará para mostrar las fechas en la aplicación.
          </p>
        </div>
      </div>
    </div>
  )
}
