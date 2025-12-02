// src/app/admin/story-time/page.tsx

"use client";

import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useEffect, useState } from "react";
import { getAllVideos, deleteVideo } from "@/lib/videoService";
import {
  AlertCircle,
  ArrowLeft,
  Clock3,
  Film,
  Play,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";

export default function AdminStoryTimePage() {
  useAdminGuard();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // The real function we will reuse everywhere
  const loadVideos = async (isMounted = true) => {
    setLoading(true);
    try {
      const data = await getAllVideos();
      if (isMounted) {
        setVideos(data);
      }
    } catch (err) {
      console.error("Failed to load videos", err);
      if (isMounted) setVideos([]);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    loadVideos(isMounted); // call our reusable function

    return () => {
      isMounted = false;
    };
  }, []);

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
            <Film className="w-5 h-5 text-emerald-300" />
            <h1 className="text-xl font-semibold">Story Time Library</h1>
          </div>
        </div>
        <Link
          href="/admin/story-time/upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white font-semibold shadow hover:-translate-y-0.5 transition"
        >
          <Upload className="w-4 h-4" />
          Upload Video
        </Link>
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200">
        <p className="text-sm text-slate-300">
          Keep your party stories fresh. Update thumbnails, durations, and tags
          so kids can find their favorite videos quickly.
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm shadow">
          <AlertCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      {loading ? (
        <Spinner label="Loading videos..." />
      ) : videos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-slate-300">
          <p>No videos yet.</p>
          <Link
            href="/admin/story-time/upload"
            className="inline-flex items-center gap-2 px-4 py-2 mt-3 rounded-full bg-emerald-500 text-white font-semibold shadow hover:-translate-y-0.5 transition"
          >
            <Upload className="w-4 h-4" />
            Upload your first video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((v) => (
            <article
              key={v.id}
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur flex flex-col"
            >
              <div className="relative h-48 bg-slate-900">
                <img
                  src={v.thumbnailURL}
                  alt={v.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow">
                  {v.duration || "Video"}
                </span>
                <button
                  onClick={async () => {
                    try {
                      await deleteVideo(v.id);
                      setMessage("Video deleted");
                      loadVideos();
                    } catch (err) {
                      console.error("Failed to delete video", err);
                      setMessage("Unable to delete video right now.");
                    }
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/70 transition"
                  aria-label="Delete video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2 text-slate-300">
                  <Play className="w-4 h-4 text-emerald-300" />
                  <h3 className="text-lg font-semibold text-white">
                    {v.title}
                  </h3>
                </div>
                {v.description && (
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {v.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(v.tags) &&
                    v.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-slate-200 text-xs border border-white/10"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                </div>
                {v.duration && (
                  <div className="inline-flex items-center gap-2 text-xs text-slate-300">
                    <Clock3 className="w-4 h-4 text-emerald-300" />
                    {v.duration}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
