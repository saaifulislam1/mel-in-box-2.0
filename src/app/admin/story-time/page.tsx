// src/app/admin/story-time/page.tsx

"use client";

import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useEffect, useState } from "react";
import { getAllVideos, deleteVideo } from "@/lib/videoService";

export default function AdminStoryTimePage() {
  useAdminGuard();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // The real function we will reuse everywhere
  const loadVideos = async (isMounted = true) => {
    setLoading(true);
    const data = await getAllVideos();
    if (isMounted) {
      setVideos(data);
      setLoading(false);
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
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Manage Story Time Videos</h1>

      <a
        href="/admin/story-time/upload"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload New Video
      </a>

      {loading && <p>Loading videos...</p>}

      <div className="grid gap-4">
        {videos.map((v) => (
          <div
            key={v.id}
            className="bg-white p-4 rounded shadow flex items-start gap-4"
          >
            <img
              src={v.thumbnailURL}
              alt=""
              className="w-32 h-20 object-cover rounded"
            />

            <div className="flex-1">
              <h2 className="font-semibold">{v.title}</h2>
              <p className="text-sm text-slate-600">{v.description}</p>
              <p className="text-sm mt-1">Tags: {v.tags.join(", ")}</p>
            </div>

            <button
              onClick={async () => {
                await deleteVideo(v.id);
                loadVideos(); // NOW works
              }}
              className="px-3 py-2 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
