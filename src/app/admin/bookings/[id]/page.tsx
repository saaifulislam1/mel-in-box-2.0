// src/app/admin/bookings/[id]/page.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { Spinner } from "@/components/Spinner";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  CircleDot,
  Clock3,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  User,
} from "lucide-react";
import {
  getPartyBooking,
  updatePartyBooking,
  type PartyBooking,
} from "@/lib/partyService";

type BookingRow = PartyBooking & { id: string };

const statusLabels: Record<string, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  accepted: "Accepted",
  rejected: "Rejected",
  completed: "Completed",
  canceled: "Canceled",
};

const statusStyle = (status?: string) => {
  switch (status) {
    case "accepted":
      return "bg-emerald-500/15 text-emerald-100 border-emerald-500/30";
    case "rejected":
      return "bg-rose-500/15 text-rose-100 border-rose-500/30";
    case "completed":
      return "bg-sky-500/15 text-sky-100 border-sky-500/30";
    case "paid":
      return "bg-amber-500/15 text-amber-100 border-amber-500/30";
    case "canceled":
      return "bg-slate-500/20 text-slate-100 border-slate-400/30";
    default:
      return "bg-white/5 text-slate-200 border-white/15";
  }
};

export default function BookingDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  useAdminGuard();
  const [booking, setBooking] = useState<BookingRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { id } = React.use(params);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPartyBooking(id);
      if (data) {
        setBooking(data as BookingRow);
        if (!data.read) {
          await updatePartyBooking(id, { read: true });
        }
      } else {
        setBooking(null);
      }
    } catch (err) {
      console.error("Failed to load booking", err);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const changeStatus = async (status: PartyBooking["status"]) => {
    if (!booking) return;
    setActionId(booking.id);
    setBooking({ ...booking, status, read: true });
    try {
      await updatePartyBooking(booking.id, { status, read: true });
    } catch (err) {
      console.error("Failed to update booking", err);
      load();
    } finally {
      setActionId(null);
    }
  };

  const markRead = async () => {
    if (!booking || booking.read) return;
    setActionId(booking.id);
    setBooking({ ...booking, read: true });
    try {
      await updatePartyBooking(booking.id, { read: true });
    } catch (err) {
      console.error("Failed to mark as read", err);
      setBooking({ ...booking, read: false });
    } finally {
      setActionId(null);
    }
  };

  const cancelWithRefund = async () => {
    if (!booking) return;
    setConfirming(true);
    setActionId(booking.id);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      if (!res.ok) throw new Error("Cancel failed");
      const data = await res.json();
      setBooking({
        ...booking,
        status: "canceled",
        refundId: data.refundId,
        refundAmount: data.refundAmount,
        refundStatus: data.refundStatus,
        read: true,
      });
    } catch (err) {
      console.error("Failed to cancel booking", err);
      load();
    } finally {
      setConfirming(false);
      setActionId(null);
    }
  };

  const createdDate = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (booking as any)?.createdAt;
    if (val?.toDate) return val.toDate().toLocaleString();
    if (typeof val === "string") return val;
    return "Not recorded";
  }, [booking]);

  const isCanceled =
    booking?.status === "canceled" && Boolean(booking.refundId);
  const isAccepted = booking?.status === "accepted";
  const isCompleted = booking?.status === "completed";

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="flex items-center gap-2 text-slate-200">
          <CalendarClock className="w-5 h-5 text-amber-300" />
          <h1 className="text-xl font-semibold">Booking details</h1>
        </div>
        <Spinner label="Loading booking..." />
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="space-y-6">
        <div className="flex items-center gap-2 text-slate-200">
          <CalendarClock className="w-5 h-5 text-amber-300" />
          <h1 className="text-xl font-semibold">Booking details</h1>
        </div>
        <div className="flex items-center gap-2 text-amber-100 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4" />
          Booking not found.
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-2 text-slate-200">
        <CalendarClock className="w-5 h-5 text-amber-300" />
        <h1 className="text-xl font-semibold">Booking details</h1>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            {!booking.read && (
              <span
                className="h-2.5 w-2.5 rounded-full bg-rose-400 mt-1.5"
                aria-label="Unread booking"
              />
            )}
            <div>
              <p className="text-white font-semibold text-lg">
                {booking.packageName}
              </p>
              <p className="text-sm text-slate-300">
                {booking.partyDate} @ {booking.partyTime}
              </p>
              <p className="text-xs text-slate-400">Created: {createdDate}</p>
            </div>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full border ${statusStyle(
              booking.status
            )}`}
          >
            {statusLabels[booking.status ?? "pending_payment"] ??
              booking.status ??
              "Pending"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-200">
              <Clock3 className="w-4 h-4 text-amber-300" />
              <p className="text-sm font-semibold">Event details</p>
            </div>
            <p className="text-sm text-slate-300">
              {booking.kidsExpected} kids expected
            </p>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-300" />
              {booking.location || "No location provided"}
            </p>
            {booking.mapLink && (
              <a
                href={booking.mapLink}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-sky-200 underline underline-offset-4"
              >
                View map
              </a>
            )}
            {booking.notes && (
              <div className="pt-2">
                <p className="text-xs text-slate-400">Notes</p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">
                  {booking.notes}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-200">
              <User className="w-4 h-4 text-emerald-300" />
              <p className="text-sm font-semibold">Contact</p>
            </div>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-300" />
              User email: {booking.email || "Account email not provided"}
            </p>
            {booking.contactEmail && booking.contactEmail !== booking.email && (
              <p className="text-sm text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-rose-300" />
                Contact: {booking.contactEmail}
              </p>
            )}
            {booking.phone ? (
              <p className="text-sm text-slate-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-300" />
                {booking.phone}
              </p>
            ) : (
              <p className="text-sm text-slate-300">Phone not provided</p>
            )}
            <p className="text-sm text-slate-300">
              Stripe status: {booking.status ?? "pending"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-slate-200">
            <CreditCard className="w-4 h-4 text-sky-300" />
            <p className="text-sm font-semibold">Payment</p>
          </div>
          <p className="text-sm text-slate-300">
            Amount: ${booking.amountPaid ?? booking.packagePrice ?? 0}
          </p>
          {booking.stripeSessionId && (
            <p className="text-xs text-slate-400">
              Session:{" "}
              <span className="font-mono">{booking.stripeSessionId}</span>
            </p>
          )}
          {booking.paymentIntentId && (
            <p className="text-xs text-slate-400">
              Payment intent:{" "}
              <span className="font-mono">{booking.paymentIntentId}</span>
            </p>
          )}
          {booking.refundId && (
            <p className="text-xs text-rose-200">
              Refund {booking.refundStatus}: {booking.refundId} • $
              {booking.refundAmount ?? 0}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => changeStatus("accepted")}
            disabled={
              actionId === booking.id || isCanceled || isAccepted || isCompleted
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
          >
            <CheckCircle2 className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={() => changeStatus("completed")}
            disabled={actionId === booking.id || isCanceled || isCompleted}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
          >
            <CheckSquare className="w-4 h-4" />
            Mark complete
          </button>
          <button
            onClick={() => setConfirming(true)}
            disabled={actionId === booking.id || isCanceled}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm border border-white/20 hover:bg-white/15 transition disabled:opacity-60"
          >
            <RotateCcw className="w-4 h-4" />
            Cancel & refund
          </button>
          <button
            onClick={markRead}
            disabled={actionId === booking.id || booking.read}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm border border-white/20 hover:bg-white/15 transition disabled:opacity-60"
          >
            <CircleDot className="w-4 h-4" />
            {booking.read ? "Read" : "Mark as read"}
          </button>
        </div>
      </section>

      {confirming && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 text-white shadow-2xl p-5 space-y-4">
            <div className="space-y-1">
              <p className="text-lg font-semibold">Cancel and refund?</p>
              <p className="text-sm text-slate-300">
                This will cancel the booking and issue a full refund to the
                customer.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-slate-100 hover:bg-white/15 transition"
                disabled={actionId === booking.id}
              >
                Keep booking
              </button>
              <button
                onClick={cancelWithRefund}
                disabled={actionId === booking.id}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
              >
                {actionId === booking.id ? (
                  <Spinner label="Canceling..." />
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Yes, cancel & refund
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
