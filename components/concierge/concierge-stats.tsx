import { Card, CardContent } from "@/components/ui/card";

interface ConciergeStatsProps {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export function ConciergeStats({ total, pending, inProgress, completed }: ConciergeStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card className="rounded-xl">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">Toplam Talep</p>
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
          <p className="text-xs text-muted-foreground">İşleniyor</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{inProgress}</p>
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground">Tamamlanan</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{completed}</p>
        </CardContent>
      </Card>
    </div>
  );
}
