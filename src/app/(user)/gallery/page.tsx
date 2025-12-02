// src/app/(user)/gallery/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  Heart,
  Image as ImageIcon,
  Share2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getAllPhotos, updatePhotoLikes } from "@/lib/galleryService";
import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/app/AuthProvider";

type Photo = {
  id: string;
  title: string;
  date: string;
  category: string;
  categoryColor: string;
  image: string;
  likes: number;
  loved?: boolean;
  downloads?: number;
  shareUrl?: string;
};

export default function GalleryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const gradient = useMemo(
    () =>
      "bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-100 dark:from-sky-100 dark:via-blue-100 dark:to-cyan-100",
    []
  );

  useEffect(() => {
    let isMounted = true;

    const loadPhotos = async () => {
      try {
        const data = await getAllPhotos();
        if (!isMounted) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: Photo[] = data.map((p: any) => ({
          id: p.id,
          title: p.title,
          date: p.date,
          category: p.category,
          categoryColor: p.categoryColor || "bg-sky-500",
          image: p.imageURL,
          likes: p.likes ?? 0,
          downloads: p.downloads ?? 0,
          shareUrl: p.shareUrl,
        }));
        const stored = getStoredLikes();
        const withLikes = mapped.map((p) => ({
          ...p,
          loved: stored[p.id] ?? false,
        }));
        setLikedMap(stored);
        setPhotos(withLikes);
      } catch (err) {
        console.error("Failed to load gallery", err);
        setPhotos([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPhotos();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // When user changes, reapply stored likes to current list
  useEffect(() => {
    if (!photos.length) return;
    const stored = getStoredLikes();
    setLikedMap(stored);
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        loved: stored[p.id] ?? false,
      }))
    );
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const storageKey = () =>
    user?.uid ? `gallery-likes-${user.uid}` : "gallery-likes-guest";

  const getStoredLikes = (): Record<string, boolean> => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(storageKey());
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  };

  const persistLikes = (state: Record<string, boolean>) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(storageKey(), JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  };

  const toggleLove = async (photoId: string) => {
    const current = photos.find((p) => p.id === photoId);
    const currentlyLoved = likedMap[photoId] ?? current?.loved ?? false;
    const delta = currentlyLoved ? -1 : 1;

    const previousPhotos = photos;
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId
          ? {
              ...p,
              loved: !currentlyLoved,
              likes: (p.likes ?? 0) + delta,
            }
          : p
      )
    );
    if (selected?.id === photoId) {
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              loved: !currentlyLoved,
              likes: (prev.likes ?? 0) + delta,
            }
          : prev
      );
    }

    const nextLiked = { ...likedMap, [photoId]: !currentlyLoved };
    setLikedMap(nextLiked);
    persistLikes(nextLiked);

    if (delta !== 0) {
      try {
        await updatePhotoLikes(photoId, delta);
      } catch (err) {
        console.error("Failed to update likes", err);
        // rollback on failure to keep counts accurate
        setPhotos(previousPhotos);
        const rolledBackLiked = { ...nextLiked, [photoId]: currentlyLoved };
        setLikedMap(rolledBackLiked);
        persistLikes(rolledBackLiked);
      }
    }
  };

  const handleShare = async (photo: Photo) => {
    const url = photo.shareUrl ?? photo.image;
    const shareData = {
      title: photo.title,
      text: `Check out ${photo.title}!`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setToast("Shared successfully!");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setToast("Link copied to clipboard");
      } else {
        window.prompt("Copy this link", url);
      }
    } catch {
      setToast("Unable to share right now");
    }
  };

  const handleDownload = (photo: Photo) => {
    try {
      const link = document.createElement("a");
      link.href = photo.image;
      link.download = `${photo.title.replace(/\s+/g, "-").toLowerCase()}.jpg`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast("Download started");
    } catch {
      window.open(photo.image, "_blank");
    }
  };

  const openModal = (photo: Photo) => setSelected(photo);
  const closeModal = () => setSelected(null);

  return (
    <main
      className={`relative min-h-screen ${gradient} text-slate-800 overflow-hidden pb-20 pt-24`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.7),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.55),transparent_30%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.4),transparent_30%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 pt-6 sm:pt-10 space-y-5">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 shadow-sm text-sky-700 font-semibold text-base sm:text-lg">
            <ImageIcon className="w-5 h-5 shrink-0" />
            <span className="font-semibold whitespace-nowrap">
              Photo Gallery
            </span>
          </div>
        </div>
        <p className="text-center text-slate-600 max-w-2xl mx-auto px-2 text-sm sm:text-base">
          Relive the most magical party moments. Love photos, share with
          friends, download keepsakes, and tap to view each picture up close.
        </p>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading && (
            <div className="col-span-full flex justify-center">
              <Spinner label="Loading photos..." className="text-slate-700" />
            </div>
          )}
          {!loading && photos.length === 0 && (
            <div className="col-span-full">
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 shadow p-6 flex flex-col items-center gap-3 text-center">
                <div className="p-4 rounded-full bg-sky-50 text-sky-600 shadow-inner">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-800">
                    No photos yet
                  </p>
                  <p className="text-sm text-slate-500">
                    Check back soon — we are adding magical memories.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 text-white font-semibold shadow hover:-translate-y-0.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back Home
                </button>
              </div>
            </div>
          )}
          {photos.map((photo) => (
            <article
              key={photo.id}
              className="group relative bg-white/90 rounded-3xl shadow-lg overflow-hidden border border-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="relative h-64 w-full cursor-pointer"
                onClick={() => openModal(photo)}
              >
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow ${photo.categoryColor}`}
                >
                  {photo.category}
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition flex items-center justify-center bg-black/20">
                  <div className="bg-white/90 rounded-full px-3 py-1 text-slate-700 text-sm shadow">
                    Tap to preview
                  </div>
                </div>
              </div>

              <div className="p-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{photo.title}</h3>
                  <p className="text-sm text-slate-500">{photo.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare(photo)}
                    className="p-2 rounded-full text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                    aria-label={`Share ${photo.title}`}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(photo)}
                    className="p-2 rounded-full text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                    aria-label={`Download ${photo.title}`}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-1 pb-4 flex items-center gap-2 text-slate-600">
                <button
                  onClick={() => toggleLove(photo.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-slate-50 text-slate-700 hover:bg-sky-50 transition"
                  aria-label={`Love ${photo.title}`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      photo.loved ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />
                  <span className="text-sm font-medium">{photo.likes}</span>
                </button>
                {/* {typeof photo.downloads === "number" && (
                  <span className="text-xs text-slate-500">
                    {photo.downloads} downloads
                  </span>
                )} */}
              </div>
            </article>
          ))}
        </section>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/70 transition"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selected.image}
              alt={selected.title}
              className="w-full h-[60vh] object-cover"
            />
            <div className="p-4 flex flex-col gap-3 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {selected.date}
                  </p>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {selected.title}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${selected.categoryColor}`}
                >
                  {selected.category}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLove(selected.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 text-slate-700 hover:bg-sky-50 transition"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        selected.loved ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                    <span className="text-sm font-semibold">
                      {selected.likes} Loves
                    </span>
                  </button>
                  <button
                    onClick={() => handleShare(selected)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 text-slate-700 hover:bg-sky-50 transition"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-semibold">Share</span>
                  </button>
                  <button
                    onClick={() => handleDownload(selected)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 text-slate-700 hover:bg-sky-50 transition"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-sm font-semibold">Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-full bg-slate-900 text-white shadow-lg text-sm">
          {toast}
        </div>
      )}
    </main>
  );
}
