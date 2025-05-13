"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

// Importamos los componentes refactorizados
import { ModalFeedback } from "./modales/modal-feedback"
import { ModalDetallesOferta } from "./modales/modal-detalles-oferta"
import { ModalCalendarioEntrevista } from "./modales/modal-calendario-entrevista"
import { ModalCV } from "./modales/modal-cv"
import { RequisitosAlerta } from "./candidato/requisitos-alerta"
import { InfoCandidato } from "./candidato/info-candidato"
import { AccionesCandidato } from "./candidato/acciones-candidato"
import { TabsCandidato } from "./candidato/tabs-candidato"
import { ListaCandidatosFiltrable } from "./lista-candidatos-filtrable"

export function VistaCandidatos({ oferta, onVolver }) {
  // Asegurarse de que oferta.candidatos exista y sea un array
  const candidatos = oferta?.candidatos || []

  const [selectedCandidato, setSelectedCandidato] = useState(null)
  const [modalFeedbackOpen, setModalFeedbackOpen] = useState(false)
  const [modalOfertaOpen, setModalOfertaOpen] = useState(false)
  const [modalEntrevistaOpen, setModalEntrevistaOpen] = useState(false)
  const [modalCVOpen, setModalCVOpen] = useState(false)

  const handleSelectCandidato = (candidato) => {
    setSelectedCandidato(candidato)
  }

  const handleSubmitFeedback = (feedback) => {
    console.log(`Feedback para ${selectedCandidato?.nombre || "candidato"}:`, feedback)
    // Aquí iría la lógica para guardar el feedback
  }

  const handleScheduleInterview = (fecha, hora) => {
    console.log(`Entrevista programada para ${selectedCandidato?.nombre || "candidato"}:`, { fecha, hora })
    // Aquí iría la lógica para programar la entrevista
  }

  const renderCandidatoItem = (candidato, isSelected) => {
    // Verificar que oferta.requisitos exista y sea un array
    const requisitos = oferta?.requisitos || []

    const cumpleRequisitosObligatorios = requisitos
      .filter((req) => req?.obligatorio)
      .every(
        (req) =>
          Array.isArray(candidato?.habilidades) &&
          candidato.habilidades.some((hab) => hab?.toLowerCase().includes(req?.nombre?.toLowerCase())),
      )

    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          isSelected ? "ring-2 ring-primary" : "",
          !cumpleRequisitosObligatorios ? "border-yellow-500 border-2" : "",
        )}
      >
        <CardContent className="p-4 flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={candidato?.avatar || "/placeholder.svg"} alt={candidato?.nombre || "Candidato"} />
            <AvatarFallback>{(candidato?.nombre || "C").substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{candidato?.nombre || "Sin nombre"}</h3>
              <Badge
                variant={
                  candidato?.estado === "Aprobado"
                    ? "default"
                    : candidato?.estado === "Rechazado"
                      ? "destructive"
                      : "outline"
                }
              >
                {candidato?.estado || "Sin estado"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{candidato?.email || "Sin email"}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onVolver} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => setModalOfertaOpen(true)}
        >
          {oferta?.titulo || "Oferta"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Candidatos</h2>
            <span className="text-sm text-muted-foreground">
              {candidatos.length} {candidatos.length === 1 ? "candidato" : "candidatos"}
            </span>
          </div>

          <ListaCandidatosFiltrable
            candidatos={candidatos}
            onSelectCandidato={handleSelectCandidato}
            selectedCandidatoId={selectedCandidato?.id}
            renderCandidato={renderCandidatoItem}
          />
        </div>

        <div className="md:col-span-2">
          {selectedCandidato ? (
            <Card>
              <CardContent className="p-6 space-y-6">
                <RequisitosAlerta
                  requisitos={oferta?.requisitos || []}
                  habilidadesCandidato={selectedCandidato?.habilidades || []}
                />

                <InfoCandidato candidato={selectedCandidato} onVerCV={() => setModalCVOpen(true)} />

                <AccionesCandidato
                  onAprobar={() => console.log("Aprobar", selectedCandidato.id)}
                  onRechazar={() => console.log("Rechazar", selectedCandidato.id)}
                  onProgramarEntrevista={() => setModalEntrevistaOpen(true)}
                  onFinalizarProceso={() => setModalFeedbackOpen(true)}
                  onAgregarComentario={() => console.log("Comentario", selectedCandidato.id)}
                />

                <TabsCandidato candidato={selectedCandidato} />
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="w-full">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Selecciona un candidato para ver sus detalles</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Modales */}
        {selectedCandidato && (
          <>
            <ModalFeedback
              isOpen={modalFeedbackOpen}
              onClose={() => setModalFeedbackOpen(false)}
              candidatoId={selectedCandidato.id}
              candidatoNombre={selectedCandidato.nombre}
              onSubmit={handleSubmitFeedback}
            />

            <ModalCalendarioEntrevista
              isOpen={modalEntrevistaOpen}
              onClose={() => setModalEntrevistaOpen(false)}
              candidatoId={selectedCandidato.id}
              candidatoNombre={selectedCandidato.nombre}
              onSchedule={handleScheduleInterview}
            />

            <ModalCV
              isOpen={modalCVOpen}
              onClose={() => setModalCVOpen(false)}
              candidatoNombre={selectedCandidato.nombre}
              cvUrl={selectedCandidato.cv}
            />
          </>
        )}

        <ModalDetallesOferta isOpen={modalOfertaOpen} onClose={() => setModalOfertaOpen(false)} oferta={oferta} />
      </div>
    </div>
  )
}
