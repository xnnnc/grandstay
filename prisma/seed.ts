import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seed başlatılıyor...");

  // Clear all tables in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.housekeepingTask.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hotel.deleteMany();

  console.log("Tablolar temizlendi.");

  // ─── Hotels ─────────────────────────────────────────────────────────────────
  const istanbul = await prisma.hotel.create({
    data: {
      name: "GrandStay Istanbul Merkez",
      address: "İstiklal Caddesi No:1, Beyoğlu",
      city: "İstanbul",
      phone: "+902121234567",
      stars: 5,
      isActive: true,
    },
  });

  console.log("Otel oluşturuldu.");

  // ─── Users ───────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@grandstay.com",
      password: passwordHash,
      name: "Ahmet Yılmaz",
      role: "ADMIN",
      hotelId: istanbul.id,
      isActive: true,
    },
  });

  const receptionIstanbul = await prisma.user.create({
    data: {
      email: "reception@istanbul.com",
      password: passwordHash,
      name: "Ayşe Kaya",
      role: "RECEPTIONIST",
      hotelId: istanbul.id,
      isActive: true,
    },
  });

  const housekeepIstanbul = await prisma.user.create({
    data: {
      email: "housekeep@istanbul.com",
      password: passwordHash,
      name: "Fatma Demir",
      role: "HOUSEKEEPING",
      hotelId: istanbul.id,
      isActive: true,
    },
  });

  const conciergeIstanbul = await prisma.user.create({
    data: {
      email: "concierge@istanbul.com",
      password: passwordHash,
      name: "Mehmet Öz",
      role: "CONCIERGE",
      hotelId: istanbul.id,
      isActive: true,
    },
  });

  const managerIstanbul = await prisma.user.create({
    data: {
      email: "manager@istanbul.com",
      password: passwordHash,
      name: "Zeynep Aydın",
      role: "MANAGER",
      hotelId: istanbul.id,
      isActive: true,
    },
  });

  console.log("Kullanıcılar oluşturuldu.");

  // ─── Rooms – Istanbul ────────────────────────────────────────────────────────
  const iRoom101 = await prisma.room.create({
    data: { number: "101", floor: 1, type: "SINGLE",  capacity: 2, pricePerNight: 800,  status: "AVAILABLE",    hotelId: istanbul.id },
  });
  const iRoom102 = await prisma.room.create({
    data: { number: "102", floor: 1, type: "SINGLE",  capacity: 2, pricePerNight: 800,  status: "AVAILABLE",    hotelId: istanbul.id },
  });
  const iRoom103 = await prisma.room.create({
    data: { number: "103", floor: 1, type: "DOUBLE",  capacity: 3, pricePerNight: 1200, status: "OCCUPIED",     hotelId: istanbul.id },
  });
  const iRoom201 = await prisma.room.create({
    data: { number: "201", floor: 2, type: "DOUBLE",  capacity: 3, pricePerNight: 1200, status: "AVAILABLE",    hotelId: istanbul.id },
  });
  const iRoom202 = await prisma.room.create({
    data: { number: "202", floor: 2, type: "DOUBLE",  capacity: 3, pricePerNight: 1200, status: "RESERVED",     hotelId: istanbul.id },
  });
  const iRoom203 = await prisma.room.create({
    data: { number: "203", floor: 2, type: "SUITE",   capacity: 4, pricePerNight: 2500, status: "AVAILABLE",    hotelId: istanbul.id },
  });
  const iRoom301 = await prisma.room.create({
    data: { number: "301", floor: 3, type: "SUITE",   capacity: 4, pricePerNight: 2500, status: "OCCUPIED",     hotelId: istanbul.id },
  });
  const iRoom302 = await prisma.room.create({
    data: { number: "302", floor: 3, type: "DELUXE",  capacity: 2, pricePerNight: 3000, status: "AVAILABLE",    hotelId: istanbul.id },
  });
  const iRoom303 = await prisma.room.create({
    data: { number: "303", floor: 3, type: "DELUXE",  capacity: 3, pricePerNight: 3000, status: "CLEANING",     hotelId: istanbul.id },
  });
  const iRoom401 = await prisma.room.create({
    data: { number: "401", floor: 4, type: "FAMILY",  capacity: 5, pricePerNight: 2000, status: "AVAILABLE",    hotelId: istanbul.id },
  });
  const iRoom402 = await prisma.room.create({
    data: { number: "402", floor: 4, type: "FAMILY",  capacity: 6, pricePerNight: 2200, status: "MAINTENANCE",  hotelId: istanbul.id },
  });
  const iRoom403 = await prisma.room.create({
    data: { number: "403", floor: 4, type: "SINGLE",  capacity: 1, pricePerNight: 750,  status: "AVAILABLE",    hotelId: istanbul.id },
  });
  const iRoom501 = await prisma.room.create({
    data: { number: "501", floor: 5, type: "SUITE",   capacity: 4, pricePerNight: 3500, status: "AVAILABLE",    hotelId: istanbul.id, amenities: JSON.stringify(["Penthouse Suite"]) },
  });
  const iRoom502 = await prisma.room.create({
    data: { number: "502", floor: 5, type: "DELUXE",  capacity: 3, pricePerNight: 2800, status: "AVAILABLE",    hotelId: istanbul.id },
  });
  const iRoom503 = await prisma.room.create({
    data: { number: "503", floor: 5, type: "DOUBLE",  capacity: 3, pricePerNight: 1400, status: "RESERVED",     hotelId: istanbul.id },
  });

  console.log("Odalar oluşturuldu.");

  // ─── Guests ──────────────────────────────────────────────────────────────────
  const kemal = await prisma.guest.create({
    data: { firstName: "Burak",  lastName: "Korkmaz",   email: "burak.k@email.com",   phone: "05551234567",  idNumber: "11111111111", nationality: "TR" },
  });
  const nazim = await prisma.guest.create({
    data: { firstName: "Deniz",  lastName: "Arslan",    email: "deniz.a@email.com",   phone: "05559876543",  idNumber: "22222222222", nationality: "TR" },
  });
  const orhan = await prisma.guest.create({
    data: { firstName: "Murat",  lastName: "Çetin",     email: "murat.c@email.com",   phone: "05553456789",  idNumber: "33333333333", nationality: "TR" },
  });
  const elif = await prisma.guest.create({
    data: { firstName: "Elif",   lastName: "Güneş",     email: "elif.g@email.com",    phone: "05557654321",  idNumber: "44444444444", nationality: "TR" },
  });
  const john = await prisma.guest.create({
    data: { firstName: "James",  lastName: "Carter",    email: "james.c@email.com",   phone: "+441234567890", idNumber: "AA123456",  nationality: "GB" },
  });
  const hans = await prisma.guest.create({
    data: { firstName: "Stefan", lastName: "Weber",     email: "stefan.w@email.com",  phone: "+491234567890", idNumber: "DE987654",  nationality: "DE" },
  });
  const ayse = await prisma.guest.create({
    data: { firstName: "Ceren",  lastName: "Balcı",     email: "ceren.b@email.com",   phone: "05552345678",  idNumber: "55555555555", nationality: "TR" },
  });
  const yasar = await prisma.guest.create({
    data: { firstName: "Tolga",  lastName: "Erdoğan",   email: "tolga.e@email.com",   phone: "05558765432",  idNumber: "66666666666", nationality: "TR" },
  });

  const marie = await prisma.guest.create({
    data: { firstName: "Claire", lastName: "Martin",    email: "claire.m@email.com",  phone: "+33612345678", idNumber: "FR123456",  nationality: "FR" },
  });
  const luca = await prisma.guest.create({
    data: { firstName: "Marco",  lastName: "Bianchi",   email: "marco.b@email.com",   phone: "+39312345678", idNumber: "IT654321",  nationality: "IT" },
  });
  const fatih = await prisma.guest.create({
    data: { firstName: "Emre",   lastName: "Koç",       email: "emre.k@email.com",    phone: "05341112233",  idNumber: "77777777777", nationality: "TR" },
  });
  const selin = await prisma.guest.create({
    data: { firstName: "Selin",  lastName: "Yıldız",    email: "selin.y@email.com",   phone: "05422334455",  idNumber: "88888888888", nationality: "TR" },
  });
  const akira = await prisma.guest.create({
    data: { firstName: "Yuki",   lastName: "Nakamura",  email: "yuki.n@email.com",    phone: "+81901234567", idNumber: "JP789012",  nationality: "JP" },
  });
  const emma = await prisma.guest.create({
    data: { firstName: "Sarah",  lastName: "Williams",  email: "sarah.w@email.com",   phone: "+12125551234", idNumber: "US345678",  nationality: "US" },
  });

  console.log("Misafirler oluşturuldu.");

  // ─── Reservations ────────────────────────────────────────────────────────────
  const now = new Date();
  const day = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  // 1. Kemal @ Istanbul 103 - CHECKED_IN - 3 days ago → tomorrow
  const res1 = await prisma.reservation.create({
    data: { guestId: kemal.id, roomId: iRoom103.id, hotelId: istanbul.id, checkIn: day(-3), checkOut: day(1),  status: "CHECKED_IN",  totalPrice: 4800,  currency: "TRY" },
  });

  // 2. Orhan @ Istanbul 301 - CHECKED_IN - yesterday → 3 days from now
  const res2 = await prisma.reservation.create({
    data: { guestId: orhan.id, roomId: iRoom301.id, hotelId: istanbul.id, checkIn: day(-1), checkOut: day(3),  status: "CHECKED_IN",  totalPrice: 10000, currency: "TRY" },
  });

  // 3. Elif @ Istanbul 202 - CONFIRMED - tomorrow → 4 days from now
  const res3 = await prisma.reservation.create({
    data: { guestId: elif.id,  roomId: iRoom202.id, hotelId: istanbul.id, checkIn: day(1),  checkOut: day(4),  status: "CONFIRMED",   totalPrice: 3600,  currency: "TRY" },
  });

  // 4. John @ Istanbul 503 - RESERVED - 5 days from now → 8 days from now
  const res4 = await prisma.reservation.create({
    data: { guestId: john.id,  roomId: iRoom503.id, hotelId: istanbul.id, checkIn: day(5),  checkOut: day(8),  status: "RESERVED",    totalPrice: 4200,  currency: "TRY" },
  });

  // 5. Hans @ Istanbul 201 - CHECKED_IN - 2 days ago → tomorrow
  const res5 = await prisma.reservation.create({
    data: { guestId: hans.id,  roomId: iRoom201.id, hotelId: istanbul.id, checkIn: day(-2), checkOut: day(1),  status: "CHECKED_IN",  totalPrice: 2700,  currency: "TRY" },
  });

  // 6. Ayşe @ Istanbul 303 - CHECKED_OUT - 5 days ago → 2 days ago
  const res6 = await prisma.reservation.create({
    data: { guestId: ayse.id,  roomId: iRoom303.id, hotelId: istanbul.id, checkIn: day(-5), checkOut: day(-2), status: "CHECKED_OUT", totalPrice: 9000,  currency: "TRY" },
  });

  // 7. Nazım @ Istanbul 401 - CONFIRMED - 3 days from now → 7 days from now
  const res7 = await prisma.reservation.create({
    data: { guestId: nazim.id, roomId: iRoom401.id, hotelId: istanbul.id, checkIn: day(3),  checkOut: day(7),  status: "CONFIRMED",   totalPrice: 6000,  currency: "TRY" },
  });

  // 8. Yaşar @ Istanbul 103 - CANCELLED - 10 days from now → 12 days from now
  const res8 = await prisma.reservation.create({
    data: { guestId: yasar.id, roomId: iRoom103.id, hotelId: istanbul.id, checkIn: day(10), checkOut: day(12), status: "CANCELLED",   totalPrice: 2400,  currency: "TRY" },
  });

  // 9. Kemal @ Istanbul 403 - PENDING - 7 days from now → 10 days from now
  const res9 = await prisma.reservation.create({
    data: { guestId: kemal.id, roomId: iRoom403.id, hotelId: istanbul.id, checkIn: day(7),  checkOut: day(10), status: "PENDING",     totalPrice: 2700,  currency: "TRY" },
  });

  // 10. Elif @ Istanbul 501 - CONFIRMED - 2 days from now → 5 days from now
  const res10 = await prisma.reservation.create({
    data: { guestId: elif.id,  roomId: iRoom501.id, hotelId: istanbul.id, checkIn: day(2),  checkOut: day(5),  status: "CONFIRMED",   totalPrice: 5400,  currency: "TRY" },
  });

  // 11. Marie @ Istanbul 302 - CHECKED_IN - today → 4 days from now
  const res11 = await prisma.reservation.create({
    data: { guestId: marie.id, roomId: iRoom302.id, hotelId: istanbul.id, checkIn: day(0),  checkOut: day(4),  status: "CHECKED_IN",  totalPrice: 12000, currency: "TRY" },
  });

  // 12. Luca @ Istanbul 203 - CONFIRMED - 2 days from now → 6 days from now
  const res12 = await prisma.reservation.create({
    data: { guestId: luca.id,  roomId: iRoom203.id, hotelId: istanbul.id, checkIn: day(2),  checkOut: day(6),  status: "CONFIRMED",   totalPrice: 10000, currency: "TRY" },
  });

  // 13. Fatih @ Istanbul 102 - CHECKED_OUT - 7 days ago → 3 days ago
  const res13 = await prisma.reservation.create({
    data: { guestId: fatih.id, roomId: iRoom102.id, hotelId: istanbul.id, checkIn: day(-7), checkOut: day(-3), status: "CHECKED_OUT", totalPrice: 3200,  currency: "TRY" },
  });

  // 14. Selin @ Istanbul 101 - CHECKED_OUT - 10 days ago → 6 days ago
  const res14 = await prisma.reservation.create({
    data: { guestId: selin.id, roomId: iRoom101.id, hotelId: istanbul.id, checkIn: day(-10), checkOut: day(-6), status: "CHECKED_OUT", totalPrice: 3200,  currency: "TRY" },
  });

  // 15. Akira @ Istanbul 502 - RESERVED - 8 days from now → 14 days from now
  const res15 = await prisma.reservation.create({
    data: { guestId: akira.id, roomId: iRoom502.id, hotelId: istanbul.id, checkIn: day(8),  checkOut: day(14), status: "RESERVED",    totalPrice: 16800, currency: "TRY" },
  });

  // 16. Emma @ Istanbul 201 - PENDING - 12 days from now → 15 days from now
  const res16 = await prisma.reservation.create({
    data: { guestId: emma.id,  roomId: iRoom201.id, hotelId: istanbul.id, checkIn: day(12), checkOut: day(15), status: "PENDING",     totalPrice: 3600,  currency: "TRY" },
  });

  // 17. Fatih @ Istanbul 301 - CONFIRMED - 6 days from now → 9 days from now
  const res17 = await prisma.reservation.create({
    data: { guestId: fatih.id, roomId: iRoom301.id, hotelId: istanbul.id, checkIn: day(6),  checkOut: day(9),  status: "CONFIRMED",   totalPrice: 7500,  currency: "TRY" },
  });

  // 18. Hans @ Istanbul 403 - CHECKED_OUT - 14 days ago → 10 days ago
  const res18 = await prisma.reservation.create({
    data: { guestId: hans.id,  roomId: iRoom403.id, hotelId: istanbul.id, checkIn: day(-14), checkOut: day(-10), status: "CHECKED_OUT", totalPrice: 3000,  currency: "TRY" },
  });

  console.log("Rezervasyonlar oluşturuldu.");

  // ─── Invoices ───────────────────────────────────────────────────────────────
  await prisma.invoice.create({
    data: {
      reservationId: res6.id,
      items: JSON.stringify([
        { description: "Konaklama (3 gece x ₺3,000)", amount: 9000 },
        { description: "Minibar", amount: 450 },
      ]),
      subtotal: 9450, tax: 1701, total: 11151, currency: "TRY",
      paymentMethod: "CREDIT_CARD", paidAt: day(-2),
    },
  });
  await prisma.invoice.create({
    data: {
      reservationId: res13.id,
      items: JSON.stringify([
        { description: "Konaklama (4 gece x ₺800)", amount: 3200 },
      ]),
      subtotal: 3200, tax: 576, total: 3776, currency: "TRY",
      paymentMethod: "CASH", paidAt: day(-3),
    },
  });
  await prisma.invoice.create({
    data: {
      reservationId: res14.id,
      items: JSON.stringify([
        { description: "Konaklama (4 gece x ₺800)", amount: 3200 },
        { description: "Oda Servisi", amount: 350 },
        { description: "Çamaşırhane", amount: 200 },
      ]),
      subtotal: 3750, tax: 675, total: 4425, currency: "TRY",
      paymentMethod: "CREDIT_CARD", paidAt: day(-6),
    },
  });
  await prisma.invoice.create({
    data: {
      reservationId: res18.id,
      items: JSON.stringify([
        { description: "Konaklama (4 gece x ₺750)", amount: 3000 },
        { description: "Minibar", amount: 280 },
      ]),
      subtotal: 3280, tax: 590.4, total: 3870.4, currency: "TRY",
      paymentMethod: "BANK_TRANSFER", paidAt: day(-10),
    },
  });

  console.log("Faturalar oluşturuldu.");

  // ─── Housekeeping Tasks ──────────────────────────────────────────────────────
  await prisma.housekeepingTask.create({
    data: { roomId: iRoom303.id, assignedToId: housekeepIstanbul.id, type: "CLEANING",     status: "PENDING",      priority: "HIGH",   notes: "Ceren Balcı checkout sonrası temizlik" },
  });
  await prisma.housekeepingTask.create({
    data: { roomId: iRoom402.id, assignedToId: housekeepIstanbul.id, type: "MAINTENANCE",  status: "IN_PROGRESS",  priority: "URGENT", notes: "Acil bakım gerekiyor" },
  });
  await prisma.housekeepingTask.create({
    data: { roomId: iRoom101.id, assignedToId: null,                  type: "CLEANING",     status: "PENDING",      priority: "NORMAL", notes: "Standart oda temizliği" },
  });
  await prisma.housekeepingTask.create({
    data: { roomId: iRoom502.id, assignedToId: null,                  type: "MAINTENANCE",  status: "IN_PROGRESS",  priority: "HIGH",   notes: "Bakım devam ediyor" },
  });

  console.log("Temizlik görevleri oluşturuldu.");

  // ─── Service Requests ────────────────────────────────────────────────────────
  await prisma.serviceRequest.create({
    data: { guestId: kemal.id, hotelId: istanbul.id, type: "ROOM_SERVICE", description: "Oda servisi: Türk kahvaltısı", status: "PENDING",     priority: "NORMAL", assignedToId: conciergeIstanbul.id },
  });
  await prisma.serviceRequest.create({
    data: { guestId: orhan.id, hotelId: istanbul.id, type: "LAUNDRY",      description: "Kuru temizleme: 3 gömlek",     status: "IN_PROGRESS", priority: "NORMAL", assignedToId: conciergeIstanbul.id },
  });
  await prisma.serviceRequest.create({
    data: { guestId: hans.id,  hotelId: istanbul.id, type: "TRANSFER",     description: "Havalimanı transferi: IST → Otel", status: "COMPLETED", priority: "NORMAL", assignedToId: receptionIstanbul.id, completedAt: new Date() },
  });

  await prisma.serviceRequest.create({
    data: { guestId: marie.id, hotelId: istanbul.id, type: "ROOM_SERVICE", description: "Oda servisi: Akşam yemeği (2 kişilik)", status: "PENDING", priority: "HIGH", assignedToId: conciergeIstanbul.id },
  });
  await prisma.serviceRequest.create({
    data: { guestId: orhan.id, hotelId: istanbul.id, type: "SPA",          description: "Masaj randevusu: 16:00",              status: "COMPLETED", priority: "NORMAL", assignedToId: conciergeIstanbul.id, completedAt: day(-1) },
  });
  await prisma.serviceRequest.create({
    data: { guestId: kemal.id, hotelId: istanbul.id, type: "TRANSFER",     description: "Havalimanı transferi: Otel → IST",    status: "PENDING",   priority: "HIGH",   assignedToId: receptionIstanbul.id },
  });

  console.log("Servis talepleri oluşturuldu.");

  // ─── Notifications ─────────────────────────────────────────────────────────
  await prisma.notification.create({
    data: { userId: admin.id, title: "Yeni Rezervasyon", message: "Claire Martin yeni bir rezervasyon oluşturdu.", type: "RESERVATION", isRead: false },
  });
  await prisma.notification.create({
    data: { userId: admin.id, title: "Check-out Tamamlandı", message: "Emre Koç check-out yaptı. Fatura oluşturuldu.", type: "BILLING", isRead: true },
  });
  await prisma.notification.create({
    data: { userId: receptionIstanbul.id, title: "Bekleyen Transfer", message: "Burak Korkmaz için havalimanı transferi bekliyor.", type: "SERVICE", isRead: false },
  });
  await prisma.notification.create({
    data: { userId: housekeepIstanbul.id, title: "Yeni Temizlik Görevi", message: "Oda 101 için temizlik görevi atandı.", type: "HOUSEKEEPING", isRead: false },
  });
  await prisma.notification.create({
    data: { userId: admin.id, title: "Bakım Uyarısı", message: "Oda 502 bakım süreci devam ediyor.", type: "HOUSEKEEPING", isRead: false },
  });

  console.log("Bildirimler oluşturuldu.");

  console.log("\nSeed tamamlandı!");
  console.log(`  Otel:               1`);
  console.log(`  Kullanıcılar:       5`);
  console.log(`  Odalar:             15`);
  console.log(`  Misafirler:         14`);
  console.log(`  Rezervasyonlar:     18`);
  console.log(`  Faturalar:          4`);
  console.log(`  Temizlik görevleri: 4`);
  console.log(`  Servis talepleri:   6`);
  console.log(`  Bildirimler:        5`);
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
