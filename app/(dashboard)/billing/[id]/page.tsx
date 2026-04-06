import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import { InvoiceDetail } from "@/components/billing/invoice-detail";

interface BillingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BillingDetailPage({ params }: BillingDetailPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      reservation: {
        include: {
          guest: true,
          room: true,
          hotel: true,
        },
      },
    },
  });

  if (!invoice) notFound();

  if (
    user.role !== "ADMIN" &&
    invoice.reservation.hotelId !== user.hotelId
  ) {
    redirect("/billing");
  }

  return <InvoiceDetail invoice={invoice} />;
}
