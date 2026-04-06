"use client";

import { useTransition } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { completeTask } from "@/actions/housekeeping";

interface HousekeepingTask {
  id: string;
  type: string;
  room: {
    number: string;
  };
  assignedTo: { name: string } | null;
}

interface CompleteTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: HousekeepingTask;
  onSuccess: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  CLEANING: "Temizlik",
  MAINTENANCE: "Bakım",
  INSPECTION: "Denetim",
};

export function CompleteTaskDialog({
  open,
  onOpenChange,
  task,
  onSuccess,
}: CompleteTaskDialogProps) {
  const [isPending, startTransition] = useTransition();

  const typeLabel = TYPE_LABELS[task.type] ?? task.type;
  const willBecomeAvailable = task.type === "CLEANING" || task.type === "MAINTENANCE";

  function handleConfirm() {
    startTransition(async () => {
      const result = await completeTask(task.id);
      if (!result.success) {
        alert(result.error ?? "Bir hata oluştu.");
      } else {
        onSuccess();
        onOpenChange(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-500" />
            Görevi Tamamla
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Görevi tamamlamak istediğinize emin misiniz?
          </p>

          <div className="rounded-lg border border-input bg-muted/30 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Oda</span>
              <span className="font-medium">No {task.room.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Görev Tipi</span>
              <span className="font-medium">{typeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Personel</span>
              <span className="font-medium">{task.assignedTo?.name ?? "Atanmadı"}</span>
            </div>
          </div>

          {willBecomeAvailable && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
              {task.type === "CLEANING"
                ? `Oda ${task.room.number} temizlik tamamlanarak "Müsait" durumuna geçecektir.`
                : `Oda ${task.room.number} bakım tamamlanarak "Müsait" durumuna geçecektir.`}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            İptal
          </Button>
          <Button onClick={handleConfirm} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isPending ? "Tamamlanıyor..." : "Tamamla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
