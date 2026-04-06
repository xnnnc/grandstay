"use client";

import {
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
  PENDING: "Bekliyor",
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
};

const TYPE_LABELS: Record<string, string> = {
  CLEANING: "Temizlik",
  MAINTENANCE: "Bakım",
  INSPECTION: "Denetim",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Düşük",
  NORMAL: "Normal",
  HIGH: "Yüksek",
  URGENT: "Acil",
};

interface HousekeepingData {
  total: number;
  completed: number;
  completionRate: number;
  avgCompletionTime: number;
  byStatus: { status: string; count: number }[];
  byType: { type: string; count: number }[];
  byPriority: { priority: string; count: number }[];
}

interface Props {
  data: HousekeepingData;
}

import dynamic from "next/dynamic";

function HousekeepingReportInner({ data }: Props) {
  const { total, completed, completionRate, avgCompletionTime, byStatus, byType, byPriority } = data;

  const chartData = byType.map((t) => ({
    name: TYPE_LABELS[t.type] ?? t.type,
    Tamamlandı: byStatus.find((s) => s.status === "COMPLETED")?.count ?? 0,
    Bekliyor: byStatus.find((s) => s.status === "PENDING")?.count ?? 0,
    "Devam Ediyor": byStatus.find((s) => s.status === "IN_PROGRESS")?.count ?? 0,
    count: t.count,
  }));

  const statusChartData = byStatus.map((s) => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    count: s.count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tamamlanma Oranı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-teal-600">{completionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {completed} / {total} görev
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ort. Tamamlanma Süresi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{avgCompletionTime} dk</p>
            <p className="text-xs text-muted-foreground mt-1">tamamlanan görev başına</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Görev
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">{total}</p>
            <p className="text-xs text-muted-foreground mt-1">seçili dönemde</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Duruma Göre Görevler</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} name="Görev Sayısı" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Önceliğe Göre Görevler</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={byPriority.map((p) => ({ name: PRIORITY_LABELS[p.priority] ?? p.priority, count: p.count }))}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Görev Sayısı" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Görev Tipi Detayı</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tip</TableHead>
                <TableHead className="text-right">Görev Sayısı</TableHead>
                <TableHead className="text-right">Pay %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byType.map((item) => (
                <TableRow key={item.type}>
                  <TableCell>
                    <Badge variant="outline">{TYPE_LABELS[item.type] ?? item.type}</Badge>
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

export const HousekeepingReport = dynamic(() => Promise.resolve(HousekeepingReportInner), { ssr: false });
