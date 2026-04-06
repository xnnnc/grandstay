import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { ReservationsClient } from "@/components/reservations/reservations-client";

export default async function ReservationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const whereClause = user.role === "ADMIN" ? {} : { hotelId: user.hotelId ?? undefined };

  const reservations = await prisma.reservation.findMany({
    where: whereClause,
    include: {
      guest: true,
      room: true,
      hotel: true,
    },
    orderBy: { checkIn: "desc" },
  });

  const hotels =
    user.role === "ADMIN"
      ? await prisma.hotel.findMany({ orderBy: { name: "asc" } })
      : [];

  return (
    <ReservationsClient
      reservations={reservations}
      userRole={user.role}
      hotels={hotels}
    />
  );
}
