import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoomsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <TableSkeleton rows={8} columns={5} />
      </div>
    </div>
  );
}
