import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getStaff } from "@/actions/staff";
import { getHotels } from "@/actions/hotels";
import { StaffClient } from "@/components/staff/staff-client";

export default async function StaffPage() {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const [staffResult, hotelsResult] = await Promise.all([
    getStaff(),
    getHotels(),
  ]);

  const staff = staffResult.success && staffResult.data ? staffResult.data : [];
  const hotels = hotelsResult.success && hotelsResult.data
    ? hotelsResult.data.map((h: { id: string; name: string; city: string }) => ({
        id: h.id,
        name: h.name,
        city: h.city,
      }))
    : [];

  return <StaffClient staff={staff} hotels={hotels} />;
}
