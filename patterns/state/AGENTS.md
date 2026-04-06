# State Pattern - Room Status Management

**Parent:** [../AGENTS.md](../AGENTS.md)

## Purpose

State pattern for room status management — each room state defines valid transitions. This implementation models a hotel room lifecycle where the current state determines which actions are allowed and what state follows each action.

## Pattern Overview

The State pattern encapsulates room status logic into separate state objects. Each state implements the `RoomState` interface and defines which transitions are valid. Invalid transitions throw errors, preventing illegal state changes.

This approach:

- Eliminates large conditional blocks for status logic
- Makes valid transitions explicit and type-safe
- Allows each state to define its own behavior
- Makes it easy to add new states or transitions

## Files

### `index.ts`
Barrel export file. Exports `RoomContext`, `RoomStateFactory`, all state classes, and the `RoomState` interface type.

### `room-state.ts`
Core state management infrastructure.

**Key Components:**

- `RoomState` interface: Contract that all states implement with:
  - `name`: Identifier (AVAILABLE, RESERVED, OCCUPIED, CLEANING, MAINTENANCE)
  - `label`: Human-readable label in Turkish
  - Methods for each possible transition: `reserve()`, `checkIn()`, `checkOut()`, `completeCleaning()`, `startMaintenance()`, `completeMaintenance()`

- `RoomContext` class: The context that holds and manages the current state. Provides:
  - `getState()`: Returns the current state object
  - `getStatus()`: Returns the state name (string)
  - `getLabel()`: Returns the state label
  - Action methods: `reserve()`, `checkIn()`, `checkOut()`, `completeCleaning()`, `startMaintenance()`, `completeMaintenance()`
  - `getAvailableTransitions()`: Returns list of valid transitions from current state with action name, label, and target status

- `RoomStateFactory`: Creates state instances by status name. Acts as a factory for hydrating the state machine.

### states/ Directory

Each file implements a concrete state. Invalid transitions throw descriptive errors.

#### `available-state.ts`
Represents an available (unoccupied, not reserved) room.

**Valid transitions:**
- `reserve()` → `ReservedState`
- `startMaintenance()` → `MaintenanceState`

**Invalid transitions:** checkIn, checkOut, completeCleaning, completeMaintenance

#### `reserved-state.ts`
Represents a room with a future reservation.

**Valid transitions:**
- `checkIn()` → `OccupiedState`

**Invalid transitions:** reserve (cannot double-book), checkOut, completeCleaning, startMaintenance, completeMaintenance

#### `occupied-state.ts`
Represents a room currently occupied by a guest.

**Valid transitions:**
- `checkOut()` → `CleaningState`

**Invalid transitions:** reserve, checkIn (already occupied), completeCleaning, startMaintenance, completeMaintenance

#### `cleaning-state.ts`
Represents a room being cleaned after checkout.

**Valid transitions:**
- `completeCleaning()` → `AvailableState`
- `startMaintenance()` → `MaintenanceState` (cleaning can be interrupted for urgent maintenance)

**Invalid transitions:** reserve, checkIn, checkOut, completeMaintenance

#### `maintenance-state.ts`
Represents a room undergoing maintenance.

**Valid transitions:**
- `completeMaintenance()` → `AvailableState`

**Invalid transitions:** reserve, checkIn, checkOut, completeCleaning, startMaintenance (cannot restart maintenance)

## State Transition Diagram

```
┌──────────┐
│AVAILABLE │◄──────┐
└────┬─────┘       │
     │             │
     │reserve()    │completeCleaning()
     │             │
     ▼             │
┌──────────┐       │
│RESERVED  │       │
└────┬─────┘    ┌──┴──────┐
     │          │          │
     │checkIn() │       ┌──┴─────────┐
     │          │       │            │
     ▼          ▼    checkOut()      │
  ┌────────┐  ┌─────────┐      ┌─────┴────────┐
  │OCCUPIED│  │CLEANING │      │MAINTENANCE   │
  └────────┘  └────┬────┘      └──────────────┘
     ▲             │                   ▲
     │             │completeMaintenance│
     │             │                   │
     │             └───────────────────┘
     │        (startMaintenance from cleaning)
     │
     └──(completeMaintenance)
```

## Valid Transitions Summary

| From → To | Action | Valid |
|-----------|--------|-------|
| AVAILABLE → RESERVED | reserve() | ✓ |
| AVAILABLE → MAINTENANCE | startMaintenance() | ✓ |
| RESERVED → OCCUPIED | checkIn() | ✓ |
| OCCUPIED → CLEANING | checkOut() | ✓ |
| CLEANING → AVAILABLE | completeCleaning() | ✓ |
| CLEANING → MAINTENANCE | startMaintenance() | ✓ |
| MAINTENANCE → AVAILABLE | completeMaintenance() | ✓ |
| All other transitions | - | ✗ (error) |

## AI Agent Instructions

When working with the State pattern in this codebase:

1. **Understanding transitions**: Each state explicitly lists which transitions are valid by implementing them. Invalid transitions throw descriptive errors. This prevents invalid state sequences at the type/runtime level.

2. **Adding new states**: Create a new class in `states/` implementing `RoomState`. Update `RoomStateFactory.create()` to instantiate it, update `room-state.ts` action methods if needed, and update the transition diagram.

3. **Adding new transitions**: Add a method to the `RoomState` interface, implement it in all state classes (throw error for invalid transitions), add to `ACTION_LABELS` in `room-state.ts`, and add to `ALL_ACTIONS` array.

4. **Checking valid actions**: Use `RoomContext.getAvailableTransitions()` to get the list of valid actions from the current state. This is used in UI to show available buttons/actions to users.

5. **State hydration**: Use `RoomStateFactory.create(statusString)` to restore a room's state from storage. It maps string status names to state objects.

6. **Action labels**: The `ACTION_LABELS` map provides Turkish labels for each action, suitable for UI display.

7. **Circular dependencies**: State files use dynamic `require()` to import other states and avoid circular dependency issues. This is safe because states are only instantiated during transitions.

8. **Error messages**: All error messages are in Turkish for consistency with the Turkish-language UI. Update these if localization requirements change.

## State Pattern Benefits Here

- **Explicit contracts**: Each state clearly defines what it can transition to
- **No conditionals**: No giant switch/if statements in the context
- **Type safety**: Transitions are methods, caught at compile time in TypeScript
- **Single responsibility**: Each state class handles only its behavior
- **Easy to extend**: Adding states or transitions is localized to state files
- **Clear documentation**: The transition diagram emerges naturally from the code
