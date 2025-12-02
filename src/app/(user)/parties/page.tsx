// src/app/(user)/parties/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";
import { getAllPartyPackages, type PartyPackage } from "@/lib/partyService";
import { Spinner } from "@/components/Spinner";

type PackageItem = PartyPackage & { id: string };

const gradients = [
  "from-pink-500 via-rose-500 to-orange-400",
  "from-sky-500 via-blue-500 to-indigo-500",
  "from-purple-500 via-fuchsia-500 to-pink-500",
  "from-emerald-500 via-teal-500 to-cyan-400",
];

export default function KidPartiesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const gradientBg = useMemo(
    () => "bg-gradient-to-br from-purple-100 via-lilac-100 to-sky-100",
    []
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getAllPartyPackages();
        if (!mounted) return;
        setPackages(data as PackageItem[]);
      } catch (err) {
        console.error("Failed to load party packages", err);
        if (mounted) setPackages([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main
      className={`min-h-screen ${gradientBg} text-slate-800 pt-24 pb-24 px-3 sm:px-5`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.7),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.5),transparent_30%)] pointer-events-none" />
      <div className="relative max-w-5xl w-full mx-auto space-y-6">
        <div className="flex items-center justify-center gap-3">
          <ArrowLeft
            className="w-5 h-5 text-purple-500 cursor-pointer"
            onClick={() => router.push("/")}
          />
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 shadow-sm text-purple-600 font-semibold text-base sm:text-lg">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold whitespace-nowrap">Kid Parties</span>
          </div>
        </div>
        <p className="text-center text-slate-600 max-w-2xl mx-auto text-sm sm:text-base px-2">
          Choose a magical party package. Tap "Book This Party" to pick your
          date, time, location, and complete payment securely.
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner label="Loading packages..." className="text-purple-600" />
          </div>
        ) : packages.length === 0 ? (
          <div className="rounded-3xl bg-white/80 border border-slate-100 shadow p-6 text-center space-y-2">
            <p className="text-lg font-semibold text-slate-800">
              Packages coming soon
            </p>
            <p className="text-sm text-slate-600">
              Admins can create party packages in the dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {packages.map((pkg, idx) => {
              const gradient = gradients[idx % gradients.length];
              return (
                <article
                  key={pkg.id}
                  className={`relative overflow-hidden rounded-[28px] shadow-xl text-white p-5 sm:p-6 bg-gradient-to-br ${gradient}`}
                >
                  <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                  <div className="relative flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pkg.icon || "🎉"}</span>
                      <h2 className="text-xl sm:text-2xl font-semibold">
                        {pkg.name}
                      </h2>
                    </div>
                    <div className="text-right text-2xl sm:text-3xl font-bold">
                      ${pkg.price}
                    </div>
                  </div>

                  <div className="relative mt-3 flex flex-wrap items-center gap-4 text-sm sm:text-base text-white/90">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {pkg.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {pkg.kidsCount} kids
                    </span>
                    {pkg.badge && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
                        {pkg.badge}
                      </span>
                    )}
                  </div>

                  <div className="relative mt-4 space-y-2">
                    <p className="text-base font-semibold text-white">
                      What&apos;s Included:
                    </p>
                    <ul className="space-y-1 text-sm sm:text-base text-white/95">
                      {pkg.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="text-lg leading-5">✦</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative mt-5">
                    <button
                      onClick={() => router.push(`/parties/${pkg.id}/book`)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white/90 text-purple-700 font-semibold shadow hover:-translate-y-0.5 transition"
                    >
                      Book This Party!
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
