import type { RoomState } from "../room-state";
import { CleaningState } from "./cleaning-state";

export class OccupiedState implements RoomState {
  readonly name = "OCCUPIED";
  readonly label = "Dolu";

  reserve(): RoomState {
    throw new Error("Geçersiz durum geçişi: Dolu › Rezerve edilemez");
  }

  checkIn(): RoomState {
    throw new Error("Geçersiz durum geçişi: Dolu › Tekrar giriş yapılamaz");
  }

  checkOut(): RoomState {
    return new CleaningState();
  }

  completeCleaning(): RoomState {
    throw new Error("Geçersiz durum geçişi: Dolu › Temizlik tamamlanamaz");
  }

  startMaintenance(): RoomState {
    throw new Error("Geçersiz durum geçişi: Dolu › Bakıma alınamaz");
  }

  completeMaintenance(): RoomState {
    throw new Error("Geçersiz durum geçişi: Dolu › Bakım tamamlanamaz");
  }
}

