import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

const TYPE_FILTER_OPTIONS = [
  { value: "", label: "Tüm Tipler" },
  { value: "ROOM_SERVICE", label: "Oda Servisi" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "TOUR", label: "Tur" },
  { value: "LAUNDRY", label: "Çamaşır" },
  { value: "OTHER", label: "Diğer" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tüm Durumlar" },
  { value: "PENDING", label: "Beklemede" },
  { value: "IN_PROGRESS", label: "İşleniyor" },
  { value: "COMPLETED", label: "Tamamlandı" },
  { value: "CANCELLED", label: "İptal" },
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "", label: "Tüm Öncelikler" },
  { value: "LOW", label: "Düşük" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Yüksek" },
  { value: "URGENT", label: "Acil" },
];

interface ConciergeFiltersProps {
  search: string;
  statusFilter: string;
  typeFilter: string;
  priorityFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
}

export function ConciergeFilters({
  search,
  statusFilter,
  typeFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onPriorityChange,
}: ConciergeFiltersProps) {
  const selectClass =
    "rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative">
        <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Misafir adı ara..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 w-52"
        />
      </div>
      <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} className={selectClass}>
        {STATUS_FILTER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select value={typeFilter} onChange={(e) => onTypeChange(e.target.value)} className={selectClass}>
        {TYPE_FILTER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select value={priorityFilter} onChange={(e) => onPriorityChange(e.target.value)} className={selectClass}>
        {PRIORITY_FILTER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
