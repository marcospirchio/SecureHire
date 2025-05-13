"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface RequisitosAlertaProps {
  requisitos: { nombre: string; obligatorio: boolean }[]
  habilidadesCandidato: string[]
  className?: string
}

export function RequisitosAlerta({ requisitos, habilidadesCandidato, className }: RequisitosAlertaProps) {
  const cumpleRequisitosObligatorios = useMemo(() => {
    const requisitosObligatorios = requisitos.filter((req) => req.obligatorio)
    return requisitosObligatorios.every((req) =>
      habilidadesCandidato.some((hab) => hab.toLowerCase().includes(req.nombre.toLowerCase())),
    )
  }, [requisitos, habilidadesCandidato])

  if (cumpleRequisitosObligatorios) {
    return null
  }

  return (
    <div
      className={cn(
        "border-2 border-yellow-500 rounded-md p-2 mb-2 bg-yellow-50 dark:bg-yellow-900/20 text-sm",
        className,
      )}
    >
      <p className="font-medium text-yellow-700 dark:text-yellow-400">
        ⚠️ No cumple con todos los requisitos obligatorios
      </p>
    </div>
  )
}
