"use server";

import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session-token";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}
