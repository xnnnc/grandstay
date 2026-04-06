import { ReportsClient } from "@/components/reports/reports-client";
import {
  getHotels,
  getOccupancyReport,
  getRevenueReport,
  getGuestStats,
  getHousekeepingReport,
  getReservationAnalysis,
} from "@/actions/reports";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [hotelsResult, occupancy, revenue, guests, housekeeping, reservations] =
    await Promise.all([
      getHotels(),
      getOccupancyReport(undefined, thirtyDaysAgo, today),
      getRevenueReport(undefined, thirtyDaysAgo, today),
      getGuestStats(undefined),
      getHousekeepingReport(undefined, thirtyDaysAgo, today),
      getReservationAnalysis(undefined, thirtyDaysAgo, today),
    ]);

  const hotels = hotelsResult.success ? hotelsResult.data : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Raporlar</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Doluluk, gelir, misafir ve rezervasyon analizleri
        </p>
      </div>
      <ReportsClient
        hotels={hotels}
        initialOccupancy={occupancy}
        initialRevenue={revenue}
        initialGuests={guests}
        initialHousekeeping={housekeeping}
        initialReservations={reservations}
      />
    </div>
  );
}
