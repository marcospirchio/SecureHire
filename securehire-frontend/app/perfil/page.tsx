"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Save, X } from "lucide-react"
import Image from "next/image"

export default function PerfilPage() {
  const [profileImage, setProfileImage] = useState("/diverse-avatars.png")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")

  // Datos del reclutador (simulados)
  const recruiterData = {
    nombre: "Carlos",
    apellido: "Rodríguez",
    email: "carlos.rodriguez@securehire.com",
    telefono: "+34 612 345 678",
    puesto: "Reclutador Senior",
    departamento: "Recursos Humanos",
    fechaIngreso: "15/03/2023",
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    // Validación simple
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    // Aquí iría la lógica para cambiar la contraseña
    alert("Contraseña cambiada con éxito")
    setIsChangingPassword(false)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100">
                <Image
                  src={profileImage || "/placeholder.svg"}
                  alt="Foto de perfil"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="h-5 w-5" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                <span className="sr-only">Cambiar foto</span>
              </label>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{`${recruiterData.nombre} ${recruiterData.apellido}`}</h2>
              <p className="text-gray-600">{recruiterData.puesto}</p>
              <p className="text-gray-600">{recruiterData.departamento}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold">Información Personal</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Nombre</p>
              <p className="font-medium">{recruiterData.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Apellido</p>
              <p className="font-medium">{recruiterData.apellido}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium">{recruiterData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Teléfono</p>
              <p className="font-medium">{recruiterData.telefono}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Puesto</p>
              <p className="font-medium">{recruiterData.puesto}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Fecha de ingreso</p>
              <p className="font-medium">{recruiterData.fechaIngreso}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold">Seguridad</h3>
        </div>
        <div className="p-6">
          {!isChangingPassword ? (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Cambiar contraseña
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="max-w-md">
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {passwordError && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">{passwordError}</div>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordError("")
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    })
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
