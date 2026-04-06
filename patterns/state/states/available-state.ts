import type { RoomState } from "../room-state";
import { MaintenanceState } from "./maintenance-state";
import { ReservedState } from "./reserved-state";

export class AvailableState implements RoomState {
  readonly name = "AVAILABLE";
  readonly label = "Müsait";

  reserve(): RoomState {
    return new ReservedState();
  }

  checkIn(): RoomState {
    throw new Error("Geçersiz durum geçişi: Müsait › Giriş yapılamaz");
  }

  checkOut(): RoomState {
    throw new Error("Geçersiz durum geçişi: Müsait › Çıkış yapılamaz");
  }

  completeCleaning(): RoomState {
    throw new Error("Geçersiz durum geçişi: Müsait › Temizlik tamamlanamaz");
  }

  startMaintenance(): RoomState {
    return new MaintenanceState();
  }

  completeMaintenance(): RoomState {
    throw new Error("Geçersiz durum geçişi: Müsait › Bakım tamamlanamaz");
  }
}

