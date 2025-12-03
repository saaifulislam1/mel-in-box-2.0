// src/app/(user)/bookings/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/AuthProvider";
import { Spinner } from "@/components/Spinner";
import {
  AlertCircle,
  CalendarClock,
  CreditCard,
  Hourglass,
  XCircle,
} from "lucide-react";
import {
  getPartyBookingsForEmail,
  type PartyBooking,
} from "@/lib/partyService";

type BookingRow = PartyBooking & { id: string };

const badge = (status?: string) => {
  switch (status) {
    case "accepted":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
    case "paid":
      return "bg-amber-500/15 text-amber-700 border-amber-500/30";
    case "completed":
      return "bg-sky-500/15 text-sky-700 border-sky-500/30";
    case "rejected":
    case "canceled":
      return "bg-rose-500/15 text-rose-700 border-rose-500/30";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export default function UserBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.email) {
        setBookings([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getPartyBookingsForEmail(user.email);
        console.log(data);
        setBookings(data as BookingRow[]);
      } catch (err) {
        console.error("Failed to load user bookings", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.email]);

  const needsAction = useMemo(
    () => bookings.some((b) => b.status === "pending_payment"),
    [bookings]
  );

  if (authLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <Spinner label="Checking account..." />
      </main>
    );
  }

  if (!user?.email) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <div className="flex items-center gap-2 text-slate-800">
          <CalendarClock className="w-5 h-5 text-amber-600" />
          <h1 className="text-2xl font-semibold">Your bookings</h1>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Please log in to see your booking history.
          <Link
            href="/login"
            className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-full bg-amber-600 text-white text-sm shadow"
          >
            Log in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800">
          <CalendarClock className="w-5 h-5 text-amber-600" />
          <h1 className="text-2xl font-semibold">Your bookings</h1>
        </div>
        {needsAction && (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            <Hourglass className="w-3 h-3" />
            Needs payment
          </span>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-slate-700">
          No bookings yet. When you book a party, it will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={`/bookings/${b.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {b.packageName}
                  </p>
                  <p className="text-sm text-slate-600">
                    {b.partyDate} @ {b.partyTime}
                  </p>
                  <p className="text-xs text-slate-500">
                    Kids: {b.kidsExpected} • {b.location || "No location yet"}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full border ${badge(
                    b.status
                  )}`}
                >
                  {b.status === "pending_payment"
                    ? "Needs action"
                    : b.status === "accepted"
                    ? "Accepted"
                    : b.status === "paid"
                    ? "Paid"
                    : b.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-3">
                <CreditCard className="w-4 h-4 text-amber-600" />$
                {b.amountPaid ?? b.packagePrice ?? 0}
                {b.refundId && (
                  <>
                    <XCircle className="w-4 h-4 text-rose-500" />
                    Refunded ${b.refundAmount ?? 0}
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
