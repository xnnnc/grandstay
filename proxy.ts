import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("session-token")?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't need auth
  const publicPaths = ["/login", "/api/auth"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // If not logged in and trying to access protected route
  if (!sessionToken && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login page
  if (sessionToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
