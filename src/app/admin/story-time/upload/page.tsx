// src/app/admin/story-time/upload/page.tsx

"use client";

import { useState, FormEvent } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { createVideo, uploadFile } from "@/lib/videoService";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileVideo, Loader2, Save, Tags } from "lucide-react";

export default function UploadVideoPage() {
  useAdminGuard();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!thumbnail || !videoFile) return;

    setLoading(true);

    const thumbURL = await uploadFile(
      `videos/thumbnails/${Date.now()}-${thumbnail.name}`,
      thumbnail
    );

    const videoURL = await uploadFile(
      `videos/files/${Date.now()}-${videoFile.name}`,
      videoFile
    );

    await createVideo({
      title,
      description,
      duration,
      tags: tags.split(",").map((t) => t.trim()),
      thumbnailURL: thumbURL,
      videoURL,
    });

    router.push("/admin/story-time");
  };

  return (
    <main className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-slate-200 border border-white/10 hover:bg-white/15 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back Home
        </button>
        <button
          onClick={() => router.push("/admin/story-time")}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-slate-200 border border-white/10 hover:bg-white/15 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2 text-slate-200">
          <FileVideo className="w-5 h-5 text-emerald-300" />
          <h1 className="text-xl font-semibold">Upload Story Time Video</h1>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl p-6 space-y-4">
        <p className="text-sm text-slate-300">
          Add a new story to the library. Upload a thumbnail, video file, and
          tags so it appears polished for users.
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Title</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                placeholder="Video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Duration</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                placeholder="03:15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200">Description</label>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              placeholder="Short summary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200 flex items-center gap-2">
              <Tags className="w-4 h-4 text-emerald-300" />
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              placeholder="adventure, fun, birthday"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-200">Thumbnail</p>
              <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="text-slate-200"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Upload a clear 16:9 thumbnail.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-200">Video File</p>
              <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-4">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="text-slate-200"
                />
                <p className="text-xs text-slate-400 mt-1">
                  MP4 recommended for smooth playback.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Publish Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
