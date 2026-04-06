# GrandStay — Otel Yönetim Sistemi

Web tabanlı, tam yığın otel yönetim uygulaması. Oda yönetimi, rezervasyon, check-in/check-out, faturalandırma, kat hizmetleri, concierge ve raporlama işlevlerini tek platformda sunar.

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Dil | TypeScript |
| Veritabanı | SQLite (`dev.db`) |
| ORM | Prisma 7 + better-sqlite3 |
| İkonlar | Phosphor Icons |
| Grafikler | Recharts |
| Kimlik Doğrulama | Cookie tabanlı session + bcryptjs |

## Kurulum

```bash
# 1. Bağımlılıkları kur
npm install

# 2. Ortam değişkenlerini tanımla
cp .env.example .env
# DATABASE_URL ve SESSION_SECRET değerlerini doldur

# 3. Prisma istemcisini üret
npx prisma generate

# 4. Veritabanını oluştur
npx prisma db push

# 5. Örnek verileri yükle
npx prisma db seed

# 6. Geliştirme sunucusunu başlat
npm run dev
```

Uygulama varsayılan olarak [http://localhost:3000](http://localhost:3000) adresinde çalışır.

## Kullanıcı Rolleri

| Rol | Yetkiler |
|---|---|
| `ADMIN` | Tüm modüller, otel ve personel yönetimi |
| `MANAGER` | Oda, rezervasyon, raporlar, kat hizmetleri |
| `RECEPTIONIST` | Misafir, rezervasyon, check-in/out, fatura |
| `HOUSEKEEPING` | Kat hizmetleri görevleri |
| `CONCIERGE` | Misafir hizmet talepleri |

## Proje Yapısı

```
├── app/              # Next.js App Router sayfaları ve layout'lar
├── actions/          # Sunucu taraflı veri işlemleri (Server Actions)
├── components/       # React bileşenleri (özellik bazlı)
│   └── ui/           # shadcn/ui temel bileşenleri
├── lib/              # Yardımcı araçlar, DB istemcisi, auth
├── patterns/
│   ├── state/        # State Pattern — oda durum yönetimi
│   └── adapter/      # Adapter Pattern — para birimi dönüşümü
├── prisma/
│   ├── schema.prisma # Veri modeli
│   └── seed.ts       # Örnek veri yükleme betiği
├── types/            # TypeScript tip tanımları
└── hooks/            # Özel React hook'ları
```

## Geliştirme Komutları

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Üretim derlemesi
npm run lint         # ESLint denetimi
npx tsc --noEmit     # Tip kontrolü
npx prisma studio    # Veritabanı görsel arayüzü
npx prisma db push   # Şema değişikliğini uygula
```
