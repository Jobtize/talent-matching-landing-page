import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ProfileSkeleton, ContentSkeleton } from '@/components/ui/skeletons'

export const metadata: Metadata = {
  title: 'Dashboard | Jobtize',
  description: 'Gerencie seu perfil e veja vagas personalizadas para você',
}

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar: React.ReactNode
  main: React.ReactNode
}

export default function DashboardLayout({
  children,
  sidebar,
  main,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar com Suspense para carregamento independente */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center mb-8">
          <h1 className="text-xl font-bold text-blue-600">Jobtize</h1>
        </div>
        
        <Suspense fallback={<ProfileSkeleton />}>
          {sidebar}
        </Suspense>
      </aside>
      
      {/* Conteúdo principal com Suspense para carregamento independente */}
      <main className="flex-1 p-6">
        <Suspense fallback={<ContentSkeleton />}>
          {main}
        </Suspense>
        
        {/* Conteúdo adicional */}
        {children}
      </main>
    </div>
  )
}

