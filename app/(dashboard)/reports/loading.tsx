import { CardGridSkeleton, StatCardSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      {/* Tab skeletons */}
      <div className="flex gap-2 border-b pb-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-t-lg" />
        ))}
      </div>
      <StatCardSkeleton count={4} />
      {/* Chart area skeleton */}
      <div className="rounded-xl border bg-card p-6 flex flex-col gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
