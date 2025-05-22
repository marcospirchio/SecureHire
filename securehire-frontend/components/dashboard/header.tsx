"use client"

import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b bg-white px-4 md:px-6">
      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
        <img
          src={user?.fotoPerfil
            ? user.fotoPerfil.startsWith("data:image")
              ? user.fotoPerfil
              : `data:image/png;base64,${user.fotoPerfil}`
            : "/diverse-avatars.png"}
          alt={user ? `${user.nombre} ${user.apellido}` : "Avatar"}
          className="h-full w-full object-cover"
        />
      </div>
    </header>
  )
}
