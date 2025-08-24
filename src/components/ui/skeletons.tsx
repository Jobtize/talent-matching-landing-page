import { cn } from '@/lib/utils'

/**
 * Componente base de Skeleton
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
        className
      )}
      {...props}
    />
  )
}

/**
 * Skeleton para o perfil do usuário
 */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton para o formulário de candidato
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-[200px]" />
    </div>
  )
}

/**
 * Skeleton para o card de candidato
 */
export function CandidateCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <Skeleton className="h-5 w-[180px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  )
}

/**
 * Skeleton para a lista de candidatos
 */
export function CandidatesListSkeleton() {
  return (
    <div className="space-y-4">
      <CandidateCardSkeleton />
      <CandidateCardSkeleton />
      <CandidateCardSkeleton />
    </div>
  )
}

/**
 * Skeleton para o dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-lg" />
    </div>
  )
}

/**
 * Skeleton para o conteúdo principal
 */
export function ContentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-[300px]" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    </div>
  )
}

