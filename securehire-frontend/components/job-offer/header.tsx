import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface JobOfferHeaderProps {
  title: string
  phase: string
  onBackClick: () => void
  onTitleClick: () => void
}

export function JobOfferHeader({ title, phase, onBackClick, onTitleClick }: JobOfferHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full h-7 w-7 p-0"
          onClick={onBackClick}
        >
          <ArrowLeft className="h-3 w-3" />
        </Button>
        <div>
          <h1
            className="text-lg font-bold cursor-pointer hover:text-blue-600 transition-colors"
            onClick={onTitleClick}
          >
            {title}
          </h1>
          <p className="text-xs text-gray-500">{phase}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <Settings className="mr-1 h-3 w-3" /> Gestionar fases
        </Button>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px] h-7 text-xs">
            <SelectValue placeholder="Todas las fases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fases</SelectItem>
            <SelectItem value="Pendiente de confirmación">Pendiente de confirmación</SelectItem>
            <SelectItem value="CV recibido">CV recibido</SelectItem>
            <SelectItem value="Entrevista agendada">Entrevista agendada</SelectItem>
            <SelectItem value="Proceso finalizado">Proceso finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 