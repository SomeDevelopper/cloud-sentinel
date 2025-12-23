'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { userAPI } from '@/lib/api'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, setUser } = useAuthStore()

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        router.push('/auth/login')
        return
      }

      try {
        const user = await userAPI.getCurrentUser()
        setUser(user)
      } catch (error) {
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [isAuthenticated, router, setUser])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
