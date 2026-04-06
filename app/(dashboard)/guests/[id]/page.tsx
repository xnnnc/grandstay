import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { GuestDetail } from "@/components/guests/guest-detail";

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const guest = await prisma.guest.findUnique({
    where: { id },
    include: {
      reservations: {
        include: { room: true, hotel: true, invoice: true },
        orderBy: { checkIn: "desc" },
      },
      serviceRequests: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!guest) redirect("/guests");

  return <GuestDetail guest={guest} userRole={user.role} />;
}
