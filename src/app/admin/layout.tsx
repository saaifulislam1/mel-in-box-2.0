// src/app/admin/layout.tsx
// src/app/admin/layout.tsx

"use client";

import "../globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Film,
  Images,
  LayoutDashboard,
  Menu,
  PartyPopper,
  Upload,
  X,
} from "lucide-react";
import { getAllPartyBookings } from "@/lib/partyService";

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  match?: "exact" | "prefix";
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [unreadBookings, setUnreadBookings] = useState(0);
  const [open, setOpen] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      {
        href: "/admin",
        label: "Dashboard",
        description: "Overview & booking inbox",
        icon: <LayoutDashboard className="w-4 h-4" />,
        match: "exact",
      },
      {
        href: "/admin/bookings",
        label: "Bookings",
        description: "Requests, status, pagination",
        icon: <CalendarClock className="w-4 h-4" />,
        badge: unreadBookings > 0 ? `${unreadBookings} new` : undefined,
        match: "prefix",
      },
      {
        href: "/admin/story-time",
        label: "Story Time",
        description: "Manage and edit videos",
        icon: <Film className="w-4 h-4" />,
        match: "exact",
      },
      {
        href: "/admin/story-time/upload",
        label: "Upload Video",
        description: "Add a new story",
        icon: <Upload className="w-4 h-4" />,
      },
      {
        href: "/admin/gallery",
        label: "Gallery",
        description: "Curate the photo library",
        icon: <Images className="w-4 h-4" />,
        match: "exact",
      },
      {
        href: "/admin/gallery/upload",
        label: "Upload Photo",
        description: "Add to the gallery",
        icon: <Upload className="w-4 h-4" />,
      },
      {
        href: "/admin/parties",
        label: "Party Packages",
        description: "Create and edit packages",
        icon: <PartyPopper className="w-4 h-4" />,
        match: "exact",
      },
    ],
    [unreadBookings]
  );

  useEffect(() => {
    const loadUnread = async () => {
      try {
        const bookings = await getAllPartyBookings();
        const unread = bookings.filter((b: { read?: boolean }) => !b.read)
          .length;
        setUnreadBookings(unread);
      } catch (err) {
        console.error("Unable to load bookings", err);
      }
    };

    loadUnread();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.15),transparent_30%)] pointer-events-none" />
      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed md:static z-40 md:z-0 w-72 md:w-80 lg:w-96 shrink-0 h-full md:h-auto bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 md:bg-white/5 border-r border-white/10 md:border md:border-white/10 backdrop-blur p-6 shadow-2xl transform transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-white/70 md:text-slate-300">
                Admin Navigation
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Control Center
              </h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="md:hidden p-2 rounded-full bg-white/15 text-white"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => {
              const active =
                item.match === "exact"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                    active
                      ? "bg-white/15 border-white/30 shadow-lg"
                      : "bg-white/5 border-white/10 hover:bg-indigo-500/10 hover:border-white/20"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${
                      active ? "bg-white text-slate-900" : "bg-white/10"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{item.label}</p>
                      {item.badge && (
                        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/80 md:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {open && (
          <button
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          />
        )}

        {/* Content */}
        <section className="flex-1 md:ml-0 ml-0 md:pl-0 px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/15 text-white shadow"
            >
              <Menu className="w-4 h-4" />
              Menu
            </button>
            {unreadBookings > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-rose-500 text-white border border-white/20">
                {unreadBookings} new
              </span>
            )}
          </div>
          <div className="max-w-6xl mx-auto space-y-6">{children}</div>
        </section>
      </div>
    </div>
  );
}
