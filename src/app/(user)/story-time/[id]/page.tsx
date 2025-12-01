// src/app/story-time/[id]/page.tsx

import VideoPlayer from "./VideoPlayer";

export default async function VideoPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params; // Next.js 14 behavior

  return <VideoPlayer id={id} />;
}
