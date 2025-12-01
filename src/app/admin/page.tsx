// src/app/admin/page.tsx

"use client";

import { useAuth } from "@/app/AuthProvider";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminDashboard() {
  useAdminGuard(); // protect the page
  const { user } = useAuth();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

      <p className="mb-4">
        Logged in as: <strong>{user?.email}</strong>
      </p>

      <button
        onClick={() => signOut(auth)}
        className="px-3 py-2 bg-red-600 text-white rounded"
      >
        Sign Out
      </button>

      <div className="mt-6 space-y-4">
        <a
          className="block bg-white p-4 shadow rounded"
          href="/admin/story-time"
        >
          Manage Story Time Videos →
        </a>

        <a
          className="block bg-white p-4 shadow rounded"
          href="/admin/social-fun"
        >
          Moderate Social Fun Posts →
        </a>
      </div>
    </main>
  );
}
