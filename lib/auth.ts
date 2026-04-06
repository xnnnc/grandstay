"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Get current user from session cookie
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session-token")?.value;

  if (!sessionToken) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionToken },
      include: { hotel: true },
    });

    if (!user || !user.isActive) {
      // Stale session — clear the cookie so middleware redirects to login
      cookieStore.delete("session-token");
      return null;
    }

    // Don't return password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch {
    return null;
  }
}

// Check if user has required role
export async function requireRole(allowedRoles: string[]) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!allowedRoles.includes(user.role)) return null;
  return user;
}
