"use client";

import { useState, useTransition } from "react";
import { Broom, Wrench, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createHousekeepingTask, updateHousekeepingTask } from "@/actions/housekeeping";

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
  priority: string;
  notes: string | null;
  assignedToId: string | null;
}

interface HousekeepingTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: Room[];
  staff: StaffMember[];
  editTask?: HousekeepingTask | null;
  onSuccess: () => void;
}

const TYPE_OPTIONS = [
  { value: "CLEANING", label: "Temizlik", Icon: Broom },
  { value: "MAINTENANCE", label: "Bakım", Icon: Wrench },
  { value: "INSPECTION", label: "Denetim", Icon: MagnifyingGlass },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Düşük" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Yüksek" },
  { value: "URGENT", label: "Acil" },
];

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Müsait",
  OCCUPIED: "Dolu",
  CLEANING: "Temizleniyor",
  MAINTENANCE: "Bakımda",
  RESERVED: "Rezerve",
};

export function HousekeepingTaskDialog({
  open,
  onOpenChange,
  rooms,
  staff,
  editTask,
  onSuccess,
}: HousekeepingTaskDialogProps) {
  const isEdit = !!editTask;

  const [roomSearch, setRoomSearch] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(editTask?.roomId ?? "");
  const [type, setType] = useState(editTask?.type ?? "CLEANING");
  const [priority, setPriority] = useState(editTask?.priority ?? "NORMAL");
  const [assignedToId, setAssignedToId] = useState(editTask?.assignedToId ?? "");
  const [notes, setNotes] = useState(editTask?.notes ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const filteredRooms = rooms.filter((r) => {
    const q = roomSearch.toLowerCase();
    return (
      r.number.toLowerCase().includes(q) ||
      String(r.floor).includes(q)
    );
  });

  function handleSubmit() {
    setError("");
    if (!selectedRoomId) {
      setError("Lütfen bir oda seçin.");
      return;
    }

    startTransition(async () => {
      let result;
      if (isEdit && editTask) {
        result = await updateHousekeepingTask(editTask.id, {
          roomId: selectedRoomId,
          type,
          priority,
          notes,
          assignedToId: assignedToId || undefined,
        });
      } else {
        result = await createHousekeepingTask({
          roomId: selectedRoomId,
          type,
          priority,
          notes,
          assignedToId: assignedToId || undefined,
        });
      }

      if (!result.success) {
        setError(result.error ?? "Bir hata oluştu.");
      } else {
        onSuccess();
        onOpenChange(false);
        if (!isEdit) {
          setSelectedRoomId("");
          setRoomSearch("");
          setType("CLEANING");
          setPriority("NORMAL");
          setAssignedToId("");
          setNotes("");
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Görevi Düzenle" : "Yeni Görev Oluştur"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Room selector */}
          <div className="space-y-2">
            <Label>Oda <span className="text-destructive">*</span></Label>
            {selectedRoom ? (
              <div className="flex items-center justify-between rounded-md border border-input bg-muted/40 px-3 py-2">
                <div>
                  <span className="text-sm font-medium">No {selectedRoom.number}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {selectedRoom.floor}. Kat — {STATUS_LABELS[selectedRoom.status] ?? selectedRoom.status}
                  </span>
                </div>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => { setSelectedRoomId(""); setRoomSearch(""); }}
                >
                  Değiştir
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="relative">
                  <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Oda numarası veya kat ile ara..."
                    value={roomSearch}
                    onChange={(e) => setRoomSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {roomSearch && (
                  <div className="max-h-40 overflow-y-auto rounded-md border border-input bg-background shadow-sm">
                    {filteredRooms.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-muted-foreground">Oda bulunamadı.</p>
                    ) : (
                      filteredRooms.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted/60 text-left"
                          onClick={() => { setSelectedRoomId(r.id); setRoomSearch(""); }}
                        >
                          <span className="font-medium">No {r.number}</span>
                          <span className="text-xs text-muted-foreground">
                            {r.floor}. Kat — {STATUS_LABELS[r.status] ?? r.status}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {!roomSearch && (
                  <p className="text-xs text-muted-foreground">Oda numarası veya kat girerek arayın.</p>
                )}
              </div>
            )}
          </div>

          {/* Type selector */}
          <div className="space-y-2">
            <Label>Görev Tipi</Label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs transition-colors ${
                    type === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <Icon size={20} weight={type === value ? "fill" : "regular"} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority selector */}
          <div className="space-y-2">
            <Label>Öncelik</Label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    priority === value
                      ? value === "URGENT"
                        ? "border-red-500 bg-red-500 text-white"
                        : value === "HIGH"
                        ? "border-orange-500 bg-orange-500 text-white"
                        : value === "LOW"
                        ? "border-zinc-400 bg-zinc-400 text-white"
                        : "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Assign to */}
          <div className="space-y-2">
            <Label>
              Personel Ata <span className="text-muted-foreground text-xs">(isteğe bağlı)</span>
            </Label>
            <select
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Atanmadı</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Notlar <span className="text-muted-foreground text-xs">(isteğe bağlı)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Ek notlar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Oluştur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
