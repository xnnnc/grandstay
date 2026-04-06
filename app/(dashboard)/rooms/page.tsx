import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { RoomsClient } from "@/components/rooms/rooms-client";

export default async function RoomsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rooms = await prisma.room.findMany({
    where: user.role === "ADMIN" ? {} : { hotelId: user.hotelId ?? undefined },
    include: { hotel: true },
    orderBy: [{ hotel: { name: "asc" } }, { floor: "asc" }, { number: "asc" }],
  });

  return <RoomsClient rooms={rooms} userRole={user.role} />;
}
