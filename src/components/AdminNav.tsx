// src/components/AdminNav.tsx

"use client";

import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="p-4 bg-white shadow flex gap-4">
      <Link href="/admin">Dashboard</Link>
      <Link href="/admin/story-time">Story Time</Link>
      <Link href="/admin/social-fun">Social Fun</Link>
    </nav>
  );
}
