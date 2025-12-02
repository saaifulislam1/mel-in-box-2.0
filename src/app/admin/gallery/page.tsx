// src/app/admin/gallery/page.tsx

"use client";

import { useAdminGuard } from "@/hooks/useAdminGuard";
import { deletePhoto, getAllPhotos } from "@/lib/galleryService";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

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

  useEffect(() => {
    let mounted = true;
    load(mounted);
    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Delete this photo from the gallery?");
    if (!ok) return;
    try {
      await deletePhoto(id);
      setMessage("Photo deleted");
      load();
    } catch (err) {
      console.error("Failed to delete photo", err);
      setMessage("Unable to delete photo right now.");
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-slate-200 border border-white/10 hover:bg-white/15 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </button>
          <button
            onClick={() => router.push("/admin")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-slate-200 border border-white/10 hover:bg-white/15 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2 text-slate-200">
            <ImageIcon className="w-5 h-5 text-sky-300" />
            <h1 className="text-xl font-semibold">Gallery Management</h1>
          </div>
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
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/70 transition"
                  aria-label="Delete photo"
                >
                  <Trash2 className="w-4 h-4" />
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
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
