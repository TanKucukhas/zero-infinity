"use client";
import Navbar from '@/components/layout/navbar'
import { useUser } from '@/contexts/user-context'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      // Redirect to login page
      router.push('/login')
    }
  }, [user, router])

  // Show loading or nothing while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Redirecting to login...</p>
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