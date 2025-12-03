// src/app/(user)/bookings/[id]/page.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/AuthProvider";
import { Spinner } from "@/components/Spinner";
import {
  AlertCircle,
  CalendarClock,
  Clock3,
  CreditCard,
  Link2,
  MapPin,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  getPartyBooking,
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

export default function UserBookingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { user, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await getPartyBooking(id);
        setBooking((data as BookingRow) || null);
      } catch (err) {
        console.error("Failed to load booking", err);
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const createdDate = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (booking as any)?.createdAt;
    if (val?.toDate) return val.toDate().toLocaleString();
    if (typeof val === "string") return val;
    return "Not recorded";
  }, [booking]);

  if (authLoading || loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <Spinner label="Loading booking..." />
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <div className="flex items-center gap-2 text-slate-800">
          <CalendarClock className="w-5 h-5 text-amber-600" />
          <h1 className="text-2xl font-semibold">Booking</h1>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4" />
          Booking not found.
          <Link
            href="/bookings"
            className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900 text-white text-sm"
          >
            Back to bookings
          </Link>
        </div>
      </main>
    );
  }

  if (user?.email && booking.email && booking.email !== user.email) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <div className="flex items-center gap-2 text-slate-800">
          <CalendarClock className="w-5 h-5 text-amber-600" />
          <h1 className="text-2xl font-semibold">Booking</h1>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
          This booking is not linked to your account.
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center gap-2 text-slate-800">
        <CalendarClock className="w-5 h-5 text-amber-600" />
        <h1 className="text-2xl font-semibold">Booking</h1>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {booking.packageName}
            </p>
            <p className="text-sm text-slate-600">
              {booking.partyDate} @ {booking.partyTime}
            </p>
            <p className="text-xs text-slate-500">Created: {createdDate}</p>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full border ${badge(
              booking.status
            )}`}
          >
            {booking.status === "pending_payment"
              ? "Needs action"
              : booking.status === "accepted"
              ? "Accepted"
              : booking.status === "paid"
              ? "Paid"
              : booking.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-800">
              <Clock3 className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-semibold">Event details</p>
            </div>
            <p className="text-sm text-slate-700">
              Kids expected: {booking.kidsExpected}
            </p>
            <p className="text-sm text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              {booking.location || "No location yet"}
            </p>
            {booking.notes && (
              <div className="pt-1">
                <p className="text-xs text-slate-500">Notes</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {booking.notes}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-800">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-semibold">Payment</p>
            </div>
            <p className="text-sm text-slate-700">
              Amount: ${booking.amountPaid ?? booking.packagePrice ?? 0}
            </p>
            {booking.stripeSessionId && (
              <p className="text-xs text-slate-500">
                Session:{" "}
                <span className="font-mono">{booking.stripeSessionId}</span>
              </p>
            )}
            {booking.paymentIntentId && (
              <p className="text-xs text-slate-500">
                Payment intent:{" "}
                <span className="font-mono">{booking.paymentIntentId}</span>
              </p>
            )}
            {booking.refundId && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                Refunded ${booking.refundAmount ?? 0} (
                {booking.refundStatus || "pending"})
              </p>
            )}
            {booking.status === "pending_payment" && booking.packageId && (
              <Link
                href={`/parties/${booking.packageId}/book`}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900 text-white text-sm shadow mt-2"
              >
                <Link2 className="w-4 h-4" />
                Complete payment
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
