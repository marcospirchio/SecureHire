"use client"

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b bg-white px-4 md:px-6">
      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
        <img src="/diverse-avatars.png" alt="User avatar" className="h-full w-full object-cover" />
      </div>
    </header>
  )
}
