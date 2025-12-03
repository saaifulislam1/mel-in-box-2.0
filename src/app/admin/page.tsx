// src/app/admin/page.tsx

"use client";

import { useAuth } from "@/app/AuthProvider";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAllPartyBookings, updatePartyBooking } from "@/lib/partyService";
import { Spinner } from "@/components/Spinner";
import {
  BellDot,
  CheckCircle2,
  CircleDot,
  Clock3,
  Link2,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BookingRow = {
  id: string;
  packageName: string;
  partyDate: string;
  partyTime: string;
  kidsExpected: number;
  location: string;
  email?: string;
  phone?: string;
  status?: string;
  read?: boolean;
};

export default function AdminDashboard() {
  useAdminGuard(); // protect the page
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await getAllPartyBookings();
      setBookings(data as BookingRow[]);
    } catch (err) {
      console.error("Failed to load bookings", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const unreadCount = useMemo(
    () => bookings.filter((b) => !b.read).length,
    [bookings]
  );

  const statusCounts = useMemo(
    () => ({
      pending: bookings.filter((b) => b.status === "pending_payment").length,
      accepted: bookings.filter((b) => b.status === "accepted").length,
      completed: bookings.filter((b) => b.status === "completed").length,
    }),
    [bookings]
  );

  const handleMarkRead = async (id: string) => {
    setMarkingId(id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, read: true } : b))
    );

    try {
      await updatePartyBooking(id, { read: true });
    } catch (err) {
      console.error("Failed to mark as read", err);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, read: false } : b))
      );
    } finally {
      setMarkingId(null);
    }
  };

  const statusBadge = (status?: string) => {
    switch (status) {
      case "accepted":
        return "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
      case "completed":
        return "bg-sky-500/20 text-sky-200 border-sky-500/40";
      case "rejected":
        return "bg-rose-500/20 text-rose-200 border-rose-500/40";
      case "paid":
        return "bg-amber-500/20 text-amber-200 border-amber-500/40";
      default:
        return "bg-white/5 text-slate-200 border-white/10";
    }
  };

  return (
    <main className="space-y-6">
      <header className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-800/70 border border-white/10 shadow-2xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-300">Welcome back</p>
              <h1 className="text-2xl font-semibold text-white">
                Admin Control Center
              </h1>
              <p className="text-sm text-slate-400">
                {user?.email ?? "Authenticated admin"}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 font-semibold shadow hover:-translate-y-0.5 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
        <div className="flex flex-wrap gap-3 text-slate-200">
          <BellDot className="w-4 h-4 text-amber-300" />
          <span className="text-sm">
            Keep an eye on unread booking requests and respond quickly.
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
          <p className="text-sm text-slate-300">Unread requests</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-semibold text-white">
              {unreadCount}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-100 border border-rose-500/40">
              needs attention
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
          <p className="text-sm text-slate-300">Pending payment</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-semibold text-white">
              {statusCounts.pending}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-100 border border-amber-500/40">
              awaiting action
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
          <p className="text-sm text-slate-300">Completed</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-semibold text-white">
              {statusCounts.completed}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-100 border border-sky-500/40">
              wrapped up
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BellDot className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg font-semibold text-white">
              New booking requests
            </h2>
          </div>
          <Link
            href="/admin/bookings"
            className="text-sm text-sky-200 hover:text-white underline underline-offset-4"
          >
            Open bookings page
          </Link>
        </div>

        {loading ? (
          <Spinner label="Loading bookings..." />
        ) : bookings.length === 0 ? (
          <p className="text-slate-300 text-sm">
            No booking activity yet. New requests will show up here.
          </p>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    {!b.read && (
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-rose-400 mt-1.5"
                        aria-label="Unread booking"
                      />
                    )}
                    <div>
                      <p className="text-white font-semibold text-base">
                        {b.packageName}
                      </p>
                      <p className="text-xs text-slate-300">
                        {b.partyDate} @ {b.partyTime}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full border ${statusBadge(
                      b.status
                    )}`}
                  >
                    {b.status ?? "pending"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <Clock3 className="w-4 h-4 text-amber-300" />
                  {b.kidsExpected} kids • {b.location}
                  {b.email && (
                    <>
                      <Mail className="w-4 h-4 text-sky-300" />
                      {b.email}
                    </>
                  )}
                  {b.phone && (
                    <>
                      <Phone className="w-4 h-4 text-emerald-300" />
                      {b.phone}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-100 text-sm hover:bg-white/15 transition"
                  >
                    <Link2 className="w-4 h-4" />
                    View details
                  </Link>
                  <button
                    onClick={() => handleMarkRead(b.id)}
                    disabled={markingId === b.id || b.read}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                  >
                    {markingId === b.id ? (
                      <Spinner label="Marking..." />
                    ) : b.read ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <CircleDot className="w-4 h-4" />
                    )}
                    {b.read ? "Read" : "Mark as read"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
