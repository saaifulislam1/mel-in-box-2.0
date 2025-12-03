// src/app/admin/login/page.tsx

"use client";

import { useState, FormEvent, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/AuthProvider";
import { Lock, LogIn, Shield, Sparkles } from "lucide-react";
import { Spinner } from "@/components/Spinner";

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

  useEffect(() => {
    if (user && isAdmin) {
      router.replace("/admin");
    }
  }, [user, isAdmin, router]);

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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.2),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.18),transparent_30%)] pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2 text-slate-200">
            <Shield className="w-5 h-5 text-emerald-300" />
            <span className="text-sm">Admin Access</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-slate-200 text-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Secure Control Center
            </div>
            <h1 className="text-3xl font-semibold">
              Welcome back, Admin. <br />
              Sign in to manage content.
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Only approved admin emails can access this dashboard. Use your
              credentials to upload gallery photos and story-time videos.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="w-4 h-4" />
              Protected route with Firebase Auth
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl p-6 space-y-4">
            {error && (
              <div className="bg-rose-500/10 text-rose-200 border border-rose-500/40 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-200">Admin email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-200">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>

              <button
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 text-white font-semibold py-2.5 shadow hover:-translate-y-0.5 transition disabled:opacity-70"
              >
                {loading ? (
                  <Spinner label="Signing in..." className="text-white" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Login as Admin
                  </>
                )}
              </button>
            </form>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 text-white font-semibold py-2.5 shadow hover:-translate-y-0.5 transition disabled:opacity-70"
            >
              Continue with Google
            </button>

            <p className="text-xs text-center text-slate-400">
              Only authorized admin accounts can log in. Others will be signed
              out automatically.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
