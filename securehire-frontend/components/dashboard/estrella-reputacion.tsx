import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function EstrellasReputacion({ valor }: { valor: number }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn("h-4 w-4", i < valor ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600")}
        />
      ))}
    </div>
  )
}
