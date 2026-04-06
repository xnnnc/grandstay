import type { RoomState } from "../room-state";
import { OccupiedState } from "./occupied-state";

export class ReservedState implements RoomState {
  readonly name = "RESERVED";
  readonly label = "Rezerve";

  reserve(): RoomState {
    throw new Error("Geçersiz durum geçişi: Rezerve › Tekrar rezerve edilemez");
  }

  checkIn(): RoomState {
    return new OccupiedState();
  }

  checkOut(): RoomState {
    throw new Error("Geçersiz durum geçişi: Rezerve › Çıkış yapılamaz");
  }

  completeCleaning(): RoomState {
    throw new Error("Geçersiz durum geçişi: Rezerve › Temizlik tamamlanamaz");
  }

  startMaintenance(): RoomState {
    throw new Error("Geçersiz durum geçişi: Rezerve › Bakıma alınamaz");
  }

  completeMaintenance(): RoomState {
    throw new Error("Geçersiz durum geçişi: Rezerve › Bakım tamamlanamaz");
  }
}

