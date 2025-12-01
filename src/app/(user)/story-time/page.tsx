// src/app/(user)/story-time/page.tsx

"use client";

import { useEffect, useState } from "react";
import { getAllVideos } from "@/lib/videoService";

export default function StoryTimePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadVideos = async () => {
      setLoading(true);
      const data = await getAllVideos();
      if (!isMounted) return; // avoid state updates after unmount
      setVideos(data);
      setLoading(false);
    };

    loadVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Story Time</h1>

      {loading && <p>Loading videos...</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <a
            key={v.id}
            href={`/story-time/${v.id}`}
            className="bg-white rounded shadow p-3 block"
          >
            <img
              src={v.thumbnailURL}
              className="w-full h-40 object-cover rounded"
            />
            <h2 className="mt-2 font-semibold">{v.title}</h2>
            <p className="text-sm text-slate-500">{v.tags.join(", ")}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
