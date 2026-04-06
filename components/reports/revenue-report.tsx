"use client";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS = ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#f59e0b", "#8b5cf6", "#ef4444"];

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: "Tek Kişilik",
  DOUBLE: "Çift Kişilik",
  SUITE: "Süit",
  DELUXE: "Deluxe",
  FAMILY: "Aile",
};

interface RevenueData {
  dailyRevenue: { date: string; revenue: number }[];
  byRoomType: { type: string; revenue: number }[];
  totalRevenue: number;
  avgPerReservation: number;
  topRoomType: string;
  totalReservations: number;
}

interface Props {
  data: RevenueData;
}

import dynamic from "next/dynamic";

function RevenueReportInner({ data }: Props) {
  const { dailyRevenue, byRoomType, totalRevenue, avgPerReservation, topRoomType, totalReservations } = data;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Gelir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-teal-600">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalReservations} rezervasyon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rezervasyon Başına Ort.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(avgPerReservation)}</p>
            <p className="text-xs text-muted-foreground mt-1">ortalama gelir</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Çok Gelir Getiren
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">
              {ROOM_TYPE_LABELS[topRoomType] ?? topRoomType}
            </p>
            <p className="text-xs text-muted-foreground mt-1">oda tipi</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Günlük Gelir Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), "Gelir"]} />
              <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Oda Tipine Göre Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={byRoomType}
                  dataKey="revenue"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(props) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const type = String((props as any).type ?? "");
                    const percent = Number(props.percent ?? 0);
                    return `${ROOM_TYPE_LABELS[type] ?? type} ${(percent * 100).toFixed(0)}%`;
                  }}
                  labelLine={false}
                >
                  {byRoomType.map((entry, i) => (
                    <Cell key={entry.type} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), "Gelir"]} />
                <Legend formatter={(value) => ROOM_TYPE_LABELS[value] ?? value} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oda Tipine Göre Detay</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oda Tipi</TableHead>
                  <TableHead className="text-right">Gelir</TableHead>
                  <TableHead className="text-right">Pay %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byRoomType
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((item) => (
                    <TableRow key={item.type}>
                      <TableCell>{ROOM_TYPE_LABELS[item.type] ?? item.type}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                      <TableCell className="text-right">
                        {totalRevenue > 0
                          ? Math.round((item.revenue / totalRevenue) * 100)
                          : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const RevenueReport = dynamic(() => Promise.resolve(RevenueReportInner), { ssr: false });
