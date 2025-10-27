"use client";
import Navbar from '@/components/layout/navbar'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <Navbar />
      </header>
      
      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        {children}
      </main>
    </div>
  )
}

export default Layout