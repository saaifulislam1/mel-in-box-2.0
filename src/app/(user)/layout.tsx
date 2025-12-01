// src/app/(user)/layout.tsx

"use client";

import useUserGuard from "@/hooks/useUserGuard";
import UserNavbar from "@/components/UserNavbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useUserGuard();

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-x-0 top-0 z-50 bg-transparent">
        <UserNavbar />
      </div>
      {children}
    </div>
  );
}
