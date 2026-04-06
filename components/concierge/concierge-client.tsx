"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CallBell, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ServiceRequestDialog } from "@/components/concierge/service-request-dialog";
import { AssignDialog } from "@/components/concierge/assign-dialog";
import { StatusUpdateDialog } from "@/components/concierge/status-update-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteServiceRequest } from "@/actions/concierge";
import { ConciergeStats } from "@/components/concierge/concierge-stats";
import { ConciergeFilters } from "@/components/concierge/concierge-filters";
import { ConciergeTable } from "@/components/concierge/concierge-table";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

interface ServiceRequest {
  id: string;
  guestId: string;
  hotelId: string;
  type: string;
  description: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  notes: string | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
  guest: Guest;
  assignedTo: StaffMember | null;
}

interface ConciergeClientProps {
  requests: ServiceRequest[];
  guests: Guest[];
  staff: StaffMember[];
  hotelId: string;
  userRole: string;
}

export function ConciergeClient({
  requests,
  guests,
  staff,
  hotelId,
  userRole,
}: ConciergeClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editRequest, setEditRequest] = useState<ServiceRequest | null>(null);
  const [assignRequestId, setAssignRequestId] = useState<string | null>(null);
  const [statusRequestId, setStatusRequestId] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = requests.length;
  const pending = requests.filter((r) => r.status === "PENDING").length;
  const inProgress = requests.filter((r) => r.status === "IN_PROGRESS").length;
  const completed = requests.filter((r) => r.status === "COMPLETED").length;

  const filtered = requests.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (typeFilter && r.type !== typeFilter) return false;
    if (priorityFilter && r.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const fullName = `${r.guest.firstName} ${r.guest.lastName}`.toLowerCase();
      if (!fullName.includes(q)) return false;
    }
    return true;
  });

  const [isDeleting, setIsDeleting] = useState(false);

  function handleDeleteClick(id: string) {
    setDeleteId(id);
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deleteServiceRequest(deleteId);
      if (result.success) {
        setDeleteId(null);
        router.refresh();
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const assignRequest = requests.find((r) => r.id === assignRequestId);
  const statusRequest = requests.find((r) => r.id === statusRequestId);
  const hasActiveFilters = !!(search || statusFilter || typeFilter || priorityFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CallBell size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Concierge — Hizmet Talepleri</h1>
            <p className="text-sm text-muted-foreground">{total} hizmet talebi kayıtlı</p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus size={16} weight="bold" />
          Yeni Talep Oluştur
        </Button>
      </div>

      <ConciergeStats
        total={total}
        pending={pending}
        inProgress={inProgress}
        completed={completed}
      />

      <ConciergeFilters
        search={search}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        priorityFilter={priorityFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        onPriorityChange={setPriorityFilter}
      />

      <ConciergeTable
        filtered={filtered}
        hasActiveFilters={hasActiveFilters}
        isPending={isPending}
        deleteId={deleteId}
        userRole={userRole}
        onCreateNew={() => setCreateOpen(true)}
        onAssign={(id) => setAssignRequestId(id)}
        onUpdateStatus={(id) => setStatusRequestId(id)}
        onEdit={(request) => setEditRequest(request)}
        onDelete={handleDeleteClick}
      />

      {/* Create dialog */}
      <ServiceRequestDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        guests={guests}
        hotelId={hotelId}
        onSuccess={() => router.refresh()}
      />

      {/* Edit dialog */}
      {editRequest && (
        <ServiceRequestDialog
          open={!!editRequest}
          onOpenChange={(open) => { if (!open) setEditRequest(null); }}
          guests={guests}
          hotelId={hotelId}
          editRequest={editRequest}
          onSuccess={() => { router.refresh(); setEditRequest(null); }}
        />
      )}

      {/* Assign dialog */}
      {assignRequestId && assignRequest && (
        <AssignDialog
          open={!!assignRequestId}
          onOpenChange={(open) => { if (!open) setAssignRequestId(null); }}
          requestId={assignRequestId}
          currentAssignedId={assignRequest.assignedToId}
          staff={staff}
          onSuccess={() => { router.refresh(); setAssignRequestId(null); }}
        />
      )}

      {/* Status update dialog */}
      {statusRequestId && statusRequest && (
        <StatusUpdateDialog
          open={!!statusRequestId}
          onOpenChange={(open) => { if (!open) setStatusRequestId(null); }}
          requestId={statusRequestId}
          currentStatus={statusRequest.status}
          hasAssignee={!!statusRequest.assignedToId}
          onSuccess={() => { router.refresh(); setStatusRequestId(null); }}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Bu hizmet talebini silmek istediğinize emin misiniz?"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
