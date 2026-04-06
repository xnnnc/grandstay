import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";

interface Hotel {
  id: string;
  name: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "Tüm Durumlar" },
  { value: "PENDING", label: "Beklemede" },
  { value: "CONFIRMED", label: "Onaylandı" },
  { value: "CHECKED_IN", label: "Giriş Yapıldı" },
  { value: "CHECKED_OUT", label: "Çıkış Yapıldı" },
  { value: "CANCELLED", label: "İptal" },
];

const DATE_FILTER_OPTIONS = [
  { value: "", label: "Tüm Tarihler" },
  { value: "week", label: "Bu Hafta" },
  { value: "month", label: "Bu Ay" },
];

interface ReservationFiltersProps {
  search: string;
  statusFilter: string;
  dateFilter: string;
  hotelFilter: string;
  userRole: string;
  hotels: Hotel[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onHotelChange: (value: string) => void;
}

export function ReservationFilters({
  search,
  statusFilter,
  dateFilter,
  hotelFilter,
  userRole,
  hotels,
  onSearchChange,
  onStatusChange,
  onDateChange,
  onHotelChange,
}: ReservationFiltersProps) {
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

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        value={dateFilter}
        onChange={(e) => onDateChange(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {DATE_FILTER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {userRole === "ADMIN" && hotels.length > 0 && (
        <select
          value={hotelFilter}
          onChange={(e) => onHotelChange(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tüm Oteller</option>
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
