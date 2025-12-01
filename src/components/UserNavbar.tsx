// src/components/UserNavbar.tsx

"use client";

import { useAuth } from "@/app/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserNavbar() {
  const router = useRouter();
  const { user } = useAuth();
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login"); // 👈 redirect user to login screen
  };

  return (
    <header className="w-full px-6 py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200/60">
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
          <button className="p-2 bg-white rounded-full shadow-lg shadow-purple-200/60 hover:opacity-90 transition">
            <Settings className="w-6 h-6 text-purple-600" />
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-purple-700 hover:text-purple-800 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
