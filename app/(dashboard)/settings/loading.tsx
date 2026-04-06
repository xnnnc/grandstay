import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-64" />
      </div>
      {/* Profile card skeleton */}
      <div className="rounded-xl border bg-card p-4 flex flex-col gap-4">
        <Skeleton className="h-5 w-36" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
      {/* Theme card skeleton */}
      <div className="rounded-xl border bg-card p-4 flex flex-col gap-4">
        <Skeleton className="h-5 w-16" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
      {/* Language card skeleton */}
      <div className="rounded-xl border bg-card p-4 flex flex-col gap-4">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}
