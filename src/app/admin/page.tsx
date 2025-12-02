// src/app/admin/page.tsx

"use client";

import { useAuth } from "@/app/AuthProvider";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  ArrowRight,
  Film,
  Images,
  LogOut,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  useAdminGuard(); // protect the page
  const { user } = useAuth();
  const router = useRouter();

  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-4 p-6 rounded-3xl bg-gradient-to-br from-slate-900/70 via-slate-900/60 to-slate-800/70 border border-white/10 shadow-2xl">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-slate-100 border border-white/20 font-semibold shadow hover:-translate-y-0.5 transition"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back Home
            </button>
            <button
              onClick={() => signOut(auth)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 font-semibold shadow hover:-translate-y-0.5 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-sm">
            Upload story-time videos and gallery photos, then review everything
            in one place.
          </span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Story Time",
            desc: "Manage videos, thumbnails, tags, and durations.",
            icon: <Film className="w-5 h-5" />,
            href: "/admin/story-time",
            accent: "from-emerald-500/90 to-teal-400/80",
          },
          {
            title: "Photo Gallery",
            desc: "Upload photos, set categories, and feature highlights.",
            icon: <Images className="w-5 h-5" />,
            href: "/admin/gallery",
            accent: "from-sky-500/90 to-indigo-400/80",
          },
          {
            title: "Quick Upload",
            desc: "Jump straight into adding new media.",
            icon: <Upload className="w-5 h-5" />,
            href: "/admin/gallery/upload",
            accent: "from-fuchsia-500/90 to-pink-400/80",
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 shadow-lg hover:shadow-2xl transition"
          >
            <div
              className={`absolute inset-0 opacity-70 bg-gradient-to-br ${item.accent}`}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="p-3 rounded-xl bg-white/20 text-white">
                {item.icon}
              </div>
              <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition" />
            </div>
            <div className="relative mt-4 text-white">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-sm text-white/90">{item.desc}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur shadow-lg">
          <div className="flex items-center gap-2 text-slate-200 mb-3">
            <Film className="w-4 h-4 text-emerald-300" />
            <h3 className="font-semibold">Story Time Actions</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Upload new videos, tidy metadata, and keep your story playlist
            current.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/story-time/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white font-semibold shadow hover:-translate-y-0.5 transition"
            >
              <Upload className="w-4 h-4" />
              Upload Video
            </Link>
            <Link
              href="/admin/story-time"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 font-semibold shadow hover:-translate-y-0.5 transition"
            >
              <ArrowRight className="w-4 h-4" />
              Manage Videos
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur shadow-lg">
          <div className="flex items-center gap-2 text-slate-200 mb-3">
            <Images className="w-4 h-4 text-sky-300" />
            <h3 className="font-semibold">Gallery Actions</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Add high-quality photos, label them by theme, and keep the gallery
            vibrant.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/gallery/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white font-semibold shadow hover:-translate-y-0.5 transition"
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </Link>
            <Link
              href="/admin/gallery"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 font-semibold shadow hover:-translate-y-0.5 transition"
            >
              <ArrowRight className="w-4 h-4" />
              Manage Photos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
