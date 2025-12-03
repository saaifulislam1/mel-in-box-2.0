// src/components/UserNavbar.tsx

"use client";

import { useAuth } from "@/app/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { MoreVertical, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserNavbar() {
  const router = useRouter();
  const { user } = useAuth();
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login"); // 👈 redirect user to login screen
  };

  return (
    <header className="w-full px-3 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-6 ">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200/60 shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="text-sm">
            <p className="text-slate-600">Welcome back!</p>
            <p className="font-semibold text-slate-800">
              {user?.displayName || user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/bookings"
            className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition"
          >
            My bookings
          </Link>
          <Link
            href="/social"
            className="px-4 py-2 rounded-full bg-slate-100 text-slate-800 text-sm font-semibold shadow hover:-translate-y-0.5 transition inline-flex items-center gap-2"
          >
            <MoreVertical className="w-4 h-4" />
            Social
          </Link>
          <button className="p-2 bg-white rounded-full shadow-lg shadow-purple-200/60 hover:opacity-90 transition">
            <Settings className="w-6 h-6 text-purple-600" />
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold not-only:bg-pink-800 px-4 cursor-pointer py-2 rounded text-white transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
