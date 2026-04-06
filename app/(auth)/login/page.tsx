"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import type { LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Buildings, CircleNotch, WarningCircle } from "@phosphor-icons/react";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-background to-teal-100 dark:from-teal-950/40 dark:via-background dark:to-teal-900/30 p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-teal-200/30 dark:bg-teal-800/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-300/20 dark:bg-teal-700/15 blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md shadow-2xl border border-border/50 bg-card/95 backdrop-blur-sm rounded-2xl">
        <CardHeader className="text-center pb-2 pt-8 px-8">
          {/* Logo area */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-600 dark:bg-teal-500 shadow-lg shadow-teal-600/30 dark:shadow-teal-500/20">
              <Buildings size={32} weight="fill" className="text-white" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
            GrandStay Hotel Management
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Sisteme giriş yapın
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8 pt-6">
          <form action={formAction} className="space-y-5">
            {/* Error message */}
            {state.error && (
              <div className="flex items-center gap-2.5 rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                <WarningCircle size={18} weight="fill" className="shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground font-medium text-sm">
                Email Adresi
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ornek@grandstay.com"
                autoComplete="email"
                disabled={isPending}
                required
                className="h-11 rounded-xl border-border bg-muted/50 focus:bg-background focus:border-teal-500 focus:ring-teal-500/20 transition-colors"
              />
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground font-medium text-sm">
                Şifre
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isPending}
                required
                className="h-11 rounded-xl border-border bg-muted/50 focus:bg-background focus:border-teal-500 focus:ring-teal-500/20 transition-colors"
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-600 dark:active:bg-teal-700 text-white font-semibold shadow-md shadow-teal-600/25 dark:shadow-teal-500/20 transition-all mt-2"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <CircleNotch size={18} className="animate-spin" />
                  Giriş yapılıyor...
                </span>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            GrandStay &copy; {new Date().getFullYear()} — Tüm hakları saklıdır.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
