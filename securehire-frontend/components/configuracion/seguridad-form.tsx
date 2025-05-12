"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SeguridadForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const currentPassword = form.currentPassword.value
    const newPassword = form.newPassword.value
    const confirmPassword = form.confirmPassword.value

    // Reset states
    setPasswordError(null)
    setPasswordSuccess(null)

    // Simple validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos los campos son obligatorios")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    // Success message (in a real app, this would be after API call)
    setPasswordSuccess("Contraseña actualizada correctamente")
    form.reset()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Seguridad</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Actualiza tu contraseña y configura opciones de seguridad.
        </p>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Cambiar contraseña</h3>

          {passwordError && (
            <Alert variant="destructive">
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}

          {passwordSuccess && (
            <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
              <AlertDescription>{passwordSuccess}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña actual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                <span className="sr-only">{showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                <span className="sr-only">{showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">La contraseña debe tener al menos 8 caracteres.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                <span className="sr-only">{showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit">Actualizar contraseña</Button>
        </div>
      </form>

      <div className="border-t pt-6 mt-8">
        <h3 className="text-lg font-medium mb-4">Sesiones activas</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-md">
            <div>
              <p className="font-medium">Este dispositivo</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Windows 10 • Chrome • Madrid, España</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Última actividad: Hace 2 minutos</p>
            </div>
            <Button variant="outline" size="sm">
              Cerrar sesión
            </Button>
          </div>
          <div className="flex justify-between items-center p-4 border rounded-md">
            <div>
              <p className="font-medium">iPhone 13</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">iOS 16 • Safari • Barcelona, España</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Última actividad: Hace 3 días</p>
            </div>
            <Button variant="outline" size="sm">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
