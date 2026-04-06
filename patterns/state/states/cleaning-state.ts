import type { RoomState } from "../room-state";
import { AvailableState } from "./available-state";
import { MaintenanceState } from "./maintenance-state";

export class CleaningState implements RoomState {
  readonly name = "CLEANING";
  readonly label = "Temizleniyor";

  reserve(): RoomState {
    throw new Error("Geçersiz durum geçişi: Temizleniyor › Rezerve edilemez");
  }

  checkIn(): RoomState {
    throw new Error("Geçersiz durum geçişi: Temizleniyor › Giriş yapılamaz");
  }

  checkOut(): RoomState {
    throw new Error("Geçersiz durum geçişi: Temizleniyor › Çıkış yapılamaz");
  }

  completeCleaning(): RoomState {
    return new AvailableState();
  }

  startMaintenance(): RoomState {
    return new MaintenanceState();
  }

  completeMaintenance(): RoomState {
    throw new Error("Geçersiz durum geçişi: Temizleniyor › Bakım tamamlanamaz");
  }
}

