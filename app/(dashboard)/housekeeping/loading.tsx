import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function HousekeepingLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <CardGridSkeleton count={9} columns={3} />
    </div>
  );
}
