import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { BillingClient } from "@/components/billing/billing-client";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const reservationWhere =
    user.role !== "ADMIN" ? { hotelId: user.hotelId ?? undefined } : {};

  const invoices = await prisma.invoice.findMany({
    where:
      user.role !== "ADMIN"
        ? { reservation: { hotelId: user.hotelId ?? undefined } }
        : {},
    include: {
      reservation: {
        include: {
          guest: true,
          room: true,
          hotel: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const hotels =
    user.role === "ADMIN"
      ? await prisma.hotel.findMany({ orderBy: { name: "asc" } })
      : [];

  // Compute stats
  const paid = invoices.filter((inv) => inv.paidAt !== null);
  const unpaid = invoices.filter((inv) => inv.paidAt === null);
  const totalRevenue = paid.reduce((sum, inv) => sum + inv.total, 0);
  const paidCount = paid.length;
  const unpaidCount = unpaid.length;
  const allTotals = invoices.map((i) => i.total);
  const averageInvoice =
    allTotals.length > 0
      ? allTotals.reduce((sum, t) => sum + t, 0) / allTotals.length
      : 0;

  void reservationWhere;

  return (
    <BillingClient
      invoices={invoices}
      stats={{ totalRevenue, paidCount, unpaidCount, averageInvoice }}
      userRole={user.role}
      hotels={hotels}
    />
  );
}
