import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "@/components/shared/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Welcome banner skeleton */}
      <div className="rounded-xl border bg-card p-5 space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart + activity skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="p-6 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3 border-t">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
