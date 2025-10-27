"use client";
// Layout Imports
import VerticalLayout from '@/components/layout/vertical-layout'
import Navbar from '@/components/layout/navbar'
import Sidebar from '@/components/navigation/sidebar'
import { useUser } from '@/contexts/user-context'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Show loading or redirect if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <VerticalLayout 
      topbar={<Navbar />} 
      sidebar={<Sidebar />}
    >
      {children}
    </VerticalLayout>
  )
}

export default Layout