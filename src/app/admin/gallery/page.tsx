/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/admin/gallery/page.tsx

"use client";

import { useAdminGuard } from "@/hooks/useAdminGuard";
import {
  deletePhoto,
  getAllPhotos,
  updatePhoto,
  uploadGalleryFile,
} from "@/lib/galleryService";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  Image as ImageIcon,
  Pencil,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/Spinner";

type GalleryItem = {
  id: string;
  title: string;
  date: string;
  category: string;
  categoryColor: string;
  imageURL: string;
  description?: string;
};

export default function AdminGalleryPage() {
  useAdminGuard();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [categoryColor, setCategoryColor] = useState("bg-sky-500");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async (isMounted = true) => {
    if (isMounted) setLoading(true);
    try {
      const data = await getAllPhotos();
      const mapped = data.map((p: any) => ({
        id: p.id,
        title: p.title,
        date: p.date,
        category: p.category,
        categoryColor: p.categoryColor || "bg-sky-500",
        imageURL: p.imageURL,
        description: p.description,
      }));
      if (!isMounted) return;
      setItems(mapped);
    } catch (err) {
      console.error("Failed to load photos", err);
      if (isMounted) setItems([]);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const startEdit = (item: GalleryItem) => {
    setEditing(item);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setDate(item.date ?? "");
    setCategory(item.category ?? "");
    setCategoryColor(item.categoryColor || "bg-sky-500");
    setImageFile(null);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setSaving(true);
    let imageURL = editing.imageURL;
    try {
      if (imageFile) {
        imageURL = await uploadGalleryFile(
          `gallery/${Date.now()}-${imageFile.name}`,
          imageFile
        );
      }
      await updatePhoto(editing.id, {
        title: title || editing.title,
        description,
        date: date || editing.date,
        category: category || editing.category,
        categoryColor,
        imageURL,
      });
      setMessage("Photo updated");
      setEditing(null);
      load();
    } catch (err) {
      console.error("Failed to update photo", err);
      setMessage("Unable to update photo right now.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    load(mounted);
    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePhoto(id);
      setMessage("Photo deleted");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Failed to delete photo", err);
      setMessage("Unable to delete photo right now.");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-200">
          <ImageIcon className="w-5 h-5 text-sky-300" />
          <h1 className="text-xl font-semibold">Gallery Management</h1>
        </div>
        <Link
          href="/admin/gallery/upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white font-semibold shadow hover:-translate-y-0.5 transition"
        >
          <Upload className="w-4 h-4" />
          Upload Photo
        </Link>
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200">
        <p className="text-sm text-slate-300">
          Upload high-quality images for the photo gallery. Add labels, dates,
          and themes so the user experience stays organized.
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm shadow">
          <AlertCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      {loading ? (
        <Spinner label="Loading photos..." />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-slate-300">
          <p>No photos uploaded yet.</p>
          <Link
            href="/admin/gallery/upload"
            className="inline-flex items-center gap-2 px-4 py-2 mt-3 rounded-full bg-sky-500 text-white font-semibold shadow hover:-translate-y-0.5 transition"
          >
            <Upload className="w-4 h-4" />
            Upload your first photo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur"
            >
              <div className="relative h-52 bg-slate-900">
                <img
                  src={item.imageURL}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${item.categoryColor}`}
                >
                  {item.category}
                </span>
                <button
                  onClick={() => setConfirmId(item.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/70 transition"
                  aria-label="Delete photo"
                >
                  {deletingId === item.id ? (
                    <Spinner label="Deleting..." />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300">{item.date}</p>
                </div>
                {item.description && (
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => startEdit(item)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-white text-sm border border-white/20 hover:bg-white/15 transition"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-2xl bg-slate-900 text-white rounded-2xl border border-white/10 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Photo</h3>
              <button
                onClick={() => setEditing(null)}
                className="text-sm text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                  placeholder="Photo title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Date</label>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                  placeholder="March 10, 2024"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Category</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                  placeholder="Birthday"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Category Color</label>
                <input
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                  placeholder="bg-sky-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                placeholder="Short caption or details"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Replace Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-slate-200 file:mr-3 file:rounded-md file:border file:border-white/30 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-200 hover:file:bg-white/20"
              />
              <p className="text-xs text-slate-400">
                Leave empty to keep the current image.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-slate-200 hover:bg-white/15 transition"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-sky-500 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-70"
              >
                {saving ? (
                  <Spinner label="Saving..." />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-slate-900 text-white rounded-2xl border border-white/10 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-300" />
                <h3 className="text-lg font-semibold">Delete photo?</h3>
              </div>
              <button
                onClick={() => setConfirmId(null)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-300">
              This will remove the photo from the gallery. This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-full border border-white/15 text-slate-200 hover:bg-white/5 transition"
                disabled={deletingId === confirmId}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={deletingId === confirmId}
                className="px-4 py-2 rounded-full bg-rose-500 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
              >
                {deletingId === confirmId ? (
                  <Spinner label="Deleting..." />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
