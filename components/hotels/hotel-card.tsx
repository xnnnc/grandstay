"use client";

import { BuildingsIcon, StarIcon, UsersIcon, BedIcon, PhoneIcon, PencilIcon } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HotelWithCount {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  stars: number;
  isActive: boolean;
  _count: { rooms: number; staff: number };
}

interface HotelCardProps {
  hotel: HotelWithCount;
  onEdit?: () => void;
  onToggleActive?: () => void;
}

export function HotelCard({ hotel, onEdit, onToggleActive }: HotelCardProps) {
  return (
    <Card className="border border-border transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <BuildingsIcon size={22} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-base leading-tight">{hotel.name}</p>
              <p className="text-sm text-muted-foreground">{hotel.city}</p>
            </div>
          </div>
          <Badge variant={hotel.isActive ? "default" : "secondary"}>
            {hotel.isActive ? "Aktif" : "Pasif"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stars */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              size={16}
              weight={i < hotel.stars ? "fill" : "regular"}
              className={i < hotel.stars ? "text-amber-400" : "text-muted-foreground/30"}
            />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">{hotel.stars} Yıldız</span>
        </div>

        {/* Address */}
        <p className="text-sm text-muted-foreground line-clamp-2">{hotel.address}</p>

        {/* Phone */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <PhoneIcon size={14} />
          <span>{hotel.phone}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 border-t pt-3">
          <div className="flex items-center gap-1.5 text-sm">
            <BedIcon size={15} className="text-muted-foreground" />
            <span className="font-medium">{hotel._count.rooms}</span>
            <span className="text-muted-foreground">Oda</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <UsersIcon size={15} className="text-muted-foreground" />
            <span className="font-medium">{hotel._count.staff}</span>
            <span className="text-muted-foreground">Personel</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {onEdit && (
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={onEdit}>
              <PencilIcon size={14} />
              Düzenle
            </Button>
          )}
          {onToggleActive && (
            <Button
              variant={hotel.isActive ? "secondary" : "default"}
              size="sm"
              className="flex-1"
              onClick={onToggleActive}
            >
              {hotel.isActive ? "Pasif Yap" : "Aktif Yap"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
