// src/app/admin/gallery/upload/page.tsx

"use client";

import { useAdminGuard } from "@/hooks/useAdminGuard";
import { createPhoto, uploadGalleryFile } from "@/lib/galleryService";
import { FormEvent, useState } from "react";
import {
  ImagePlus,
  Loader2,
  Palette,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";

const swatches = [
  { label: "Pink", value: "bg-pink-500" },
  { label: "Purple", value: "bg-purple-600" },
  { label: "Sky", value: "bg-sky-500" },
  { label: "Emerald", value: "bg-emerald-500" },
  { label: "Amber", value: "bg-amber-500" },
];

export default function UploadPhotoPage() {
  useAdminGuard();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Birthday");
  const [categoryColor, setCategoryColor] = useState("bg-pink-500");
  const [description, setDescription] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = (value: string) => {
    if (!value) return "";
    const d = new Date(value + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!imageFile) {
      setError("Please select a photo to upload.");
      return;
    }

    setLoading(true);
    try {
      const imageURL = await uploadGalleryFile(
        `gallery/${Date.now()}-${imageFile.name}`,
        imageFile
      );

      await createPhoto({
        title: title || "Untitled Photo",
        date: formattedDate(date) || date || "Undated",
        category,
        categoryColor,
        imageURL,
        description,
        shareUrl,
      });

      router.push("/admin/gallery");
    } catch (err) {
      console.error(err);
      setError("Failed to upload photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-2 text-slate-200">
        <ImagePlus className="w-5 h-5 text-sky-300" />
        <h1 className="text-xl font-semibold">Upload Photo</h1>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-lg font-semibold text-white">
              Add a new gallery photo
            </p>
            <p className="text-sm text-slate-300">
              Label the moment, pick a theme color, and drop in your best shot.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs border border-white/10">
            <Palette className="w-4 h-4" />
            Theme ready
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Title</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Princess Tea Time"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Event Date</label>
              <input
                type="date"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Category</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Birthday"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Theme Color</label>
              <div className="flex flex-wrap gap-2">
                {swatches.map((sw) => (
                  <button
                    key={sw.value}
                    type="button"
                    onClick={() => setCategoryColor(sw.value)}
                    className={`px-3 py-2 rounded-full text-sm font-semibold text-white shadow ${
                      sw.value
                    } ${
                      categoryColor === sw.value
                        ? "ring-2 ring-white/80"
                        : "opacity-90"
                    }`}
                  >
                    {sw.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200">Description</label>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional: add a short caption about this moment."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200">Share URL (optional)</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              placeholder="https://your-site.com/gallery/photo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200">Photo</label>
            <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="text-slate-200"
              />
              <p className="text-xs text-slate-400 mt-1">
                Upload a high-resolution image (JPG or PNG).
              </p>
            </div>
          </div>

          {error && (
            <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-sky-500 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Publish Photo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
