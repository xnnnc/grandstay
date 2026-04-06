import { Broom, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { HousekeepingTaskCard } from "@/components/housekeeping/housekeeping-task-card";

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

interface HousekeepingTaskListProps {
  filtered: HousekeepingTask[];
  hasActiveFilters: boolean;
  isPending: boolean;
  deleteId: string | null;
  startId: string | null;
  canDelete: boolean;
  onCreateNew: () => void;
  onStart: (task: HousekeepingTask) => void;
  onComplete: (task: HousekeepingTask) => void;
  onEdit: (task: HousekeepingTask) => void;
  onDelete: (id: string) => void;
}

export function HousekeepingTaskList({
  filtered,
  hasActiveFilters,
  isPending,
  deleteId,
  startId,
  canDelete,
  onCreateNew,
  onStart,
  onComplete,
  onEdit,
  onDelete,
}: HousekeepingTaskListProps) {
  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Broom size={52} className="mb-4 text-muted-foreground/25" />
        <p className="text-sm text-muted-foreground">
          {hasActiveFilters
            ? "Filtre kriterlerine uygun görev bulunamadı."
            : "Henüz kat hizmeti görevi bulunmamaktadır."}
        </p>
        {!hasActiveFilters && (
          <Button variant="outline" className="mt-4 gap-2" onClick={onCreateNew}>
            <Plus size={14} />
            Yeni görev oluştur
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((task) => (
        <HousekeepingTaskCard
          key={task.id}
          task={task}
          isPending={isPending}
          deleteId={deleteId}
          startId={startId}
          canDelete={canDelete}
          onStart={onStart}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
