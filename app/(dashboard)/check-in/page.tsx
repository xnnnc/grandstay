import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTodayCheckIns } from "@/actions/reservations";
import { CheckInClient } from "@/components/check-in/check-in-client";

export default async function CheckInPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await getTodayCheckIns();

  const reservations = result.success ? result.data : [];

  return <CheckInClient reservations={reservations} />;
}
