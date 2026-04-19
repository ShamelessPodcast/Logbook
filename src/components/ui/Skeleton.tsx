import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-100', className)}
      aria-hidden="true"
    />
  )
}

/** Full post card skeleton */
export function PostCardSkeleton() {
  return (
    <div className="border-b border-gray-100 p-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-6 pt-1">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-4 w-10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Feed loading state */
export function FeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** Profile header skeleton */
export function ProfileSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="flex items-end justify-between -mt-8 px-2">
        <Skeleton className="h-16 w-16 rounded-full border-4 border-white" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

/** Vehicle card skeleton */
export function VehicleCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/** Notification skeleton */
export function NotificationSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
