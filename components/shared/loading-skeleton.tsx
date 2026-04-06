import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Header row */}
      <div className="flex gap-4 px-4 py-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className={cn(
            "flex gap-4 px-4 py-3 border-b",
            rowIdx % 2 === 0 ? "bg-muted/30" : ""
          )}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className="h-4 flex-1"
              style={{ maxWidth: colIdx === 0 ? "120px" : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface CardGridSkeletonProps {
  count?: number;
  columns?: number;
  className?: string;
}

export function CardGridSkeleton({ count = 6, columns = 3, className }: CardGridSkeletonProps) {
  const gridCols: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns] ?? "grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

interface StatCardSkeletonProps {
  count?: number;
  className?: string;
}

export function StatCardSkeleton({ count = 4, className }: StatCardSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          <Skeleton className="h-7 w-16 mt-1" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}
