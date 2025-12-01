// src/app/(user)/story-time/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Clock3, Eye, PlayCircle, X } from "lucide-react";
import {
  getAllVideos,
  incrementViewCount,
  type VideoData,
} from "@/lib/videoService";
import { useRouter } from "next/navigation";

type VideoItem = VideoData & {
  id: string;
  description?: string;
  duration?: string;
  tags?: string[];
  thumbnailURL?: string;
  videoURL?: string;
  views?: number;
};

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

  const tagColor = useMemo(
    () => ["bg-pink-100 text-pink-600", "bg-purple-100 text-purple-600"],
    []
  );

  useEffect(() => {
    let isMounted = true;

    const loadVideos = async () => {
      setLoading(true);
      const data = (await getAllVideos()) as VideoItem[];
      if (!isMounted) return;
      setVideos(data);
      setLoading(false);
    };

    loadVideos();

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
      <div className="relative max-w-5xl mx-auto pt-6">
        <button
          onClick={() => router.push("/")}
          className="absolute left-0 top-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-slate-700 border border-emerald-100 shadow-sm hover:shadow transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back Home
        </button>

        <div className="flex items-center justify-center gap-2 mb-8 pt-2">
          <PlayCircle className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-semibold text-emerald-700">
            Story Time
          </h1>
        </div>

        {loading && (
          <p className="text-center text-slate-600">Loading videos...</p>
        )}

        <div className="space-y-4">
          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => openVideo(v)}
              className="w-full bg-white/90 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col sm:flex-row gap-3 overflow-hidden border border-emerald-50 text-left"
            >
              <div className="relative w-full sm:w-44 h-36 sm:h-32 shrink-0">
                <img
                  src={v.thumbnailURL}
                  alt={v.title}
                  className="w-[106px] h-full rounded-xl object-cover p-2"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/45 rounded-full p-2.5">
                    <PlayCircle className="w-6 h-6 text-white cursor-pointer" />
                  </div>
                </div>
                {v.duration && (
                  <span className="absolute bottom-2 right-2 text-xs font-semibold text-white bg-black/60 px-2 py-1 rounded-full">
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
