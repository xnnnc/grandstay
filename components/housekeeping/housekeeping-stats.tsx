import { Broom, Wrench, Clock, CheckCircle, Warning } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";

interface Stats {
  pendingCount: number;
  inProgressCount: number;
  completedTodayCount: number;
  roomsNeedingCleaning: number;
  roomsInMaintenance: number;
}

interface HousekeepingStatsProps {
  stats: Stats;
}

export function HousekeepingStats({ stats }: HousekeepingStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <Card className="rounded-xl">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-amber-500" />
            <p className="text-xs text-muted-foreground">Bekleyen Görevler</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.pendingCount}</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Warning size={14} className="text-blue-500" />
            <p className="text-xs text-muted-foreground">Devam Eden</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgressCount}</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-emerald-500" />
            <p className="text-xs text-muted-foreground">Bugün Tamamlanan</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.completedTodayCount}</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Broom size={14} className="text-orange-500" />
            <p className="text-xs text-muted-foreground">Temizlik Bekleyen</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.roomsNeedingCleaning}</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Wrench size={14} className="text-red-500" />
            <p className="text-xs text-muted-foreground">Bakımdaki Odalar</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.roomsInMaintenance}</p>
        </CardContent>
      </Card>
    </div>
  );
}
