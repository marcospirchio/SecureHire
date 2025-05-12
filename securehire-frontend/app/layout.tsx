import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>Dashboard de Reclutamiento</title>
        <meta name="description" content="Dashboard de reclutamiento para gestionar candidatos" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          {`
            :root {
              --sidebar-width: 280px;
            }
          `}
        </style>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
