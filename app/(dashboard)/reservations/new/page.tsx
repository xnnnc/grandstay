import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { ReservationWizard } from "@/components/reservations/reservation-wizard";
import { CalendarCheck } from "@phosphor-icons/react/dist/ssr";

export default async function NewReservationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const hotels =
    user.role === "ADMIN"
      ? await prisma.hotel.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
      : user.hotelId
      ? await prisma.hotel.findMany({ where: { id: user.hotelId } })
      : [];

  if (hotels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground">Rezervasyon oluşturmak için önce bir otel tanımlanmalıdır.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <CalendarCheck size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Yeni Rezervasyon</h1>
          <p className="text-sm text-muted-foreground">Adım adım yeni bir rezervasyon oluşturun.</p>
        </div>
      </div>

      <ReservationWizard
        hotels={hotels}
        defaultHotelId={user.role !== "ADMIN" ? (user.hotelId ?? undefined) : undefined}
        userRole={user.role}
      />
    </div>
  );
}
