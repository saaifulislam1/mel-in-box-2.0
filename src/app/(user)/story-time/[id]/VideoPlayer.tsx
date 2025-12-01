// src/app/story-time/[id]/VideoPlayer.tsx

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { incrementViewCount } from "@/lib/videoService";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function VideoPlayer({ id }: { id: string }) {
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchVideo() {
      const ref = doc(db, "videos", id);

      if (isMounted) setLoading(true);

      const snap = await getDoc(ref);

      if (snap.exists() && isMounted) {
        setVideo({ id: snap.id, ...snap.data() });
      }

      if (isMounted) setLoading(false);
    }

    fetchVideo();
    incrementViewCount(id);

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <p className="p-6">Loading video...</p>;
  if (!video) return <p className="p-6">Video not found.</p>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{video.title}</h1>

      <video
        controls
        src={video.videoURL}
        className="w-full max-w-3xl rounded shadow"
      />

      <p className="text-slate-600">{video.description}</p>
      <p className="text-sm text-slate-500">Tags: {video.tags.join(", ")}</p>
    </main>
  );
}
