"use client";
import Navbar from '@/components/layout/navbar'
import { useUser } from '@/contexts/user-context'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Force dynamic rendering for Cloudflare Pages
export const dynamic = 'force-dynamic';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, isReady } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if user is logged in (only on client side)
    if (typeof window === 'undefined') return;
    if (!isReady) return;

    if (!user) {
      // Use window.location instead of router to prevent hydration issues
      window.location.href = '/login';
      return;
    }

    setIsChecking(false)
  }, [user, isReady])

  // Show loading while checking authentication
  if (isChecking || !isReady || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">{!isReady ? "Loading..." : (!user ? "Redirecting to login..." : "Loading...")}</p>
        </div>
      </div>
    )
  }

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