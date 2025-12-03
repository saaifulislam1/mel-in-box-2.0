// src/app/admin/social/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { Spinner } from "@/components/Spinner";
import {
  deleteSocialComment,
  deleteSocialPost,
  getSocialComments,
  getSocialPosts,
  type SocialPost,
} from "@/lib/socialService";
import {
  AlertCircle,
  CalendarClock,
  MessageSquare,
  Trash2,
} from "lucide-react";

type PostRow = SocialPost & { id: string; comments?: CommentRow[]; show?: boolean };
type CommentRow = {
  id: string;
  authorId: string;
  authorEmail?: string;
  authorName?: string | null;
  text: string;
  createdAt?: unknown;
};

export default function AdminSocialPage() {
  useAdminGuard();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<unknown>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async (cursor?: unknown, append = false) => {
    const setLoader = append ? setLoadingMore : setLoading;
    setLoader(true);
    try {
      const { posts: data, nextCursor } = await getSocialPosts(8, cursor);
      setPosts((prev) =>
        append ? [...prev, ...(data as PostRow[])] : (data as PostRow[])
      );
      setNextCursor(nextCursor);
    } catch (err) {
      console.error("Failed to load posts", err);
      if (!append) setPosts([]);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDeletePost = async (postId: string) => {
    setActionId(postId);
    try {
      await deleteSocialPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Failed to delete post", err);
    } finally {
      setActionId(null);
    }
  };

  const toggleComments = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post?.show) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, show: false } : p))
      );
      return;
    }
    try {
      const comments = await getSocialComments(postId, 20);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments, show: true } : p
        )
      );
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await deleteSocialComment(postId, commentId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: (p.comments || []).filter((c) => c.id !== commentId),
                commentCount: Math.max((p.commentCount || 1) - 1, 0),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-2 text-slate-200">
        <CalendarClock className="w-5 h-5 text-amber-300" />
        <h1 className="text-xl font-semibold">Social moderation</h1>
      </div>

      {loading ? (
        <Spinner label="Loading posts..." />
      ) : posts.length === 0 ? (
        <div className="flex items-center gap-2 text-amber-100 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4" />
          No posts yet.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white font-semibold">
                    {p.authorName || p.authorEmail || "User"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {p.createdAt?.toDate
                      ? p.createdAt.toDate().toLocaleString()
                      : ""}
                  </p>
                  <p className="text-xs text-slate-400">
                    {p.authorEmail && `Owner: ${p.authorEmail}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePost(p.id)}
                  disabled={actionId === p.id}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500 text-white text-sm shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                  {actionId === p.id ? "Removing..." : "Delete post"}
                </button>
              </div>
              {p.content && (
                <p className="text-slate-100 text-sm leading-relaxed">
                  {p.content}
                </p>
              )}
              {p.imageURL && (
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <img
                    src={p.imageURL}
                    alt="Post"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span>Likes: {p.likeCount ?? 0}</span>
                <span>Comments: {p.commentCount ?? 0}</span>
              </div>
              <button
                onClick={() => toggleComments(p.id)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white text-sm border border-white/20 hover:bg-white/15 transition"
              >
                <MessageSquare className="w-4 h-4" />
                {p.show ? "Hide comments" : "View comments"}
              </button>

              {p.show && (
                <div className="space-y-2 border border-white/10 rounded-xl p-3 bg-white/5">
                  {(p.comments || []).length === 0 ? (
                    <p className="text-xs text-slate-300">No comments.</p>
                  ) : (
                    (p.comments || []).map((c) => (
                      <div
                        key={c.id}
                        className="flex items-start justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 border border-white/10"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {c.authorName || c.authorEmail || "User"}
                          </p>
                          <p className="text-xs text-slate-200">{c.text}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(p.id, c.id)}
                          className="p-1 rounded-full text-rose-300 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="flex justify-center">
          <button
            onClick={() => load(nextCursor, true)}
            disabled={loadingMore}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition disabled:opacity-60"
          >
            {loadingMore ? <Spinner label="Loading..." /> : "Load more"}
          </button>
        </div>
      )}
    </main>
  );
}
