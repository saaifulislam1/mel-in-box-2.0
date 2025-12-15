// src/app/(user)/dress/cart/page.tsx

"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Gift,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
} from "lucide-react";
import HeadingSection from "@/components/HeadingSection";
import { useDressCart } from "@/hooks/useDressCart";
import Link from "next/link";

const formatPrice = (price?: number) =>
  typeof price === "number" ? `$${price.toFixed(2)}` : "$0.00";

export default function DressCartPage() {
  const { items, removeItem, clearCart, total } = useDressCart();
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckout = () => {
    setMessage("Purchase completed! A confirmation email is on the way.");
    clearCart();
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 text-amber-900 px-4 pb-16 pt-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.25),transparent_30%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto space-y-6">
        <HeadingSection
          href="/dress"
          title="Dress Up Box Cart"
          textColor="text-amber-700"
          icon={ShoppingCart}
        />

        {message && (
          <div className="rounded-2xl bg-emerald-500 text-white px-4 py-3 shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <p className="text-sm">{message}</p>
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4 lg:gap-6">
          <div className="bg-white/95 rounded-3xl shadow-xl border border-amber-50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-amber-800">
                  Courses in cart
                </h2>
              </div>
              <Link
                href="/dress"
                className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue browsing
              </Link>
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-6 text-center text-amber-700">
                <p className="font-semibold">Your cart is empty.</p>
                <p className="text-sm text-amber-600 mt-1">
                  Add a course to start learning new looks!
                </p>
                <Link
                  href="/dress"
                  className="inline-flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-full bg-amber-500 text-white font-semibold shadow hover:-translate-y-0.5 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  Browse courses
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-3"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={item.thumbnailURL}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-xl border border-amber-100"
                      />
                      <div className="space-y-1 flex-1">
                        <p className="text-base font-semibold text-amber-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-amber-700 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-amber-700">
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-500" />
                            {item.level}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            {item.lessons ?? 0} lessons
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-3">
                      <p className="text-lg font-semibold text-amber-800">
                        {formatPrice(item.price)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-xl border border-amber-50 p-5 space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <CreditCard className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Order summary</h3>
            </div>

            <div className="space-y-2 text-sm text-amber-800">
              <div className="flex justify-between">
                <span>Courses</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Member perk</span>
                <span>- $0.00</span>
              </div>
              <div className="flex justify-between font-semibold text-amber-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-amber-700">Notes for Mel</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-2xl border border-amber-100 bg-white px-3 py-2 text-sm text-amber-900 placeholder:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="Any special requests?"
                rows={3}
              />
            </div>

            <div className="space-y-2 text-xs text-amber-700">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-50 border border-amber-100">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Secure checkout. You can watch instantly after purchase.
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-50 border border-amber-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                No risk: keep previews even if you remove the course later.
              </div>
            </div>

            <button
              disabled={items.length === 0}
              onClick={handleCheckout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 text-white font-semibold px-4 py-3 shadow-lg hover:-translate-y-0.5 transition disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <CreditCard className="w-4 h-4" />
              Complete purchase
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
