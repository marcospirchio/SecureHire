"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, CheckCircle, Clock, Trash2 } from "lucide-react"

// Tipos para las notificaciones
interface Notification {
  id: string
  candidateName: string
  type: "pending" | "canceled" | "confirmed"
  date: string
  time: string
  jobId?: string
}

export default function NotificacionesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("pending")

  // Función para volver atrás
  const handleGoBack = () => {
    router.back()
  }

  // Datos de ejemplo para las notificaciones
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      candidateName: "María Pérez",
      type: "pending",
      date: "25/05",
      time: "14:00",
      jobId: "1",
    },
    {
      id: "2",
      candidateName: "Juan López",
      type: "pending",
      date: "26/05",
      time: "09:30",
      jobId: "2",
    },
    {
      id: "3",
      candidateName: "Laura Martínez",
      type: "canceled",
      date: "26/05",
      time: "10:30",
      jobId: "1",
    },
    {
      id: "4",
      candidateName: "Carlos Rodríguez",
      type: "canceled",
      date: "27/05",
      time: "15:45",
      jobId: "3",
    },
    {
      id: "5",
      candidateName: "Ana García",
      type: "confirmed",
      date: "28/05",
      time: "11:00",
      jobId: "2",
    },
    {
      id: "6",
      candidateName: "Pedro López",
      type: "confirmed",
      date: "29/05",
      time: "16:15",
      jobId: "1",
    },
  ])

  // Filtrar notificaciones según el tipo
  const pendingNotifications = notifications.filter((notification) => notification.type === "pending")
  const canceledNotifications = notifications.filter((notification) => notification.type === "canceled")
  const confirmedNotifications = notifications.filter((notification) => notification.type === "confirmed")

  // Función para eliminar una notificación
  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  // Función para ver el perfil del candidato
  const handleViewProfile = (notification: Notification) => {
    if (notification.jobId) {
      router.push(`/busquedas/${notification.jobId}`)
    }
  }

  return (
    <Sidebar>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Volver atrás"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">Notificaciones</h1>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 rounded-none bg-gray-50 p-0 h-auto">
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 py-3 text-sm font-medium"
                >
                  PENDIENTES
                  {pendingNotifications.length > 0 && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                      {pendingNotifications.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="canceled"
                  className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 py-3 text-sm font-medium"
                >
                  ENTREVISTAS CANCELADAS
                  {canceledNotifications.length > 0 && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                      {canceledNotifications.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="confirmed"
                  className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 py-3 text-sm font-medium"
                >
                  ENTREVISTAS CONFIRMADAS
                  {confirmedNotifications.length > 0 && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                      {confirmedNotifications.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="p-0 mt-0">
                {pendingNotifications.length > 0 ? (
                  <div>
                    {pendingNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="border-b last:border-b-0 p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <p className="text-sm">
                            <span className="font-medium">{notification.candidateName}</span> tiene una entrevista
                            pendiente de confirmación para el {notification.date} a las {notification.time} hs.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleViewProfile(notification)}
                          >
                            VER PERFIL
                          </Button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">No hay entrevistas pendientes de confirmación.</div>
                )}
              </TabsContent>

              <TabsContent value="canceled" className="p-0 mt-0">
                {canceledNotifications.length > 0 ? (
                  <div>
                    {canceledNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="border-b last:border-b-0 p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                          <p className="text-sm">
                            <span className="font-medium">{notification.candidateName}</span> ha cancelado la entrevista
                            del {notification.date} a las {notification.time} hs.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleViewProfile(notification)}
                          >
                            VER PERFIL
                          </Button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">No hay entrevistas canceladas.</div>
                )}
              </TabsContent>

              <TabsContent value="confirmed" className="p-0 mt-0">
                {confirmedNotifications.length > 0 ? (
                  <div>
                    {confirmedNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="border-b last:border-b-0 p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <p className="text-sm">
                            <span className="font-medium">{notification.candidateName}</span> ha confirmado la
                            entrevista del {notification.date} a las {notification.time} hs.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleViewProfile(notification)}
                          >
                            VER PERFIL
                          </Button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">No hay entrevistas confirmadas.</div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </Sidebar>
  )
}
