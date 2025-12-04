// src/app/(user)/story-time/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Eye,
  PlayCircle,
  X,
  SquareArrowLeft,
} from "lucide-react";
import {
  getAllVideos,
  incrementViewCount,
  type VideoData,
} from "@/lib/videoService";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/Spinner";
import Link from "next/link";
import HeadingSection from "@/components/HeadingSection";

type VideoItem = VideoData & {
  id: string;
  description?: string;
  duration?: string;
  tags?: string[];
  thumbnailURL?: string;
  videoURL?: string;
  views?: number;
};
type CachePayload = { videos: VideoItem[]; updatedAt: number };

const formatViews = (views: number) => {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return `${views}`;
};

export default function StoryTimePage() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selected, setSelected] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const cacheKey = "story-time-cache";

  const tagColor = useMemo(
    () => ["bg-pink-100 text-pink-600", "bg-purple-100 text-purple-600"],
    []
  );

  useEffect(() => {
    let isMounted = true;

    const loadVideos = async (options?: { background?: boolean }) => {
      const background = options?.background ?? false;
      if (!background) setLoading(true);
      const data = (await getAllVideos()) as VideoItem[];
      if (!isMounted) return;
      setVideos(data);
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ videos: data, updatedAt: Date.now() } as CachePayload)
      );
      setLoading(false);
    };

    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
      if (raw) {
        const cached = JSON.parse(raw) as CachePayload;
        if (cached?.videos?.length) {
          setVideos(cached.videos);
          setLoading(false);
          loadVideos({ background: true });
        } else {
          loadVideos();
        }
      } else {
        loadVideos();
      }
    } catch {
      loadVideos();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const openVideo = async (video: VideoItem) => {
    setSelected(video);
    try {
      await incrementViewCount(video.id);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, views: (v.views ?? 0) + 1 } : v
        )
      );
      setSelected((prev) =>
        prev ? { ...prev, views: (prev.views ?? 0) + 1 } : prev
      );
    } catch (err) {
      console.error("Failed to increment views", err);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200 text-slate-800 px-4 pb-16 pt-24 overflow-hidden">
      <BookOpen className="absolute right-4 top-13 w-5 h-5 text-emerald-600" />
      {/* decorative accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35),transparent_30%)] pointer-events-none" />
      <div className="relative max-w-5xl mx-auto pt-5  sm:px-4 space-y-6">
        <HeadingSection
          href="/"
          title="Story Time"
          textColor="text-emerald-700"
          icon={PlayCircle}
        />

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="w-full bg-white/80 rounded-2xl shadow-md flex flex-col sm:flex-row gap-3 overflow-hidden border border-emerald-50 p-3 animate-pulse"
              >
                <div className="w-full sm:w-44 h-44 sm:h-32 bg-emerald-100 rounded-xl" />
                <div className="flex-1 flex flex-col gap-3 py-2">
                  <div className="h-4 w-2/3 bg-emerald-100 rounded-full" />
                  <div className="h-3 w-full bg-emerald-50 rounded-full" />
                  <div className="h-3 w-5/6 bg-emerald-50 rounded-full" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-emerald-50 rounded-full" />
                    <div className="h-6 w-16 bg-emerald-50 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-5 pb-4">
          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => openVideo(v)}
              className="w-full bg-white/90 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col sm:flex-row gap-3 overflow-hidden border border-emerald-50 text-left"
            >
              <div className="relative w-full sm:w-44 h-44 sm:h-32 shrink-0">
                <img
                  src={v.thumbnailURL}
                  alt={v.title}
                  className="w-full h-full rounded-xl object-cover p-2"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/45 rounded-full p-2.5">
                    <PlayCircle className="w-6 h-6 text-white cursor-pointer" />
                  </div>
                </div>
                {v.duration && (
                  <span className="absolute bottom-3 right-3 text-xs font-semibold text-white bg-black/60 px-2 py-1 rounded-full opacity-75">
                    {v.duration}
                  </span>
                )}
              </div>

              <div className="flex-1 py-3 pr-4 pl-4 sm:pl-0 flex flex-col gap-2 justify-center">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">
                    {v.title}
                  </h2>
                  {v.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {v.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatViews(v.views ?? 0)} views
                  </span>
                  {v.duration && (
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="w-4 h-4" />
                      {v.duration}
                    </span>
                  )}
                </div>

                {v.tags && v.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {v.tags.slice(0, 2).map((tag, tagIdx) => (
                      <span
                        key={tag}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          tagColor[tagIdx % tagColor.length]
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Video modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/70 transition z-10"
              aria-label="Close"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            {selected.videoURL ? (
              <video
                src={selected.videoURL}
                controls
                autoPlay
                className="w-full h-[60vh] object-contain bg-black"
              />
            ) : (
              <div className="w-full h-[60vh] flex items-center justify-center bg-slate-100">
                <p className="text-slate-600">Video not available</p>
              </div>
            )}

            <div className="p-4 flex flex-col gap-2">
              <h3 className="text-lg font-semibold">{selected.title}</h3>
              {selected.description && (
                <p className="text-sm text-slate-600">{selected.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatViews(selected.views ?? 0)} views
                </span>
                {selected.duration && (
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="w-4 h-4" />
                    {selected.duration}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
