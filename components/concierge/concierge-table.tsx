import {
  CallBell,
  ForkKnife,
  Car,
  MapTrifold,
  TShirt,
  DotsThree,
  Plus,
  Pencil,
  Trash,
  UserSwitch,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

interface ServiceRequest {
  id: string;
  guestId: string;
  hotelId: string;
  type: string;
  description: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  notes: string | null;
  completedAt: Date | string | null;
  createdAt: Date | string;
  guest: Guest;
  assignedTo: StaffMember | null;
}

const TYPE_CONFIG: Record<string, { label: string; Icon: React.ElementType }> = {
  ROOM_SERVICE: { label: "Oda Servisi", Icon: ForkKnife },
  TRANSFER: { label: "Transfer", Icon: Car },
  TOUR: { label: "Tur", Icon: MapTrifold },
  LAUNDRY: { label: "Çamaşır", Icon: TShirt },
  OTHER: { label: "Diğer", Icon: DotsThree },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Beklemede",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  IN_PROGRESS: {
    label: "İşleniyor",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  COMPLETED: {
    label: "Tamamlandı",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  CANCELLED: {
    label: "İptal",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string; pulse?: boolean }> = {
  LOW: {
    label: "Düşük",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
  NORMAL: {
    label: "Normal",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  HIGH: {
    label: "Yüksek",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  URGENT: {
    label: "Acil",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    pulse: true,
  },
};

function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} sa önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

interface ConciergeTableProps {
  filtered: ServiceRequest[];
  hasActiveFilters: boolean;
  isPending: boolean;
  deleteId: string | null;
  userRole: string;
  onCreateNew: () => void;
  onAssign: (id: string) => void;
  onUpdateStatus: (id: string) => void;
  onEdit: (request: ServiceRequest) => void;
  onDelete: (id: string) => void;
}

export function ConciergeTable({
  filtered,
  hasActiveFilters,
  isPending,
  deleteId,
  userRole,
  onCreateNew,
  onAssign,
  onUpdateStatus,
  onEdit,
  onDelete,
}: ConciergeTableProps) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {filtered.length > 0
            ? `${filtered.length} talep listeleniyor`
            : "Talep bulunamadı"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CallBell size={48} className="mb-4 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Filtre kriterlerine uygun talep bulunamadı."
                : "Henüz hizmet talebi bulunmamaktadır."}
            </p>
            {!hasActiveFilters && (
              <Button variant="outline" className="mt-4 gap-2" onClick={onCreateNew}>
                <Plus size={14} />
                Yeni talep oluştur
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tip</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Misafir</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Açıklama</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Öncelik</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Personel</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Zaman</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const typeConf = TYPE_CONFIG[r.type] ?? { label: r.type, Icon: DotsThree };
                  const statusConf = STATUS_CONFIG[r.status] ?? { label: r.status, className: "bg-zinc-100 text-zinc-600" };
                  const priorityConf = PRIORITY_CONFIG[r.priority] ?? { label: r.priority, className: "bg-zinc-100 text-zinc-600" };
                  const isDeleting = isPending && deleteId === r.id;

                  return (
                    <tr
                      key={r.id}
                      className={`border-b transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? "" : "bg-muted/10"}`}
                    >
                      {/* Type */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <typeConf.Icon size={15} />
                          <span className="hidden sm:inline text-xs">{typeConf.label}</span>
                        </div>
                      </td>

                      {/* Guest */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                            {r.guest.firstName[0]}{r.guest.lastName[0]}
                          </div>
                          <span className="font-medium whitespace-nowrap">
                            {r.guest.firstName} {r.guest.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="line-clamp-1 max-w-[200px] text-muted-foreground">
                          {r.description}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityConf.className} ${priorityConf.pulse ? "animate-pulse" : ""}`}
                        >
                          {priorityConf.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConf.className}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Assigned to */}
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {r.assignedTo?.name ?? "Atanmadı"}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell whitespace-nowrap">
                        {formatRelativeTime(r.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {r.status !== "COMPLETED" && r.status !== "CANCELLED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Personel Ata"
                              onClick={() => onAssign(r.id)}
                              disabled={isDeleting}
                            >
                              <UserSwitch size={14} />
                            </Button>
                          )}
                          {r.status !== "COMPLETED" && r.status !== "CANCELLED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Durum Güncelle"
                              onClick={() => onUpdateStatus(r.id)}
                              disabled={isDeleting}
                            >
                              <ArrowsClockwise size={14} />
                            </Button>
                          )}
                          {r.status !== "COMPLETED" && r.status !== "CANCELLED" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title="Düzenle"
                              onClick={() => onEdit(r)}
                              disabled={isDeleting}
                            >
                              <Pencil size={14} />
                            </Button>
                          )}
                          {userRole === "ADMIN" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                              title="Sil"
                              onClick={() => onDelete(r.id)}
                              disabled={isDeleting}
                            >
                              <Trash size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
