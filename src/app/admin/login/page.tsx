// src/app/admin/login/page.tsx

"use client";

import { useState, FormEvent } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/AuthProvider";

const getAdminEmails = (): string[] => {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
};

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const adminEmails = getAdminEmails();

  // If logged in and admin → go to dashboard
  if (user && isAdmin) {
    router.push("/admin");
  }

  const verifyAdmin = async () => {
    const current = auth.currentUser;
    if (!current?.email) return;

    const email = current.email.toLowerCase();

    if (!adminEmails.includes(email)) {
      setError("Not an admin account.");
      await signOut(auth);
    } else {
      router.push("/admin");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      await verifyAdmin();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await verifyAdmin();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow space-y-4">
        <h1 className="text-xl font-semibold text-center">Admin Login</h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
          />

          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
          />

          <button
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 rounded text-sm disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Login as Admin"}
          </button>
        </form>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full border py-2 rounded text-sm disabled:opacity-60"
        >
          Continue with Google
        </button>

        <p className="text-xs text-center text-slate-500 mt-2">
          Only authorized admin accounts can log in.
        </p>
      </div>
    </main>
  );
}
