"use client";

import { useState, useTransition } from "react";
import {
  ForkKnife,
  Car,
  MapTrifold,
  TShirt,
  DotsThree,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createServiceRequest, updateServiceRequest } from "@/actions/concierge";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
}

interface ServiceRequest {
  id: string;
  guestId: string;
  hotelId: string;
  type: string;
  description: string;
  priority: string;
  notes: string | null;
}

interface ServiceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guests: Guest[];
  hotelId: string;
  editRequest?: ServiceRequest | null;
  onSuccess: () => void;
}

const TYPE_OPTIONS = [
  { value: "ROOM_SERVICE", label: "Oda Servisi", Icon: ForkKnife },
  { value: "TRANSFER", label: "Transfer", Icon: Car },
  { value: "TOUR", label: "Tur", Icon: MapTrifold },
  { value: "LAUNDRY", label: "Çamaşır", Icon: TShirt },
  { value: "OTHER", label: "Diğer", Icon: DotsThree },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Düşük" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Yüksek" },
  { value: "URGENT", label: "Acil" },
];

export function ServiceRequestDialog({
  open,
  onOpenChange,
  guests,
  hotelId,
  editRequest,
  onSuccess,
}: ServiceRequestDialogProps) {
  const isEdit = !!editRequest;
  const [guestSearch, setGuestSearch] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState(editRequest?.guestId ?? "");
  const [type, setType] = useState(editRequest?.type ?? "ROOM_SERVICE");
  const [description, setDescription] = useState(editRequest?.description ?? "");
  const [priority, setPriority] = useState(editRequest?.priority ?? "NORMAL");
  const [notes, setNotes] = useState(editRequest?.notes ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredGuests = guests.filter((g) => {
    const q = guestSearch.toLowerCase();
    return `${g.firstName} ${g.lastName}`.toLowerCase().includes(q);
  });

  const selectedGuest = guests.find((g) => g.id === selectedGuestId);

  function handleSubmit() {
    setError("");
    if (!selectedGuestId) {
      setError("Lütfen bir misafir seçin.");
      return;
    }
    if (!description.trim()) {
      setError("Açıklama zorunludur.");
      return;
    }

    startTransition(async () => {
      let result;
      if (isEdit && editRequest) {
        result = await updateServiceRequest(editRequest.id, {
          type,
          description,
          priority,
          notes,
        });
      } else {
        result = await createServiceRequest({
          guestId: selectedGuestId,
          hotelId,
          type,
          description,
          priority,
          notes,
        });
      }

      if (!result.success) {
        setError(result.error ?? "Bir hata oluştu.");
      } else {
        onSuccess();
        onOpenChange(false);
        // Reset form
        if (!isEdit) {
          setSelectedGuestId("");
          setGuestSearch("");
          setType("ROOM_SERVICE");
          setDescription("");
          setPriority("NORMAL");
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
            {isEdit ? "Talep Düzenle" : "Yeni Hizmet Talebi"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Guest selector */}
          {!isEdit && (
            <div className="space-y-2">
              <Label>Misafir</Label>
              {selectedGuest ? (
                <div className="flex items-center justify-between rounded-md border border-input bg-muted/40 px-3 py-2">
                  <span className="text-sm font-medium">
                    {selectedGuest.firstName} {selectedGuest.lastName}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => { setSelectedGuestId(""); setGuestSearch(""); }}
                  >
                    Değiştir
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="relative">
                    <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Misafir adı ile ara..."
                      value={guestSearch}
                      onChange={(e) => setGuestSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {guestSearch && (
                    <div className="max-h-40 overflow-y-auto rounded-md border border-input bg-background shadow-sm">
                      {filteredGuests.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Misafir bulunamadı.</p>
                      ) : (
                        filteredGuests.map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            className="flex w-full items-center px-3 py-2 text-sm hover:bg-muted/60 text-left"
                            onClick={() => {
                              setSelectedGuestId(g.id);
                              setGuestSearch("");
                            }}
                          >
                            <span className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                              {g.firstName[0]}{g.lastName[0]}
                            </span>
                            {g.firstName} {g.lastName}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  {!guestSearch && guests.length > 0 && (
                    <p className="text-xs text-muted-foreground">Yalnızca check-in yapmış misafirler listeleniyor.</p>
                  )}
                  {guests.length === 0 && (
                    <p className="text-xs text-muted-foreground">Şu an check-in yapmış misafir bulunmuyor.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Type selector */}
          <div className="space-y-2">
            <Label>Hizmet Tipi</Label>
            <div className="grid grid-cols-5 gap-2">
              {TYPE_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs transition-colors ${
                    type === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <Icon size={18} weight={type === value ? "fill" : "regular"} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              placeholder="Talep detaylarını yazın..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Priority */}
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar <span className="text-muted-foreground text-xs">(isteğe bağlı)</span></Label>
            <Textarea
              id="notes"
              placeholder="Ek notlar..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
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
