"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

interface DayData {
  date: string;
  occupancy: number;
  occupiedRooms: number;
}

interface OccupancyData {
  days: DayData[];
  avgOccupancy: number;
  peak: { date: string; occupancy: number };
  lowest: { date: string; occupancy: number };
  totalRooms: number;
}

interface Props {
  data: OccupancyData;
}

import dynamic from "next/dynamic";

function OccupancyReportInner({ data }: Props) {
  const { days, avgOccupancy, peak, lowest, totalRooms } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ortalama Doluluk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-teal-600">{avgOccupancy}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalRooms} oda toplam
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Yüksek Doluluk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{peak.occupancy}%</p>
            <p className="text-xs text-muted-foreground mt-1">{peak.date}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Düşük Doluluk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">{lowest.occupancy}%</p>
            <p className="text-xs text-muted-foreground mt-1">{lowest.date}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Günlük Doluluk Oranı (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={days} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`${value ?? 0}%`, "Doluluk"]} />
              <Bar dataKey="occupancy" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Günlük Detay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">Dolu Oda</TableHead>
                  <TableHead className="text-right">Toplam Oda</TableHead>
                  <TableHead className="text-right">Doluluk %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map((d) => (
                  <TableRow key={d.date}>
                    <TableCell>{d.date}</TableCell>
                    <TableCell className="text-right">{d.occupiedRooms}</TableCell>
                    <TableCell className="text-right">{totalRooms}</TableCell>
                    <TableCell className="text-right font-medium">{d.occupancy}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const OccupancyReport = dynamic(() => Promise.resolve(OccupancyReportInner), { ssr: false });
