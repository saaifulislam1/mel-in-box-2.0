// src/app/admin/social/page.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAuth } from "@/app/AuthProvider";
import { Spinner } from "@/components/Spinner";
import {
  deleteSocialComment,
  deleteSocialPost,
  getSocialComments,
  getSocialPosts,
  getSocialReports,
  resolveSocialReport,
  type SocialPost,
} from "@/lib/socialService";
import {
  AlertCircle,
  CalendarClock,
  MessageSquare,
  Trash2,
  RefreshCw,
} from "lucide-react";

type PostRow = SocialPost & {
  id: string;
  comments?: CommentRow[];
  show?: boolean;
};
type CommentRow = {
  id: string;
  authorId: string;
  authorEmail?: string;
  authorName?: string | null;
  text: string;
  createdAt?: unknown;
};
type ReportRow = {
  id: string;
  postId: string;
  commentId?: string;
  reason: string;
  reporterId?: string;
  reporterEmail?: string;
  status?: string;
  createdAt?: unknown;
};

export default function AdminSocialPage() {
  useAdminGuard();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<unknown>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [commentDeleting, setCommentDeleting] = useState<
    Record<string, boolean>
  >({});
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);

  const MiniSpinner = () => (
    <span
      className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
      aria-label="Loading"
    />
  );

  const load = async (cursor?: unknown, append = false) => {
    if (!user) return;
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
    if (!authLoading && user && isAdmin) {
      load();
    }
  }, [authLoading, user, isAdmin]);

  const loadReports = async () => {
    if (!user) return;
    setReportsLoading(true);
    try {
      const data = await getSocialReports(50);
      setReports(data as ReportRow[]);
    } catch (err) {
      console.error("Failed to load reports", err);
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadReports();
    }
  }, [authLoading, user, isAdmin]);

  useEffect(() => {
    if (!nextCursor) return;
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loadingMore && !loading) {
          load(nextCursor, true);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, loading]);

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
      const commentsRaw = await getSocialComments(postId, 20);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const comments: CommentRow[] = commentsRaw.map((c: any) => ({
        id: c.id,
        authorId: c.authorId ?? "",
        authorEmail: c.authorEmail,
        authorName: c.authorName,
        text: c.text ?? "",
        createdAt: c.createdAt,
      }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments, show: true } : p))
      );
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    setCommentDeleting((prev) => ({ ...prev, [commentId]: true }));
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
    } finally {
      setCommentDeleting((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await resolveSocialReport(reportId);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, status: "resolved" } : r
        )
      );
    } catch (err) {
      console.error("Failed to resolve report", err);
    }
  };

  const openReport = async (report: ReportRow) => {
    setSelectedReport(report);
    // ensure comments loaded if needed
    if (report.commentId) {
      await toggleComments(report.postId);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setPosts([]);
    setNextCursor(null);
    load();
    loadReports();
  };

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-3 text-slate-200 justify-between flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-amber-300" />
          <h1 className="text-xl font-semibold">Social moderation</h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || reportsLoading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-white text-sm hover:bg-white/10 transition disabled:opacity-60"
        >
          {loading || reportsLoading ? (
            <Spinner label="Refreshing..." />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg space-y-3 animate-pulse"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-3 w-40 bg-white/20 rounded-full" />
                  <div className="h-3 w-24 bg-white/10 rounded-full" />
                </div>
                <div className="h-9 w-28 bg-white/10 rounded-xl" />
              </div>
              <div className="h-3 w-full bg-white/10 rounded-full" />
              <div className="h-3 w-5/6 bg-white/10 rounded-full" />
              <div className="h-48 w-full bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>
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
                  {actionId === p.id ? (
                    <MiniSpinner />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {actionId === p.id ? "Removing..." : "Delete post"}
                </button>
              </div>
              {p.content && (
                <p className="text-slate-100 text-sm leading-relaxed">
                  {p.content}
                </p>
              )}
              {p.imageURL && (
                <div className="overflow-hidden rounded-xl border border-white/10 w-fit">
                  <img
                    src={p.imageURL}
                    alt="Post"
                    className="w-[550px] h-[300px] object-cover"
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
                          disabled={commentDeleting[c.id]}
                          className="p-1 rounded-full text-rose-300 hover:bg-rose-500/20"
                        >
                          {commentDeleting[c.id] ? (
                            <MiniSpinner />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
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

      {!!nextCursor && (
        <>
          <div ref={loadMoreRef} className="h-10" />
          <div className="flex justify-center">
            <button
              onClick={() => load(nextCursor, true)}
              disabled={loadingMore}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition disabled:opacity-60"
            >
              {loadingMore ? <Spinner label="Loading..." /> : "Load more"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
