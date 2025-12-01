// src/middleware.ts

import { NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

export function middleware() {
  // We handle admin protection client-side using useAdminGuard().
  // Server-side protection will come later once we add server auth checks.
  return NextResponse.next();
}
