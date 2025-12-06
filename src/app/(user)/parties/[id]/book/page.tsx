// src/app/(user)/parties/[id]/book/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPartyPackage } from "@/lib/partyService";
import { Spinner } from "@/components/Spinner";
import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  Users,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/app/AuthProvider";

type PackageData = {
  id: string;
  name: string;
  price: number;
  duration: string;
  kidsCount: number;
  includes: string[];
  icon?: string;
};

export default function BookPartyPage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params?.id as string;
  const { user } = useAuth();

  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [partyDate, setPartyDate] = useState("");
  const [partyTime, setPartyTime] = useState("");
  const [kidsExpected, setKidsExpected] = useState(10);
  const [location, setLocation] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [notes, setNotes] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getPartyPackage(packageId);
        if (!mounted) return;
        setPkg(data as PackageData);
      } catch (err) {
        console.error("Failed to load package", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [packageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg) return;
    if (!user?.email) {
      setError("Please sign in to book a party.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          packageName: pkg.name,
          packagePrice: pkg.price,
          partyDate,
          partyTime,
          kidsExpected,
          location,
          mapLink,
          notes,
          email: user.email,
          contactEmail,
          phone,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Unable to start checkout");
      }
      const body = await res.json();
      if (body?.url) {
        window.location.href = body.url as string;
      } else {
        throw new Error("Checkout URL missing");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-100 to-sky-100 text-slate-800 pt-24 pb-24 px-4 sm:px-5">
      <div className="relative max-w-4xl mx-auto bg-white/80 border border-slate-100 rounded-3xl shadow-lg backdrop-blur p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-sm hover:shadow transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="inline-flex items-center gap-2 text-purple-700 font-semibold">
            <CalendarClock className="w-5 h-5" />
            Book Party
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner label="Loading package..." className="text-purple-700" />
          </div>
        ) : !pkg ? (
          <p className="text-center text-slate-600">Package not found.</p>
        ) : (
          <>
            <div className="rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-sky-500 text-white p-4 sm:p-5 shadow-inner mb-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pkg.icon || "🎉"}</span>
                  <div>
                    <h2 className="text-xl font-semibold">{pkg.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="w-4 h-4" />
                        {pkg.duration}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {pkg.kidsCount} kids
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold">${pkg.price}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">Party Date</label>
                  <input
                    type="date"
                    required
                    value={partyDate}
                    onChange={(e) => setPartyDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">Party Time</label>
                  <input
                    type="time"
                    required
                    value={partyTime}
                    onChange={(e) => setPartyTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">
                    Kids attending
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={kidsExpected}
                    onChange={(e) =>
                      setKidsExpected(parseInt(e.target.value, 10) || 1)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="Venue address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">
                    Google Maps link (optional)
                  </label>
                  <input
                    type="url"
                    value={mapLink}
                    onChange={(e) => setMapLink(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">
                    Contact email (optional)
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">
                    Contact phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">
                    Notes / special requests
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="Allergies, themes, timing"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-purple-600 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-70"
                >
                  {submitting ? (
                    <Spinner label="Redirecting..." className="text-white" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Continue to Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
