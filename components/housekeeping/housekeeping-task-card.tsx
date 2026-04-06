import {
  Broom,
  Wrench,
  MagnifyingGlass,
  User,
  Clock,
  CheckCircle,
  Bed,
  Pencil,
  Trash,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

const TYPE_CONFIG: Record<string, { label: string; Icon: React.ElementType }> = {
  CLEANING: { label: "Temizlik", Icon: Broom },
  MAINTENANCE: { label: "Bakım", Icon: Wrench },
  INSPECTION: { label: "Denetim", Icon: MagnifyingGlass },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Bekleyen",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  IN_PROGRESS: {
    label: "Devam Eden",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  COMPLETED: {
    label: "Tamamlandı",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string; pulse?: boolean; borderClass: string }> = {
  LOW: {
    label: "Düşük",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    borderClass: "border-l-zinc-300",
  },
  NORMAL: {
    label: "Normal",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    borderClass: "border-l-blue-400",
  },
  HIGH: {
    label: "Yüksek",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    borderClass: "border-l-orange-400",
  },
  URGENT: {
    label: "Acil",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    pulse: true,
    borderClass: "border-l-red-500",
  },
};

function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface HousekeepingTaskCardProps {
  task: HousekeepingTask;
  isPending: boolean;
  deleteId: string | null;
  startId: string | null;
  canDelete: boolean;
  onStart: (task: HousekeepingTask) => void;
  onComplete: (task: HousekeepingTask) => void;
  onEdit: (task: HousekeepingTask) => void;
  onDelete: (id: string) => void;
}

export function HousekeepingTaskCard({
  task,
  isPending,
  deleteId,
  startId,
  canDelete,
  onStart,
  onComplete,
  onEdit,
  onDelete,
}: HousekeepingTaskCardProps) {
  const typeConf = TYPE_CONFIG[task.type] ?? { label: task.type, Icon: Broom };
  const statusConf = STATUS_CONFIG[task.status] ?? { label: task.status, className: "bg-zinc-100 text-zinc-600" };
  const priorityConf = PRIORITY_CONFIG[task.priority] ?? {
    label: task.priority,
    className: "bg-zinc-100 text-zinc-600",
    borderClass: "border-l-zinc-300",
  };
  const isDeleting = isPending && deleteId === task.id;
  const isStarting = isPending && startId === task.id;

  return (
    <Card className={`rounded-xl border-l-4 ${priorityConf.borderClass} transition-shadow hover:shadow-md`}>
      <CardContent className="p-4 space-y-3">
        {/* Room + type */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bed size={18} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-xl font-bold leading-none">No {task.room.number}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{task.room.floor}. Kat</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <typeConf.Icon size={15} />
            <span className="text-xs">{typeConf.label}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityConf.className} ${priorityConf.pulse ? "animate-pulse" : ""}`}
          >
            {priorityConf.label}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConf.className}`}
          >
            {statusConf.label}
          </span>
        </div>

        {/* Assigned to */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User size={13} />
          <span>{task.assignedTo?.name ?? "Atanmadı"}</span>
        </div>

        {/* Created at */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock size={13} />
          <span>{formatDateTime(task.createdAt)}</span>
        </div>

        {/* Notes */}
        {task.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 border-t border-border pt-2">
            {task.notes}
          </p>
        )}

        {/* Actions */}
        {task.status !== "COMPLETED" && (
          <div className="flex items-center gap-2 border-t border-border pt-3">
            {task.status === "PENDING" && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5 text-xs"
                onClick={() => onStart(task)}
                disabled={isStarting || isDeleting}
              >
                {isStarting ? "..." : "Göreve Başla"}
              </Button>
            )}
            {task.status === "IN_PROGRESS" && (
              <Button
                size="sm"
                className="flex-1 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => onComplete(task)}
                disabled={isDeleting}
              >
                <CheckCircle size={13} />
                Tamamla
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 shrink-0"
              title="Düzenle"
              onClick={() => onEdit(task)}
              disabled={isDeleting}
            >
              <Pencil size={13} />
            </Button>
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                title="Sil"
                onClick={() => onDelete(task.id)}
                disabled={isDeleting}
              >
                <Trash size={13} />
              </Button>
            )}
          </div>
        )}
        {task.status === "COMPLETED" && canDelete && (
          <div className="flex justify-end border-t border-border pt-3">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              title="Sil"
              onClick={() => onDelete(task.id)}
              disabled={isDeleting}
            >
              <Trash size={13} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
