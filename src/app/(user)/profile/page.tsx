// src/app/(user)/profile/page.tsx

"use client";

import { useAuth } from "@/app/AuthProvider";
import useUserGuard from "@/hooks/useUserGuard";
import Link from "next/link";
import { CalendarClock, Mail, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import { getTotalGamePoints } from "@/lib/gameProgressService";

export default function UserProfilePage() {
  useUserGuard();
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [gamePoints, setGamePoints] = useState<number | null>(null);

  const displayName = user?.displayName || "";
  const initialFirst = displayName.split(" ")[0] || "";
  const initialLast = displayName.split(" ").slice(1).join(" ");

  useEffect(() => {
    let mounted = true;
    const loadPoints = async () => {
      if (!user) return;
      try {
        const total = await getTotalGamePoints(user.uid);
        if (!mounted) return;
        setGamePoints(total);
      } catch (err) {
        console.error("Failed to load game points", err);
      }
    };
    loadPoints();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const fn = firstName.trim() || initialFirst;
    const ln = lastName.trim() || initialLast;
    const newName = [fn, ln].filter(Boolean).join(" ").trim();
    if (!newName) {
      setMessage("Please provide at least a first name.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile(user, { displayName: newName });
      setMessage("Profile updated.");
    } catch (err) {
      console.error("Profile update failed", err);
      setMessage("Could not update profile right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="bg-gradient-to-br  from-indigo-50 via-slate-50  to-white min-h-screen px-4 sm:mx-0 pb-16 pt-20 ">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white text-lg">
              {user?.displayName?.[0] || "U"}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500">Game points</p>
                <p className="font-semibold">
                  {gamePoints !== null ? gamePoints : "—"}
                </p>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {user?.displayName || user?.email || "Profile"}
              </h1>
              <p className="text-sm text-slate-500">Manage your account</p>
            </div>
          </div>
        </div>

        <section className="rounded-3xl bg-white shadow-lg border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-700">
            <User className="w-5 h-5 text-indigo-500" />
            <p className="font-semibold">Profile</p>
          </div>

          <form
            onSubmit={handleSave}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700"
          >
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
              <span className="text-xs text-slate-500">First name</span>
              <input
                defaultValue={initialFirst}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-transparent focus:outline-none"
                placeholder="First name"
              />
            </label>
            <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
              <span className="text-xs text-slate-500">Last name</span>
              <input
                defaultValue={initialLast}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-transparent focus:outline-none"
                placeholder="Last name"
              />
            </label>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-semibold">{user?.email || "Not provided"}</p>
              </div>
            </div>
            {/* <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500">UID</p>
                <p className="font-semibold break-all">
                  {user?.uid || "Unknown"}
                </p>
              </div>
            </div> */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500">Last login</p>
                <p className="font-semibold">
                  {user?.metadata?.lastSignInTime
                    ? new Date(user.metadata.lastSignInTime).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-indigo-500" />
              <div>
                <p className="text-xs text-slate-500">Joined</p>
                <p className="font-semibold">
                  {user?.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </form>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
          {message && (
            <div className="text-sm text-slate-700 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
              {message}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white shadow-lg border border-slate-200 p-5 space-y-3">
          <p className="text-sm text-slate-700">
            Need changes? Reach out to support to update your account details.
          </p>
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition"
          >
            Go to My bookings
          </Link>
        </section>
      </div>
    </main>
  );
}
