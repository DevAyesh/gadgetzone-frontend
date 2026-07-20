import { type NextRequest, NextResponse } from "next/server";

// Middleware proxy — Supabase removed, JWT auth handled by backend
// TODO: Add JWT token validation here if needed for protected routes
export async function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
