import type { RoomState } from "../room-state";
import { AvailableState } from "./available-state";

export class MaintenanceState implements RoomState {
  readonly name = "MAINTENANCE";
  readonly label = "Bakımda";

  reserve(): RoomState {
    throw new Error("Geçersiz durum geçişi: Bakımda › Rezerve edilemez");
  }

  checkIn(): RoomState {
    throw new Error("Geçersiz durum geçişi: Bakımda › Giriş yapılamaz");
  }

  checkOut(): RoomState {
    throw new Error("Geçersiz durum geçişi: Bakımda › Çıkış yapılamaz");
  }

  completeCleaning(): RoomState {
    throw new Error("Geçersiz durum geçişi: Bakımda › Temizlik tamamlanamaz");
  }

  startMaintenance(): RoomState {
    throw new Error("Geçersiz durum geçişi: Bakımda › Tekrar bakıma alınamaz");
  }

  completeMaintenance(): RoomState {
    return new AvailableState();
  }
}

