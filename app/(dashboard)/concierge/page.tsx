import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getServiceRequests, getCheckedInGuests, getConciergeStaff } from "@/actions/concierge";
import { ConciergeClient } from "@/components/concierge/concierge-client";

export default async function ConciergePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [requestsResult, guestsResult, staffResult] = await Promise.all([
    getServiceRequests(),
    getCheckedInGuests(),
    getConciergeStaff(),
  ]);

  const requests = requestsResult.success ? requestsResult.data : [];
  const guests = guestsResult.success ? guestsResult.data : [];
  const staff = staffResult.success ? staffResult.data : [];

  const hotelId = user.hotelId ?? "";

  return (
    <div className="p-6">
      <ConciergeClient
        requests={requests}
        guests={guests}
        staff={staff}
        hotelId={hotelId}
        userRole={user.role}
      />
    </div>
  );
}
