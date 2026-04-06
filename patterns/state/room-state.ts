import { AvailableState } from "./states/available-state";
import { ReservedState } from "./states/reserved-state";
import { OccupiedState } from "./states/occupied-state";
import { CleaningState } from "./states/cleaning-state";
import { MaintenanceState } from "./states/maintenance-state";

export interface RoomState {
  readonly name: string;
  readonly label: string;

  reserve(): RoomState;
  checkIn(): RoomState;
  checkOut(): RoomState;
  completeCleaning(): RoomState;
  startMaintenance(): RoomState;
  completeMaintenance(): RoomState;
}

export type TransitionAction =
  | "reserve"
  | "checkIn"
  | "checkOut"
  | "completeCleaning"
  | "startMaintenance"
  | "completeMaintenance";

const ACTION_LABELS: Record<TransitionAction, string> = {
  reserve: "Rezerve Et",
  checkIn: "Check-in Yap",
  checkOut: "Check-out Yap",
  completeCleaning: "Temizlik Tamamla",
  startMaintenance: "Bakıma Al",
  completeMaintenance: "Bakımı Tamamla",
};

const ALL_ACTIONS: TransitionAction[] = [
  "reserve",
  "checkIn",
  "checkOut",
  "completeCleaning",
  "startMaintenance",
  "completeMaintenance",
];

export class RoomContext {
  private state: RoomState;

  constructor(initialStatus: string) {
    this.state = RoomStateFactory.create(initialStatus);
  }

  getState(): RoomState {
    return this.state;
  }

  getStatus(): string {
    return this.state.name;
  }

  getLabel(): string {
    return this.state.label;
  }

  reserve(): void {
    this.state = this.state.reserve();
  }

  checkIn(): void {
    this.state = this.state.checkIn();
  }

  checkOut(): void {
    this.state = this.state.checkOut();
  }

  completeCleaning(): void {
    this.state = this.state.completeCleaning();
  }

  startMaintenance(): void {
    this.state = this.state.startMaintenance();
  }

  completeMaintenance(): void {
    this.state = this.state.completeMaintenance();
  }

  getAvailableTransitions(): { action: string; label: string; targetStatus: string }[] {
    const transitions: { action: string; label: string; targetStatus: string }[] = [];

    for (const action of ALL_ACTIONS) {
      try {
        const nextState = this.state[action]();
        transitions.push({
          action,
          label: ACTION_LABELS[action],
          targetStatus: nextState.name,
        });
      } catch {
        // Invalid transition — skip
      }
    }

    return transitions;
  }
}

export class RoomStateFactory {
  static create(status: string): RoomState {
    switch (status) {
      case "AVAILABLE":
        return new AvailableState();
      case "RESERVED":
        return new ReservedState();
      case "OCCUPIED":
        return new OccupiedState();
      case "CLEANING":
        return new CleaningState();
      case "MAINTENANCE":
        return new MaintenanceState();
      default:
        return new AvailableState();
    }
  }
}
