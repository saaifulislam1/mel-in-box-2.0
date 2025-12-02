// src/app/(user)/parties/success/page.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function PartySuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get("bookingId");

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-sky-100 text-slate-800 pt-24 pb-24 px-3 sm:px-5">
      <div className="relative max-w-3xl mx-auto bg-white/80 border border-slate-100 rounded-3xl shadow-lg backdrop-blur p-6 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/parties")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-sm hover:shadow transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Parties
          </button>
          <div className="inline-flex items-center gap-2 text-emerald-700 font-semibold">
            <Sparkles className="w-5 h-5" />
            Booking Confirmed
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Payment Successful 🎉</h1>
          <p className="text-slate-600">
            We received your booking. Our team will confirm details soon.
            You&apos;ll get an email receipt from Stripe.
          </p>
          {bookingId && (
            <p className="text-sm text-slate-500">
              Booking ID: <span className="font-mono">{bookingId}</span>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
