"use client";

import { PencilIcon, TrashIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRole } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Yönetici",
  MANAGER: "Müdür",
  RECEPTIONIST: "Resepsiyonist",
  HOUSEKEEPING: "Kat Hizmetleri",
  CONCIERGE: "Concierge",
};

const ROLE_BADGE_VARIANTS: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  MANAGER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  RECEPTIONIST: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  HOUSEKEEPING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  CONCIERGE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  hotel: { id: string; name: string; city: string } | null;
}

interface StaffTableProps {
  staff: StaffMember[];
  onEdit: (staff: StaffMember) => void;
  onToggleActive: (staff: StaffMember) => void;
  onDelete?: (staff: StaffMember) => void;
}

export function StaffTable({ staff, onEdit, onToggleActive, onDelete }: StaffTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad Soyad</TableHead>
            <TableHead>E-posta</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Otel</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell className="text-muted-foreground">{member.email}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    ROLE_BADGE_VARIANTS[member.role as UserRole] ?? ""
                  }`}
                >
                  {ROLE_LABELS[member.role as UserRole] ?? member.role}
                </span>
              </TableCell>
              <TableCell>
                {member.hotel ? (
                  <span className="text-sm">
                    {member.hotel.name}
                    <span className="ml-1 text-xs text-muted-foreground">({member.hotel.city})</span>
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={member.isActive ? "default" : "secondary"}>
                  {member.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(member)}
                    title="Düzenle"
                  >
                    <PencilIcon size={15} />
                  </Button>
                  <Button
                    variant={member.isActive ? "secondary" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => onToggleActive(member)}
                  >
                    {member.isActive ? "Pasif Yap" : "Aktif Yap"}
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(member)}
                      title="Sil"
                    >
                      <TrashIcon size={15} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
