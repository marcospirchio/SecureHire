import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header público */}
      <header className="bg-white shadow-sm py-4 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10">
              <Image src="/logo-securehire.png" alt="SecureHire Logo" fill style={{ objectFit: "contain" }} />
            </div>
            <div>
              <h1 className="font-bold text-xl">SecureHire</h1>
              <p className="text-xs text-gray-500">Plataforma de reclutamiento</p>
            </div>
          </Link>

          <Button variant="ghost" size="icon" aria-label="Cambiar tema">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="pb-12">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>SecureHire © {new Date().getFullYear()} - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  )
}
