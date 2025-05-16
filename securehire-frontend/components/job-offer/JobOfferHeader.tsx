import { ArrowLeft, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface JobOfferHeaderProps {
  title: string
  onBack: () => void
  onOpenJobDetails: () => void
}

export function JobOfferHeader({ title, onBack, onOpenJobDetails }: JobOfferHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full h-7 w-7 p-0"
          onClick={onBack}
        >
          <ArrowLeft className="h-3 w-3" />
        </Button>
        <div>
          <h1
            className="text-lg font-bold cursor-pointer hover:text-blue-600 transition-colors"
            onClick={onOpenJobDetails}
          >
            {title}
          </h1>
        </div>
      </div>
    </div>
  )
} 