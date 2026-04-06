import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { StatCardSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-44" />
        </div>
      </div>
      <StatCardSkeleton count={4} />
      <div className="rounded-xl border bg-card overflow-hidden">
        <TableSkeleton rows={6} columns={5} />
      </div>
    </div>
  );
}
