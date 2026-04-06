"use client";

import { useState, useTransition } from "react";
import { UserCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { assignServiceRequest } from "@/actions/concierge";

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  currentAssignedId?: string | null;
  staff: StaffMember[];
  onSuccess: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Yönetici",
  MANAGER: "Müdür",
  RECEPTIONIST: "Resepsiyonist",
  CONCIERGE: "Concierge",
  HOUSEKEEPING: "Kat Hizmetleri",
};

export function AssignDialog({
  open,
  onOpenChange,
  requestId,
  currentAssignedId,
  staff,
  onSuccess,
}: AssignDialogProps) {
  const [selectedId, setSelectedId] = useState(currentAssignedId ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError("");
    if (!selectedId) {
      setError("Lütfen bir personel seçin.");
      return;
    }

    startTransition(async () => {
      const result = await assignServiceRequest(requestId, selectedId);
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
          <DialogTitle>Personel Ata</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {staff.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Atanabilecek personel bulunamadı.
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {staff.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    selectedId === s.id
                      ? "border-primary bg-primary/10"
                      : "border-input hover:bg-muted/50"
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <UserCircle size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[s.role] ?? s.role}</p>
                  </div>
                  {selectedId === s.id && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            İptal
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || staff.length === 0}>
            {isPending ? "Atanıyor..." : "Personel Ata"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
