// Role types
export type UserRole = "ADMIN" | "RECEPTIONIST" | "HOUSEKEEPING" | "CONCIERGE" | "MANAGER";

// Room types
export type RoomType = "SINGLE" | "DOUBLE" | "SUITE" | "DELUXE" | "FAMILY";
export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "CLEANING" | "MAINTENANCE" | "RESERVED";

// Reservation status
export type ReservationStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";

// Housekeeping types
export type HousekeepingTaskType = "CLEANING" | "MAINTENANCE" | "INSPECTION";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

// Service request types
export type ServiceRequestType = "ROOM_SERVICE" | "TRANSFER" | "TOUR" | "LAUNDRY" | "OTHER";

// Invoice
export type PaymentMethod = "CASH" | "CREDIT_CARD" | "BANK_TRANSFER";
export type Currency = "TRY" | "USD" | "EUR";

// Invoice item
export interface InvoiceItem {
  description: string;
  amount: number;
}
