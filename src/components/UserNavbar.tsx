// src/components/UserNavbar.tsx

"use client";

import { useAuth } from "@/app/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Home, LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function UserNavbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login"); // 👈 redirect user to login screen
  };

  return (
    <header className="w-full px-8 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-200/60 shrink-0">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div className="text-sm">
            <p className="text-slate-600">Welcome back!</p>
            <p className="font-semibold text-slate-800">
              {user?.displayName || user?.email}
            </p>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 bg-white rounded-full shadow-lg shadow-purple-200/60 hover:opacity-90 transition"
            aria-label="User menu"
          >
            <Settings className="w-6 h-6 text-purple-600" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-lg text-sm overflow-hidden">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 text-slate-800 transition"
                onClick={() => setMenuOpen(false)}
              >
                <User className="w-4 h-4 text-slate-500" />
                Profile
              </Link>
              <Link
                href="/bookings"
                className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 text-slate-800 transition"
                onClick={() => setMenuOpen(false)}
              >
                <User className="w-4 h-4 text-slate-500" />
                My bookings
              </Link>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await handleLogout();
                }}
                className="flex w-full items-center gap-2 px-4 py-3 hover:bg-rose-50 active:bg-rose-100 text-rose-600 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
