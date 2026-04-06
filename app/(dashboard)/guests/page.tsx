import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { GuestsClient } from "@/components/guests/guests-client";

export default async function GuestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [guests, activeReservations] = await Promise.all([
    prisma.guest.findMany({
      include: {
        reservations: {
          include: { hotel: true, room: true },
          orderBy: { checkIn: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reservation.findMany({
      where: { status: "CHECKED_IN" },
      include: {
        guest: true,
        room: true,
        hotel: true,
      },
      orderBy: { checkIn: "asc" },
    }),
  ]);

  return (
    <GuestsClient
      guests={guests}
      userRole={user.role}
      activeReservations={activeReservations}
    />
  );
}
