"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, MagnifyingGlassIcon, UsersIcon, FunnelIcon } from "@phosphor-icons/react";
import { StaffTable } from "./staff-table";
import { StaffDialog } from "./staff-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toggleStaffActive, deleteStaff } from "@/actions/staff";
import { UserRole } from "@/types";

const ROLE_OPTIONS: { value: UserRole | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tüm Roller" },
  { value: "ADMIN", label: "Yönetici" },
  { value: "MANAGER", label: "Müdür" },
  { value: "RECEPTIONIST", label: "Resepsiyonist" },
  { value: "HOUSEKEEPING", label: "Kat Hizmetleri" },
  { value: "CONCIERGE", label: "Concierge" },
];

interface Hotel {
  id: string;
  name: string;
  city: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  hotel: { id: string; name: string; city: string } | null;
}

interface StaffClientProps {
  staff: StaffMember[];
  hotels: Hotel[];
}

export function StaffClient({ staff, hotels }: StaffClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [hotelFilter, setHotelFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startTransition] = useTransition();

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteStaff(deleteTarget);
      if (result.success) {
        setDeleteTarget(null);
        router.refresh();
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    return staff.filter((member) => {
      if (roleFilter !== "ALL" && member.role !== roleFilter) return false;
      if (hotelFilter !== "ALL" && member.hotel?.id !== hotelFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !member.name.toLowerCase().includes(q) &&
          !member.email.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [staff, roleFilter, hotelFilter, search]);

  const hasFilters = search !== "" || roleFilter !== "ALL" || hotelFilter !== "ALL";

  function openAdd() {
    setEditStaff(null);
    setDialogOpen(true);
  }

  function openEdit(member: StaffMember) {
    setEditStaff(member);
    setDialogOpen(true);
  }

  function handleToggleActive(member: StaffMember) {
    startTransition(async () => {
      await toggleStaffActive(member.id);
    });
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personel Yönetimi</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} personel{filtered.length !== staff.length ? ` / ${staff.length} toplam` : " toplam"}
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5 sm:self-start">
          <PlusIcon size={16} />
          Yeni Personel Ekle
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[160px]">
          <MagnifyingGlassIcon
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Ad veya e-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex items-center gap-1.5">
            <FunnelIcon size={14} className="text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">Filtrele:</span>
          </div>

          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "ALL")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={hotelFilter} onValueChange={setHotelFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tüm Oteller" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tüm Oteller</SelectItem>
              {hotels.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-9"
              onClick={() => {
                setSearch("");
                setRoleFilter("ALL");
                setHotelFilter("ALL");
              }}
            >
              Temizle
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <UsersIcon size={28} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Personel bulunamadı</p>
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? "Filtreleri değiştirerek tekrar deneyin."
                : "Henüz hiç personel eklenmemiş."}
            </p>
          </div>
          {!hasFilters && (
            <Button onClick={openAdd} variant="outline" className="gap-1.5">
              <PlusIcon size={16} />
              İlk Personeli Ekle
            </Button>
          )}
        </div>
      ) : (
        <StaffTable
          staff={filtered}
          onEdit={openEdit}
          onToggleActive={handleToggleActive}
          onDelete={(member) => setDeleteTarget(member.id)}
        />
      )}

      <StaffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        staff={editStaff}
        hotels={hotels}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Bu personeli silmek istediğinize emin misiniz?"
        description="Personel kaydı kalıcı olarak silinecektir."
        confirmLabel="Sil"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
