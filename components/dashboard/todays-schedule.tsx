"use client";

import { SignInIcon, SignOutIcon } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface TodaysScheduleProps {
  checkIns: number;
  checkOuts: number;
}

export function TodaysSchedule({ checkIns, checkOuts }: TodaysScheduleProps) {
  return (
    <Card className="rounded-xl border border-border/60 dashboard-card hover:border-primary/10">
      <CardHeader className="pb-2 border-b border-border/40">
        <h3 className="text-lg font-semibold">Bugünkü Giriş / Çıkış</h3>
        <p className="text-sm text-muted-foreground">Bugün beklenen misafir hareketleri</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x divide-border">
          {/* Check-in side */}
          <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 group/checkin">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 transition-transform duration-300 group-hover/checkin:scale-105">
              <SignInIcon size={24} weight="duotone" className="text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{checkIns}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Giriş</p>
            </div>
            <div className="h-1 w-10 rounded-full bg-emerald-500/30" />
          </div>

          {/* Check-out side */}
          <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 group/checkout">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 transition-transform duration-300 group-hover/checkout:scale-105">
              <SignOutIcon size={24} weight="duotone" className="text-orange-600" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{checkOuts}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Çıkış</p>
            </div>
            <div className="h-1 w-10 rounded-full bg-orange-500/30" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
