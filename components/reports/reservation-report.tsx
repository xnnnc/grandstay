"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  CONFIRMED: "Onaylı",
  CHECKED_IN: "Giriş Yapıldı",
  CHECKED_OUT: "Çıkış Yapıldı",
  CANCELLED: "İptal Edildi",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#0d9488",
  CHECKED_IN: "#14b8a6",
  CHECKED_OUT: "#8b5cf6",
  CANCELLED: "#ef4444",
};

interface ReservationAnalysis {
  total: number;
  cancelled: number;
  cancellationRate: number;
  avgStayDuration: number;
  statusDistribution: { status: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}

interface Props {
  data: ReservationAnalysis;
}

import dynamic from "next/dynamic";

function ReservationReportInner({ data }: Props) {
  const { total, cancelled, cancellationRate, avgStayDuration, statusDistribution, monthlyTrend } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Rezervasyon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-teal-600">{total}</p>
            <p className="text-xs text-muted-foreground mt-1">seçili dönemde</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              İptal Oranı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{cancellationRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{cancelled} iptal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ort. Konaklama Süresi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">{avgStayDuration} gece</p>
            <p className="text-xs text-muted-foreground mt-1">ortalama konaklaması</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Durum Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(props) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const status = String((props as any).status ?? "");
                    const percent = Number(props.percent ?? 0);
                    return `${STATUS_LABELS[status] ?? status} ${(percent * 100).toFixed(0)}%`;
                  }}
                  labelLine={false}
                >
                  {statusDistribution.map((item) => (
                    <Cell
                      key={item.status}
                      fill={STATUS_COLORS[item.status] ?? "#0d9488"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, name) => [Number(v ?? 0), STATUS_LABELS[String(name)] ?? String(name)]}
                />
                <Legend formatter={(value) => STATUS_LABELS[value] ?? value} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aylık Rezervasyon Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} name="Rezervasyon" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Durum Detayı</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Sayı</TableHead>
                <TableHead className="text-right">Pay %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusDistribution.map((item) => (
                <TableRow key={item.status}>
                  <TableCell>
                    <Badge
                      style={{ backgroundColor: STATUS_COLORS[item.status] ?? "#0d9488" }}
                      className="text-white border-0"
                    >
                      {STATUS_LABELS[item.status] ?? item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                  <TableCell className="text-right">
                    {total > 0 ? Math.round((item.count / total) * 100) : 0}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export const ReservationReport = dynamic(() => Promise.resolve(ReservationReportInner), { ssr: false });
