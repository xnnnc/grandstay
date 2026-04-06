"use server";

import prisma from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export interface LoginState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email ve şifre gereklidir." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      return { error: "Geçersiz email veya şifre." };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { error: "Geçersiz email veya şifre." };
    }

    await createSession(user.id);
  } catch {
    return { error: "Giriş sırasında bir hata oluştu." };
  }

  redirect("/");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
