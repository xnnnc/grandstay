"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateServiceRequestStatus } from "@/actions/concierge";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  currentStatus: string;
  hasAssignee: boolean;
  onSuccess: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  IN_PROGRESS: "İşleniyor",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  IN_PROGRESS: "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  COMPLETED: "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  CANCELLED: "border-zinc-300 bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const TRANSITIONS: Record<string, string[]> = {
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function StatusUpdateDialog({
  open,
  onOpenChange,
  requestId,
  currentStatus,
  hasAssignee,
  onSuccess,
}: StatusUpdateDialogProps) {
  const availableStatuses = TRANSITIONS[currentStatus] ?? [];
  const [selectedStatus, setSelectedStatus] = useState(availableStatuses[0] ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError("");
    if (!selectedStatus) return;

    if (selectedStatus === "IN_PROGRESS" && !hasAssignee) {
      setError("Durumu İşleniyor yapabilmek için önce personel atayın.");
      return;
    }

    startTransition(async () => {
      const result = await updateServiceRequestStatus(requestId, selectedStatus);
      if (!result.success) {
        setError(result.error ?? "Bir hata oluştu.");
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
          <DialogTitle>Durum Güncelle</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current status */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Mevcut Durum</p>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${STATUS_CLASS[currentStatus] ?? ""}`}
            >
              {STATUS_LABELS[currentStatus] ?? currentStatus}
            </span>
          </div>

          {/* Available transitions */}
          {availableStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Bu talep için durum değişikliği yapılamaz.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Yeni Durum</p>
              <div className="flex flex-col gap-2">
                {availableStatuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStatus(s)}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      selectedStatus === s
                        ? "border-primary bg-primary/10"
                        : "border-input hover:bg-muted/50"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[s] ?? ""}`}
                    >
                      {STATUS_LABELS[s] ?? s}
                    </span>
                    {selectedStatus === s && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            İptal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || availableStatuses.length === 0 || !selectedStatus}
          >
            {isPending ? "Güncelleniyor..." : "Güncelle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
