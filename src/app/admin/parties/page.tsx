// src/app/admin/parties/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import {
  createPartyPackage,
  deletePartyPackage,
  getAllPartyPackages,
  updatePartyPackage,
  type PartyPackage,
} from "@/lib/partyService";
import { Spinner } from "@/components/Spinner";
import {
  AlertCircle,
  CalendarClock,
  Edit2,
  Save,
  Trash2,
} from "lucide-react";

type PackageRow = PartyPackage & { id: string };

export default function AdminPartiesPage() {
  useAdminGuard();

  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: 0,
    duration: "",
    kidsCount: 10,
    includes: "",
    icon: "",
    badge: "",
    description: "",
  });

  const resetForm = () =>
    setForm({
      name: "",
      price: 0,
      duration: "",
      kidsCount: 10,
      includes: "",
      icon: "",
      badge: "",
      description: "",
    });

  const load = async () => {
    setLoading(true);
    try {
      const pkgData = await getAllPartyPackages();
      setPackages(pkgData as PackageRow[]);
    } catch (err) {
      console.error("Failed to load parties", err);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const payload: PartyPackage = {
      name: form.name,
      price: Number(form.price) || 0,
      duration: form.duration,
      kidsCount: Number(form.kidsCount) || 0,
      includes: form.includes
        .split("\n")
        .flatMap((line) => line.split(","))
        .map((i) => i.trim())
        .filter(Boolean),
      icon: form.icon ? form.icon : undefined,
      badge: form.badge ? form.badge : undefined,
      description: form.description ? form.description : undefined,
    };

    try {
      if (editingId) {
        await updatePartyPackage(editingId, payload);
        setMessage("Package updated");
      } else {
        await createPartyPackage(payload);
        setMessage("Package created");
      }
      resetForm();
      setEditingId(null);
      load();
    } catch (err) {
      console.error("Failed to save package", err);
      setMessage("Unable to save package right now.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (pkg: PackageRow) => {
    setEditingId(pkg.id);
    setForm({
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      kidsCount: pkg.kidsCount,
      includes: pkg.includes.join("\n"),
      icon: pkg.icon || "",
      badge: pkg.badge || "",
      description: pkg.description || "",
    });
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Delete this party package?");
    if (!ok) return;
    try {
      await deletePartyPackage(id);
      setMessage("Package deleted");
      load();
    } catch (err) {
      console.error("Delete failed", err);
      setMessage("Unable to delete right now.");
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-2 text-slate-200">
        <CalendarClock className="w-5 h-5 text-purple-300" />
        <h1 className="text-xl font-semibold">Party Packages</h1>
      </div>

      {message && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm shadow">
          <AlertCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      <section className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-5 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-slate-100">
          {editingId ? "Edit Package" : "Create Package"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm space-y-1">
              <span className="block text-slate-200">Package name</span>
              <input
                required
                placeholder="Birthday Blast Basic"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="block text-slate-200">Price (USD)</span>
              <input
                type="number"
                required
                placeholder="99"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="block text-slate-200">Duration</span>
              <input
                required
                placeholder="2 hours"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="block text-slate-200">Kids count</span>
              <input
                type="number"
                required
                placeholder="10"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                value={form.kidsCount}
                onChange={(e) =>
                  setForm({ ...form, kidsCount: Number(e.target.value) })
                }
              />
            </label>
          </div>

          <label className="text-sm space-y-1 block">
            <span className="block text-slate-200">
              What&apos;s included (one per line or comma separated)
            </span>
            <textarea
              placeholder={"Decorations\nBirthday cake\nGames"}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
              rows={3}
              value={form.includes}
              onChange={(e) => setForm({ ...form, includes: e.target.value })}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-sm space-y-1">
              <span className="block text-slate-200">Icon (emoji)</span>
              <input
                placeholder="🎉"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="block text-slate-200">Badge (optional)</span>
              <input
                placeholder="Popular"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="block text-slate-200">
                Short description (optional)
              </span>
              <input
                placeholder="Great for ages 5-8"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                }}
                className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-slate-200 hover:bg-white/15 transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-70"
            >
              {saving ? (
                <Spinner label="Saving..." />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingId ? "Update" : "Create"}
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Packages</h2>
        </div>
        {loading ? (
          <Spinner label="Loading packages..." />
        ) : packages.length === 0 ? (
          <p className="text-slate-300 text-sm">No packages yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <article
                key={pkg.id}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4 text-slate-100 space-y-2 shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{pkg.icon || "🎉"}</span>
                    <div>
                      <p className="font-semibold text-base">{pkg.name}</p>
                      <p className="text-sm text-slate-300">
                        ${pkg.price} • {pkg.duration} • {pkg.kidsCount} kids
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(pkg)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15"
                      aria-label="Edit package"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15"
                      aria-label="Delete package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {pkg.description && (
                  <p className="text-sm text-slate-300">{pkg.description}</p>
                )}
                <div className="text-sm text-slate-200">
                  Includes:
                  <ul className="list-disc list-inside text-slate-200/90">
                    {pkg.includes.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
