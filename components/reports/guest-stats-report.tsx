"use client";

import {
  PieChart,
  Pie,
  Cell,
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

const COLORS = ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#f59e0b", "#8b5cf6", "#ef4444"];

interface GuestData {
  totalGuests: number;
  repeatGuests: number;
  nationalityDistribution: { nationality: string; count: number }[];
  mostCommonNationality: string;
  totalReservations: number;
}

interface Props {
  data: GuestData;
}

import dynamic from "next/dynamic";

function GuestStatsReportInner({ data }: Props) {
  const { totalGuests, repeatGuests, nationalityDistribution, mostCommonNationality, totalReservations } = data;

  const pieData = nationalityDistribution.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Misafir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-teal-600">{totalGuests}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalReservations} rezervasyon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tekrarlı Misafir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{repeatGuests}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalGuests > 0 ? Math.round((repeatGuests / totalGuests) * 100) : 0}% sadakat oranı
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Yaygın Uyruk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">{mostCommonNationality}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {nationalityDistribution[0]?.count ?? 0} misafir
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Uyruk Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="nationality"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={(props) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const nationality = String((props as any).nationality ?? "");
                    const percent = Number(props.percent ?? 0);
                    return `${nationality} ${(percent * 100).toFixed(0)}%`;
                  }}
                  labelLine={false}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={entry.nationality} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [Number(v ?? 0), "Misafir"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uyruk Detayı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-72 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Uyruk</TableHead>
                    <TableHead className="text-right">Misafir Sayısı</TableHead>
                    <TableHead className="text-right">Pay %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nationalityDistribution.map((item) => (
                    <TableRow key={item.nationality}>
                      <TableCell className="font-medium">{item.nationality}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                      <TableCell className="text-right">
                        {totalGuests > 0 ? Math.round((item.count / totalGuests) * 100) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const GuestStatsReport = dynamic(() => Promise.resolve(GuestStatsReportInner), { ssr: false });
