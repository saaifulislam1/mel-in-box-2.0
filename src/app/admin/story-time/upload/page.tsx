// src/app/admin/story-time/upload/page.tsx

"use client";

import { useState, FormEvent } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { createVideo, uploadFile } from "@/lib/videoService";
import { useRouter } from "next/navigation";

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
      `videos/thumbnails/${thumbnail.name}`,
      thumbnail
    );

    const videoURL = await uploadFile(
      `videos/files/${videoFile.name}`,
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
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Upload New Video</h1>

      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          placeholder="Video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border px-3 py-2 rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          placeholder="Duration (e.g. 03:15)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div>
          <p className="text-sm font-medium mb-1">Thumbnail</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Video File</p>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />
        </div>

        <button
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded"
        >
          {loading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </main>
  );
}
