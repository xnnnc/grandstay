"use client";

import { useState, useTransition } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { addInvoiceItem } from "@/actions/billing";
import { useRouter } from "next/navigation";

interface AddItemDialogProps {
  invoiceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESETS = [
  { label: "Minibar", amount: 200 },
  { label: "Oda Servisi", amount: 150 },
  { label: "Çamaşır", amount: 100 },
  { label: "Otopark", amount: 50 },
];

export function AddItemDialog({ invoiceId, open, onOpenChange }: AddItemDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  function applyPreset(preset: { label: string; amount: number }) {
    setDescription(preset.label);
    setAmount(String(preset.amount));
    setError(null);
  }

  function handleSubmit() {
    const amountNum = parseFloat(amount);
    if (!description.trim()) {
      setError("Açıklama boş bırakılamaz.");
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Geçerli bir tutar giriniz.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await addInvoiceItem(invoiceId, {
        description: description.trim(),
        amount: amountNum,
      });
      if (!result.success) {
        setError(result.error ?? "Bir hata oluştu.");
      } else {
        setDescription("");
        setAmount("");
        onOpenChange(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            Hizmet Ekle
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Presets */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Hızlı Seçim</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  {p.label} — ₺{p.amount}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="add-item-description" className="text-sm font-medium">Açıklama</label>
            <Input
              id="add-item-description"
              placeholder="ör. Minibar, Oda Servisi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label htmlFor="add-item-amount" className="text-sm font-medium">Tutar (₺)</label>
            <Input
              id="add-item-amount"
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
            <Plus size={14} weight="bold" />
            {isPending ? "Ekleniyor..." : "Ekle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
