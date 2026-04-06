import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTodayCheckOuts } from "@/actions/reservations";
import { CheckOutClient } from "@/components/check-in/check-out-client";

export default async function CheckOutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await getTodayCheckOuts();

  const reservations = result.success ? result.data : [];

  return <CheckOutClient reservations={reservations} />;
}
