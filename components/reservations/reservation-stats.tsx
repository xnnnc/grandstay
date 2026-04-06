import { Card, CardContent } from "@/components/ui/card";

interface ReservationStatsProps {
  total: number;
  pending: number;
  confirmed: number;
  todayCheckIns: number;
}

export function ReservationStats({ total, pending, confirmed, todayCheckIns }: ReservationStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card className="rounded-xl">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">Toplam Rezervasyon</p>
          <p className="mt-1 text-2xl font-bold">{total}</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">Beklemede</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{pending}</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">Onaylandı</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{confirmed}</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">Bugünün Girişleri</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{todayCheckIns}</p>
        </CardContent>
      </Card>
    </div>
  );
}
