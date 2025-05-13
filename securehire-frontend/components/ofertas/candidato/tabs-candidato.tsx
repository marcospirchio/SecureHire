"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TabsCandidatoProps {
  candidato: {
    id: string
    comentarios?: { autor: string; fecha: string; texto: string }[]
    entrevistas?: { fecha: string; hora: string; estado: string }[]
    feedbacks?: { autor: string; fecha: string; texto: string }[]
  }
}

export function TabsCandidato({ candidato }: TabsCandidatoProps) {
  return (
    <Tabs defaultValue="comentarios" className="w-full">
      <TabsList className="grid grid-cols-3 mb-2">
        <TabsTrigger value="comentarios">Comentarios</TabsTrigger>
        <TabsTrigger value="entrevistas">Entrevistas</TabsTrigger>
        <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
      </TabsList>

      <TabsContent value="comentarios">
        <Card>
          <CardContent className="p-4 space-y-2">
            {candidato.comentarios && candidato.comentarios.length > 0 ? (
              candidato.comentarios.map((comentario, index) => (
                <div key={index} className="border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{comentario.autor}</span>
                    <span className="text-xs text-muted-foreground">{comentario.fecha}</span>
                  </div>
                  <p className="text-sm">{comentario.texto}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay comentarios disponibles</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="entrevistas">
        <Card>
          <CardContent className="p-4 space-y-2">
            {candidato.entrevistas && candidato.entrevistas.length > 0 ? (
              candidato.entrevistas.map((entrevista, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{entrevista.fecha}</p>
                    <p className="text-xs">{entrevista.hora}</p>
                  </div>
                  <Badge
                    variant={
                      entrevista.estado === "Programada"
                        ? "outline"
                        : entrevista.estado === "Completada"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {entrevista.estado}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay entrevistas programadas</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="feedbacks">
        <Card>
          <CardContent className="p-4 space-y-2">
            {candidato.feedbacks && candidato.feedbacks.length > 0 ? (
              candidato.feedbacks.map((feedback, index) => (
                <div key={index} className="border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{feedback.autor}</span>
                    <span className="text-xs text-muted-foreground">{feedback.fecha}</span>
                  </div>
                  <p className="text-sm">{feedback.texto}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay feedbacks disponibles</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
