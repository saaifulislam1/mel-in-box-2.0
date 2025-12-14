// src/app/admin/reports/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  MessageCircleWarning,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  deleteSocialComment,
  deleteSocialPost,
  getSocialCommentById,
  getSocialPostById,
  getSocialReports,
  resolveSocialReport,
  type SocialComment,
  type SocialPost,
  type SocialReport,
} from "@/lib/socialService";
import { Spinner } from "@/components/Spinner";
import { useAdminGuard } from "@/hooks/useAdminGuard";

type ReportRow = SocialReport & { id: string };

export default function AdminReportsPage() {
  useAdminGuard();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReportRow | null>(null);
  const [post, setPost] = useState<(SocialPost & { id: string }) | null>(null);
  const [comment, setComment] = useState<(SocialComment & { id: string }) | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getSocialReports(100);
      setReports(data as ReportRow[]);
    } catch (err) {
      console.error("Failed to load reports", err);
      setError("Unable to load reports right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const openReport = async (r: ReportRow) => {
    setSelected(r);
    setPost(null);
    setComment(null);
    try {
      const postData = await getSocialPostById(r.postId);
      if (postData) setPost(postData);
      if (r.commentId) {
        const commentData = await getSocialCommentById(r.postId, r.commentId);
        if (commentData) setComment(commentData);
      }
    } catch (err) {
      console.error("Failed to load report details", err);
    }
  };

  const markResolved = async (id: string) => {
    setActionId(id);
    try {
      await resolveSocialReport(id);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)));
      if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, status: "resolved" } : prev));
    } catch (err) {
      console.error("Failed to resolve", err);
    } finally {
      setActionId(null);
    }
  };

  const removePost = async (postId: string, reportId: string) => {
    setActionId(reportId);
    try {
      await deleteSocialPost(postId);
      await resolveSocialReport(reportId);
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r)));
      setSelected((prev) => (prev ? { ...prev, status: "resolved" } : prev));
      setPost(null);
    } catch (err) {
      console.error("Failed to delete post", err);
    } finally {
      setActionId(null);
    }
  };

  const removeComment = async (postId: string, commentId: string, reportId: string) => {
    setActionId(reportId);
    try {
      await deleteSocialComment(postId, commentId);
      await resolveSocialReport(reportId);
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: "resolved" } : r)));
      setSelected((prev) => (prev ? { ...prev, status: "resolved" } : prev));
      setComment(null);
    } catch (err) {
      console.error("Failed to delete comment", err);
    } finally {
      setActionId(null);
    }
  };

  const statusColor = useMemo(
    () => ({
      open: "bg-amber-500/20 text-amber-100 border border-amber-500/40",
      resolved: "bg-emerald-500/20 text-emerald-100 border border-emerald-500/40",
    }),
    []
  );

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-3 text-slate-200 justify-between flex-wrap">
        <div className="flex items-center gap-2">
          <MessageCircleWarning className="w-5 h-5 text-amber-300" />
          <h1 className="text-xl font-semibold">Social Reports</h1>
        </div>
        <Link
          href="/admin/social"
          className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm hover:bg-white/15 transition"
        >
          Back to moderation
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-rose-100 bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading ? (
        <Spinner label="Loading reports..." />
      ) : reports.length === 0 ? (
        <div className="flex items-center gap-2 text-amber-100 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4" />
          No reports.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            {reports.map((r) => (
              <button
                key={r.id}
                onClick={() => openReport(r)}
                className={`w-full text-left rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow hover:bg-white/10 transition ${
                  selected?.id === r.id ? "border-amber-400" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-white font-semibold">
                      {r.commentId ? "Comment report" : "Post report"}
                    </p>
                    <p className="text-xs text-slate-300 line-clamp-2">{r.reason}</p>
                    <p className="text-[11px] text-slate-400">Post: {r.postId}</p>
                    {r.commentId && (
                      <p className="text-[11px] text-amber-200">Comment: {r.commentId}</p>
                    )}
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full ${statusColor[r.status || "open"]}`}>
                    {r.status || "open"}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg space-y-3 min-h-[360px]">
            {!selected ? (
              <p className="text-sm text-slate-300">Select a report to review.</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-white">
                      {selected.commentId ? "Comment report" : "Post report"}
                    </p>
                    <p className="text-sm text-slate-300">{selected.reason}</p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${statusColor[selected.status || "open"]}`}
                  >
                    {selected.status || "open"}
                  </span>
                </div>
                {post ? (
                  <div className="space-y-2">
                    <p className="text-slate-200 text-sm font-semibold">Post</p>
                    {post.content && <p className="text-slate-100 text-sm">{post.content}</p>}
                    {post.imageURL && (
                      <img
                        src={post.imageURL}
                        alt="Reported post"
                        className="w-full max-h-64 object-cover rounded-xl border border-white/10"
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Post not found or removed.</p>
                )}
                {comment && (
                  <div className="space-y-1 rounded-xl border border-amber-300/40 bg-amber-500/10 p-3">
                    <p className="text-sm text-white font-semibold">Reported comment</p>
                    <p className="text-xs text-slate-200">{comment.text}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => markResolved(selected.id)}
                    disabled={selected.status === "resolved" || actionId === selected.id}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {actionId === selected.id ? "Saving..." : "Mark resolved"}
                  </button>
                  {comment && (
                    <button
                      onClick={() => removeComment(selected.postId, selected.commentId!, selected.id)}
                      disabled={actionId === selected.id}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-rose-500 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete comment
                    </button>
                  )}
                  {post && (
                    <button
                      onClick={() => removePost(selected.postId, selected.id)}
                      disabled={actionId === selected.id}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-rose-700 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete post
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
