import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getHotels } from "@/actions/hotels";
import { HotelsClient } from "@/components/hotels/hotels-client";

export default async function HotelsPage() {
  const user = await requireRole(["ADMIN"]);
  if (!user) redirect("/login");

  const result = await getHotels();
  const hotels = result.success && result.data ? result.data : [];

  return <HotelsClient hotels={hotels} />;
}
