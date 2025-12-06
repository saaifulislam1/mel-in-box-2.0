// src/app/admin/bookings/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { Spinner } from "@/components/Spinner";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  CircleDot,
  Clock3,
  Filter,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import {
  getAllPartyBookings,
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

export default function AdminBookingsPage() {
  useAdminGuard();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const pageSize = 6;

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

  const filteredBookings = useMemo(() => {
    if (filter === "unread") {
      return bookings.filter((b) => !b.read);
    }
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / pageSize) || 1
  );
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filteredBookings.slice(start, start + pageSize);
  const showingFrom = filteredBookings.length === 0 ? 0 : start + 1;
  const showingTo =
    filteredBookings.length === 0
      ? 0
      : Math.min(start + pageSize, filteredBookings.length);

  const markRead = async (id: string) => {
    setActionId(id);
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
      setActionId(null);
    }
  };

  const updateStatus = async (id: string, status: PartyBooking["status"]) => {
    setActionId(id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status, read: true } : b))
    );

    try {
      await updatePartyBooking(id, { status, read: true });
    } catch (err) {
      console.error("Failed to update status", err);
      await loadBookings();
    } finally {
      setActionId(null);
    }
  };

  const cancelWithRefund = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id }),
      });
      if (!res.ok) throw new Error("Cancel failed");
      const data = await res.json();
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: "canceled",
                refundId: data.refundId,
                refundAmount: data.refundAmount,
                refundStatus: data.refundStatus,
              }
            : b
        )
      );
    } catch (err) {
      console.error("Failed to cancel booking", err);
      await loadBookings();
    } finally {
      setConfirmId(null);
      setActionId(null);
    }
  };

  const formatDate = (value: unknown) => {
    // Firestore Timestamp may have toDate; otherwise show as-is
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ts = value as any;
    if (ts?.toDate) {
      return ts.toDate().toLocaleDateString();
    }
    if (typeof ts === "string" && ts) return ts;
    return "Date not set";
  };

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-2 text-slate-200">
        <CalendarClock className="w-5 h-5 text-amber-300" />
        <h1 className="text-xl font-semibold">Bookings</h1>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-200">
            <Filter className="w-4 h-4 text-sky-300" />
            <p className="text-sm">Filter & paginate</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl bg-white/10 border border-white/20 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/60"
            >
              <option value="all">All bookings</option>
              <option value="unread">Unread</option>
              <option value="pending_payment">Pending payment</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
              <option value="canceled">Canceled</option>
            </select>
            <span className="text-xs text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading bookings..." />
        ) : pageItems.length === 0 ? (
          <div className="flex items-center gap-2 text-amber-100 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4" />
            No bookings match this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {pageItems.map((b) => {
              const pending = b.status === "pending_payment";
              return (
                <article
                  key={b.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg space-y-3"
                >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    {!b.read && (
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-rose-400 mt-1.5"
                        aria-label="Unread booking"
                      />
                    )}
                    <Link href={`/admin/bookings/${b.id}`} className="group">
                      <p className="text-white font-semibold text-base group-hover:underline">
                        {b.packageName}
                      </p>
                      <p className="text-xs text-slate-300">
                        {b.partyDate} @ {b.partyTime} •{" "}
                        {formatDate(b.createdAt)}
                      </p>
                    </Link>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full border ${statusStyle(
                      b.status
                    )}`}
                  >
                    {statusLabels[b.status ?? "pending_payment"] ??
                      b.status ??
                      "Pending"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <Clock3 className="w-4 h-4 text-amber-300" />
                  {b.kidsExpected} kids
                  <MapPin className="w-4 h-4 text-sky-300" />
                  {b.location || "No location"}
                  {b.email && (
                    <>
                      <Mail className="w-4 h-4 text-emerald-300" />
                      {b.email}
                    </>
                  )}
                  {b.contactEmail && b.contactEmail !== b.email && (
                    <>
                      <Mail className="w-4 h-4 text-rose-300" />
                      Contact: {b.contactEmail}
                    </>
                  )}
                  {b.phone && (
                    <>
                      <Phone className="w-4 h-4 text-emerald-300" />
                      {b.phone}
                    </>
                  )}
                  {b.status === "canceled" && b.refundId && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/20 text-rose-100 border border-rose-500/40">
                      Canceled & refunded
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Disable all actions except "read" when payment is pending */}
                  <button
                    onClick={() => updateStatus(b.id, "accepted")}
                    disabled={
                      actionId === b.id ||
                      pending ||
                      b.status === "canceled" ||
                      b.status === "accepted" ||
                      b.status === "completed"
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                  >
                    {actionId === b.id ? (
                      <Spinner label="Saving..." />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatus(b.id, "completed")}
                    disabled={
                      actionId === b.id ||
                      pending ||
                      b.status === "canceled" ||
                      b.status === "completed"
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-sky-500 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Mark complete
                  </button>
                  <button
                    onClick={() => setConfirmId(b.id)}
                    disabled={
                      actionId === b.id || b.status === "canceled" || pending
                    }
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-white text-sm border border-white/20 hover:bg-white/15 transition disabled:opacity-60"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Cancel & refund
                  </button>
                  <button
                    onClick={() => markRead(b.id)}
                    disabled={actionId === b.id || b.read}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-white text-sm border border-white/20 hover:bg-white/15 transition disabled:opacity-60"
                  >
                    <CircleDot className="w-4 h-4" />
                    {b.read ? "Read" : "Mark as read"}
                  </button>
                </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 text-sm text-slate-300">
          <p>
            Showing {showingFrom}-{showingTo} of {filteredBookings.length}{" "}
            bookings
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/15 transition disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/15 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {confirmId && (
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
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-slate-100 hover:bg-white/15 transition"
              >
                Keep booking
              </button>
              <button
                onClick={() => cancelWithRefund(confirmId)}
                disabled={actionId === confirmId}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
              >
                {actionId === confirmId ? (
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
