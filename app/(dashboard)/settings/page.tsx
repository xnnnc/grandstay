"use client";

import { useTransition } from "react";
import { useTheme } from "next-themes";
import { logoutAction } from "@/actions/auth";
import {
  User,
  EnvelopeSimple,
  Shield,
  Buildings,
  Moon,
  Sun,
  Monitor,
  Globe,
  SignOut,
  Key,
  Palette,
  Info,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Theme = "light" | "dark" | "system";

const mockUser = {
  name: "Admin User",
  email: "admin@grandstay.com",
  role: "ADMIN",
  hotel: "GrandStay Istanbul Merkez",
  initials: "AU",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Yönetici",
  MANAGER: "Müdür",
  RECEPTIONIST: "Resepsiyonist",
  HOUSEKEEPING: "Kat Görevlisi",
  CONCIERGE: "Konsiyerj",
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isLoggingOut, startLogout] = useTransition();

  const handleLogout = () => {
    startLogout(async () => {
      await logoutAction();
    });
  };

  const handleThemeChange = (e: React.MouseEvent, newTheme: Theme) => {
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }
    const x = e.clientX;
    const y = e.clientY;
    document.documentElement.style.setProperty("--click-x", `${x}px`);
    document.documentElement.style.setProperty("--click-y", `${y}px`);
    document.startViewTransition(() => {
      setTheme(newTheme);
    });
  };

  const themeOptions: { value: Theme; label: string; description: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Açık", description: "Aydınlık tema", icon: <Sun size={20} weight="duotone" /> },
    { value: "dark", label: "Koyu", description: "Karanlık tema", icon: <Moon size={20} weight="duotone" /> },
    { value: "system", label: "Sistem", description: "Cihaz ayarına göre", icon: <Monitor size={20} weight="duotone" /> },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Hesap bilgilerinizi ve uygulama tercihlerinizi yönetin.
        </p>
      </div>

      {/* Profile Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <User size={16} />
          <span>Profil</span>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-primary">{mockUser.initials}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-base">{mockUser.name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary">
                    {ROLE_LABELS[mockUser.role] ?? mockUser.role}
                  </span>
                </div>

                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <EnvelopeSimple size={14} className="shrink-0" />
                    <span>{mockUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Buildings size={14} className="shrink-0" />
                    <span>{mockUser.hotel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield size={14} className="shrink-0" />
                    <span>{ROLE_LABELS[mockUser.role] ?? mockUser.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Appearance Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Palette size={16} />
          <span>Görünüm</span>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tema</CardTitle>
            <CardDescription>Uygulama görünümünü tercihlerinize göre ayarlayın.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((opt) => {
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={(e) => handleThemeChange(e, opt.value)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm transition-all ${
                      isActive
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {opt.icon}
                    </div>
                    <span className={`font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{opt.description}</span>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dil</CardTitle>
            <CardDescription>Uygulama dili tercihinizi seçin.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Globe size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Türkçe</p>
                  <p className="text-xs text-muted-foreground">Varsayılan dil</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                Tek dil
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Account Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Shield size={16} />
          <span>Hesap</span>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left group">
              <Key size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              <div className="flex-1">
                <p className="text-sm font-medium">Şifre Değiştir</p>
                <p className="text-xs text-muted-foreground">Hesap güvenliğinizi güncelleyin</p>
              </div>
            </button>

            <Separator />

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors text-left group disabled:opacity-50"
            >
              <SignOut size={18} className="text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  {isLoggingOut ? "Çıkış yapılıyor..." : "Oturumu Kapat"}
                </p>
                <p className="text-xs text-muted-foreground">Tüm cihazlardan çıkış yapın</p>
              </div>
            </button>
          </CardContent>
        </Card>
      </section>

      {/* Info Footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pb-4">
        <Info size={14} />
        <span>GrandStay Hotel Management v1.0</span>
      </div>
    </div>
  );
}
