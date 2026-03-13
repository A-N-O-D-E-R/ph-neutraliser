import { Skeleton } from "../ui/skeleton"

export function HardwareSkeleton() {
  return (
    <div className="space-y-6 p-6 md:p-8 lg:p-10">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}
