import { Star } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface FavoriteToggleProps {
  showOnlyFavorites: boolean;
  onToggle: () => void;
}

export function FavoriteToggle({ showOnlyFavorites, onToggle }: FavoriteToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={`flex items-center gap-2 ${showOnlyFavorites ? 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100' : ''}`}
    >
      <Star className="h-4 w-4" fill={showOnlyFavorites ? "currentColor" : "none"} />
      {showOnlyFavorites ? "Mostrar todos" : "Mostrar favoritos"}
    </Button>
  )
} 