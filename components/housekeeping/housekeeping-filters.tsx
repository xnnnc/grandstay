interface StaffMember {
  id: string;
  name: string;
  role: string;
}

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tüm Durumlar" },
  { value: "PENDING", label: "Bekleyen" },
  { value: "IN_PROGRESS", label: "Devam Eden" },
  { value: "COMPLETED", label: "Tamamlanan" },
];

const TYPE_FILTER_OPTIONS = [
  { value: "", label: "Tüm Tipler" },
  { value: "CLEANING", label: "Temizlik" },
  { value: "MAINTENANCE", label: "Bakım" },
  { value: "INSPECTION", label: "Denetim" },
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "", label: "Tüm Öncelikler" },
  { value: "LOW", label: "Düşük" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Yüksek" },
  { value: "URGENT", label: "Acil" },
];

interface HousekeepingFiltersProps {
  statusFilter: string;
  typeFilter: string;
  priorityFilter: string;
  staffFilter: string;
  staff: StaffMember[];
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onStaffChange: (value: string) => void;
}

export function HousekeepingFilters({
  statusFilter,
  typeFilter,
  priorityFilter,
  staffFilter,
  staff,
  onStatusChange,
  onTypeChange,
  onPriorityChange,
  onStaffChange,
}: HousekeepingFiltersProps) {
  const selectClass =
    "rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="flex flex-wrap gap-3">
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
      <select value={staffFilter} onChange={(e) => onStaffChange(e.target.value)} className={selectClass}>
        <option value="">Tüm Personel</option>
        <option value="__unassigned__">Atanmadı</option>
        {staff.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}
