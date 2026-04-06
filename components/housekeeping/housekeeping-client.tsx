"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Broom, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { HousekeepingTaskDialog } from "@/components/housekeeping/housekeeping-task-dialog";
import { CompleteTaskDialog } from "@/components/housekeeping/complete-task-dialog";
import { deleteHousekeepingTask, assignTask } from "@/actions/housekeeping";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { HousekeepingStats } from "@/components/housekeeping/housekeeping-stats";
import { HousekeepingFilters } from "@/components/housekeeping/housekeeping-filters";
import { HousekeepingTaskList } from "@/components/housekeeping/housekeeping-task-list";

// ── Types ────────────────────────────────────────────────────────────────────

interface Room {
  id: string;
  number: string;
  floor: number;
  status: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

interface HousekeepingTask {
  id: string;
  roomId: string;
  type: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  notes: string | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
  room: Room & { hotel?: { id: string; name: string } };
  assignedTo: StaffMember | null;
}

interface Stats {
  pendingCount: number;
  inProgressCount: number;
  completedTodayCount: number;
  roomsNeedingCleaning: number;
  roomsInMaintenance: number;
}

interface HousekeepingClientProps {
  tasks: HousekeepingTask[];
  rooms: Room[];
  staff: StaffMember[];
  stats: Stats;
  userRole: string;
  hotelId: string;
}

// ── Main component ───────────────────────────────────────────────────────────

export function HousekeepingClient({
  tasks,
  rooms,
  staff,
  stats,
  userRole,
  hotelId,
}: HousekeepingClientProps) {
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<HousekeepingTask | null>(null);
  const [completeTask, setCompleteTask] = useState<HousekeepingTask | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [startId, setStartId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (typeFilter && t.type !== typeFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (staffFilter) {
      if (staffFilter === "__unassigned__") {
        if (t.assignedToId !== null) return false;
      } else {
        if (t.assignedToId !== staffFilter) return false;
      }
    }
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteId(deleteTarget);
    try {
      const result = await deleteHousekeepingTask(deleteTarget);
      if (!result.success) console.error(result.error ?? "Silme işlemi başarısız.");
      else router.refresh();
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  function handleDelete(id: string) {
    setDeleteTarget(id);
  }

  function handleStart(task: HousekeepingTask) {
    if (!task.assignedToId) {
      setEditTask(task);
      return;
    }
    setStartId(task.id);
    startTransition(async () => {
      const result = await assignTask(task.id, task.assignedToId!);
      setStartId(null);
      if (!result.success) alert(result.error ?? "İşlem başarısız.");
      else router.refresh();
    });
  }

  const canDelete = userRole === "ADMIN" || userRole === "MANAGER";
  const hasActiveFilters = !!(statusFilter || typeFilter || priorityFilter || staffFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Broom size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kat Hizmetleri</h1>
            <p className="text-sm text-muted-foreground">{tasks.length} görev kayıtlı</p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus size={16} weight="bold" />
          Yeni Görev
        </Button>
      </div>

      <HousekeepingStats stats={stats} />

      <HousekeepingFilters
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        priorityFilter={priorityFilter}
        staffFilter={staffFilter}
        staff={staff}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
        onPriorityChange={setPriorityFilter}
        onStaffChange={setStaffFilter}
      />

      <HousekeepingTaskList
        filtered={filtered}
        hasActiveFilters={hasActiveFilters}
        isPending={isPending}
        deleteId={deleteId}
        startId={startId}
        canDelete={canDelete}
        onCreateNew={() => setCreateOpen(true)}
        onStart={handleStart}
        onComplete={(task) => setCompleteTask(task)}
        onEdit={(task) => setEditTask(task)}
        onDelete={handleDelete}
      />

      {/* Create dialog */}
      <HousekeepingTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        rooms={rooms}
        staff={staff}
        onSuccess={() => router.refresh()}
      />

      {/* Edit dialog */}
      {editTask && (
        <HousekeepingTaskDialog
          open={!!editTask}
          onOpenChange={(open) => { if (!open) setEditTask(null); }}
          rooms={rooms}
          staff={staff}
          editTask={editTask}
          onSuccess={() => { router.refresh(); setEditTask(null); }}
        />
      )}

      {/* Complete task dialog */}
      {completeTask && (
        <CompleteTaskDialog
          open={!!completeTask}
          onOpenChange={(open) => { if (!open) setCompleteTask(null); }}
          task={completeTask}
          onSuccess={() => { router.refresh(); setCompleteTask(null); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Bu görevi silmek istediğinize emin misiniz?"
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
