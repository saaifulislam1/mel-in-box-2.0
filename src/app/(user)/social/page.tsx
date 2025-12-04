/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(user)/social/page.tsx

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  addSocialComment,
  createSocialPost,
  deleteSocialComment,
  deleteSocialPost,
  getSocialComments,
  getSocialPosts,
  hasUserLiked,
  toggleSocialLike,
  type SocialPost,
} from "@/lib/socialService";
import { uploadGalleryFile } from "@/lib/galleryService";
import { useAuth } from "@/app/AuthProvider";
import useUserGuard from "@/hooks/useUserGuard";
import { Spinner } from "@/components/Spinner";
import {
  Camera,
  Handshake,
  Heart,
  MessageSquare,
  Plus,
  Send,
  Share2,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import HeadingSection from "@/components/HeadingSection";

type PostRow = SocialPost & {
  id: string;
  liked?: boolean;
  comments?: CommentRow[];
  showComments?: boolean;
  visibleComments?: number;
};

type CommentRow = {
  id: string;
  authorId: string;
  authorEmail?: string;
  authorName?: string | null;
  text: string;
  createdAt?: unknown;
};

type SerializedPostRow = Omit<PostRow, "createdAt"> & { createdAt?: string };
type CachePayload = {
  posts: SerializedPostRow[];
  nextCursor: unknown;
  liked: Record<string, boolean>;
};

const POSTS_PAGE_SIZE = 10;
const COMMENT_INITIAL_VISIBLE = 3;
const COMMENT_INCREMENT = 5;
const COMMENT_FETCH_SIZE = 50;

const MiniSpinner = () => (
  <span
    className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
    aria-label="Loading"
  />
);

// Simple in-memory cache to reduce reload cost
let postsCache: PostRow[] | null = null;
let cursorCache: unknown | null = null;
const likedCache: Record<string, boolean> = {};

const cacheKey = (userId: string) => `social-cache:${userId}`;

const serializeDate = (value: unknown) => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  // Firestore Timestamp has toDate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((value as any).toDate) return (value as any).toDate().toISOString();
  return undefined;
};

const serializePosts = (list: PostRow[]): SerializedPostRow[] =>
  list.map((p) => ({
    ...p,
    createdAt: serializeDate(p.createdAt),
  }));

const deserializePosts = (list: SerializedPostRow[]): PostRow[] =>
  list.map((p) => ({
    ...p,
    createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
  }));

const readCache = (userId: string): CachePayload | null => {
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as CachePayload;
  } catch (err) {
    console.warn("Failed to read social cache", err);
    return null;
  }
};

const writeCache = (
  userId: string,
  posts: PostRow[],
  nextCursor: unknown,
  liked: Record<string, boolean>
) => {
  try {
    const payload: CachePayload = {
      posts: serializePosts(posts),
      nextCursor,
      liked,
    };
    localStorage.setItem(cacheKey(userId), JSON.stringify(payload));
  } catch (err) {
    console.warn("Failed to write social cache", err);
  }
};

const clearMemoryCache = () => {
  postsCache = null;
  cursorCache = null;
  Object.keys(likedCache).forEach((k) => delete likedCache[k]);
};

const formatCreatedAt = (value: unknown) => {
  if (!value) return "";
  if (value instanceof Date) return value.toLocaleString();
  if (typeof value === "string") return new Date(value).toLocaleString();
  // Firestore Timestamp has toDate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((value as any).toDate) return (value as any).toDate().toLocaleString();
  return "";
};

export default function SocialPage() {
  useUserGuard();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<unknown>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );
  const [commentSubmitting, setCommentSubmitting] = useState<
    Record<string, boolean>
  >({});
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>(
    {}
  );
  const [postDeleting, setPostDeleting] = useState<Record<string, boolean>>({});
  const [commentDeleting, setCommentDeleting] = useState<
    Record<string, boolean>
  >({});
  const [composerOpen, setComposerOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const syncCache = (postList: PostRow[], cursorVal: unknown = nextCursor) => {
    if (!user?.uid) return;
    postsCache = postList;
    cursorCache = cursorVal;
    writeCache(user.uid, postList, cursorVal, likedCache);
  };

  const updatePosts = (
    updater: (prev: PostRow[]) => PostRow[],
    cursorVal: unknown = nextCursor
  ) => {
    setPosts((prev) => {
      const updated = updater(prev);
      syncCache(updated, cursorVal);
      return updated;
    });
  };

  const canPost = useMemo(() => content.trim().length > 0, [content]);

  const load = useCallback(
    async (
      cursor?: unknown,
      append = false,
      options?: { allowMemoryCache?: boolean; background?: boolean }
    ) => {
      if (!user) return;
      const allowMemoryCache = options?.allowMemoryCache ?? true;
      const background = options?.background ?? false;
      const setLoadingState = append ? setLoadingMore : setLoading;
      if (!background) setLoadingState(true);
      try {
        if (!cursor && allowMemoryCache && postsCache) {
          setPosts(postsCache);
          setNextCursor(cursorCache);
          if (!background) setLoadingState(false);
          return;
        }

        const { posts: data, nextCursor } = await getSocialPosts(
          POSTS_PAGE_SIZE,
          cursor
        );
        const withLikes = await Promise.all(
          data.map(async (p) => {
            const liked =
              likedCache[p.id] ?? (await hasUserLiked(p.id, user.uid));
            likedCache[p.id] = liked;
            return { ...(p as PostRow), liked };
          })
        );
        const merged = append ? [...posts, ...withLikes] : withLikes;
        setPosts(merged);
        setNextCursor(nextCursor);
        syncCache(merged, nextCursor);
      } catch (err) {
        console.error("Failed to load posts", err);
        if (!append) setPosts([]);
      } finally {
        if (!background) setLoadingState(false);
      }
    },
    [user, posts]
  );

  useEffect(() => {
    clearMemoryCache();

    if (!user?.uid) {
      setPosts([]);
      setNextCursor(null);
      setLoading(false);
      return;
    }

    const cached = readCache(user.uid);
    if (cached) {
      const hydratedPosts = deserializePosts(cached.posts);
      postsCache = hydratedPosts;
      cursorCache = cached.nextCursor;
      Object.assign(likedCache, cached.liked);
      setPosts(hydratedPosts);
      setNextCursor(cached.nextCursor);
      setLoading(false);
    } else {
      setPosts([]);
      setNextCursor(null);
      setLoading(true);
    }

    load(undefined, false, {
      allowMemoryCache: false,
      background: !!cached,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewerImage(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!nextCursor) return;
    const node = loadMoreRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loadingMore && !loading) {
          load(nextCursor, true, { allowMemoryCache: false });
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [nextCursor, load, loadingMore, loading]);

  const handleCreate = async () => {
    if (!user || !canPost) return;
    setCreating(true);
    try {
      let imageURL: string | undefined;
      if (imageFile) {
        imageURL = await uploadGalleryFile(
          `social/${user.uid}-${Date.now()}-${imageFile.name}`,
          imageFile
        );
      }
      const ref = await createSocialPost({
        authorId: user.uid,
        authorEmail: user.email || undefined,
        authorName: user.displayName || undefined,
        content: content.trim(),
        ...(imageURL ? { imageURL } : {}),
      });
      const newPost: PostRow = {
        id: ref.id,
        authorId: user.uid,
        authorEmail: user.email || undefined,
        authorName: user.displayName || undefined,
        content: content.trim(),
        ...(imageURL ? { imageURL } : {}),
        likeCount: 0,
        commentCount: 0,
        liked: false,
        createdAt: new Date(),
      };
      updatePosts((prev) => [newPost, ...prev]);
      setContent("");
      setImageFile(null);
    } catch (err) {
      console.error("Failed to create post", err);
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    updatePosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const liked = !p.liked;
        likedCache[postId] = liked;
        return {
          ...p,
          liked,
          likeCount: (p.likeCount || 0) + (p.liked ? -1 : 1),
        };
      })
    );
    try {
      await toggleSocialLike(postId, user.uid);
    } catch (err) {
      console.error("Failed to toggle like", err);
      load(undefined, false, { allowMemoryCache: false });
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user) return;
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const optimisticComment: CommentRow = {
      id: `temp-${Date.now()}`,
      authorId: user.uid,
      authorEmail: user.email || undefined,
      authorName: user.displayName || undefined,
      text,
      createdAt: new Date(),
    };
    setCommentErrors((prev) => ({ ...prev, [postId]: "" }));
    setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    updatePosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const comments = p.comments || [];
        const updated = [optimisticComment, ...comments];
        const visible = Math.min(
          updated.length,
          (p.visibleComments ?? COMMENT_INITIAL_VISIBLE) + 1
        );
        return {
          ...p,
          comments: updated,
          commentCount: (p.commentCount || 0) + 1,
          showComments: true,
          visibleComments: visible,
        };
      })
    );
    try {
      await addSocialComment(postId, {
        authorId: user.uid,
        authorEmail: user.email || undefined,
        authorName: user.displayName || undefined,
        text,
      });
      await loadComments(postId);
    } catch (err) {
      console.error("Failed to add comment", err);
      setCommentErrors((prev) => ({
        ...prev,
        [postId]: "Failed to post comment. Please retry.",
      }));
      updatePosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: (p.comments || []).filter(
                  (c) => c.id !== optimisticComment.id
                ),
                commentCount: Math.max((p.commentCount || 1) - 1, 0),
              }
            : p
        )
      );
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const comments = await getSocialComments(postId, COMMENT_FETCH_SIZE);
      const typedComments: CommentRow[] = comments.map((c) => ({
        id: c.id as string,
        authorId: (c as any).authorId ?? "",
        authorEmail: (c as any).authorEmail,
        authorName: (c as any).authorName,
        text: (c as any).text ?? "",
        createdAt: (c as any).createdAt,
      }));
      updatePosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: typedComments,
                showComments: true,
                visibleComments: Math.max(
                  p.visibleComments ?? 0,
                  Math.min(COMMENT_INITIAL_VISIBLE, typedComments.length)
                ),
              }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const toggleComments = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post?.showComments) {
      updatePosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, showComments: false } : p))
      );
    } else {
      if (post?.comments?.length) {
        updatePosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  showComments: true,
                  visibleComments: Math.max(
                    p.visibleComments ?? 0,
                    Math.min(COMMENT_INITIAL_VISIBLE, p.comments?.length || 0)
                  ),
                }
              : p
          )
        );
      } else {
        await loadComments(postId);
      }
    }
  };

  const handleShowMoreComments = (postId: string) => {
    updatePosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const total = p.comments?.length || 0;
        const current = p.visibleComments ?? 0;
        const next = Math.min(total, current + COMMENT_INCREMENT);
        return { ...p, visibleComments: next };
      })
    );
  };

  const handleDeletePost = async (postId: string) => {
    setPostDeleting((prev) => ({ ...prev, [postId]: true }));
    try {
      await deleteSocialPost(postId);
      updatePosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Failed to delete post", err);
    } finally {
      setPostDeleting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    setCommentDeleting((prev) => ({ ...prev, [commentId]: true }));
    try {
      await deleteSocialComment(postId, commentId);
      updatePosts((prev) =>
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

  const handleRefresh = () => {
    if (!user) return;
    clearMemoryCache();
    setLoading(true);
    load(undefined, false, { allowMemoryCache: false });
  };

  const handleShare = async (postId: string) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/social#${postId}`
      );
      alert("Link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  return (
    <main className="px-4 space-y-8 bg-gradient-to-br  from-pink-100 via-rose-100 to-amber-50 min-h-screen -mx-4 sm:mx-0 pb-16 pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-0 mt-20">
        {/* <Link
          href="/"
          className="inline-flex items-center  px-3 py-3 mb-9 rounded-full bg-white/70 border border-pink-200 text-pink-600 shadow-sm hover:shadow transition"
        >
          ← Back Home
        </Link> */}
        <HeadingSection
          href="/"
          textColor="text-pink-600"
          title="Social Fun"
          icon={Handshake}
        />
        <div className="flex mt-6 w-full items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-pink-700 font-semibold">
            <p>Latest posts</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-pink-200 bg-white text-pink-600 shadow-sm hover:-translate-y-0.5 transition disabled:opacity-60"
            >
              {loading ? (
                <MiniSpinner />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </button>
            <button
              onClick={() => setComposerOpen((v) => !v)}
              className="p-3 items-end rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow hover:-translate-y-0.5 transition"
              aria-label="Create post"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {composerOpen && (
          <section className="rounded-3xl bg-white/90 border border-pink-200 shadow-lg p-4 mx-2  md:mx-30 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-lg">
                {user?.displayName?.[0] || "U"}
              </div>
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={2}
                  placeholder="Share your party memories and fun moments! 🎉"
                  className="w-full rounded-2xl border border-pink-200 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-pink-200 bg-white text-sm text-pink-600 cursor-pointer hover:border-pink-300">
                    <Camera className="w-4 h-4" />
                    <span className="max-w-[140px] truncate">
                      {imageFile ? imageFile.name : "Add Photo (optional)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>
                  <button
                    onClick={handleCreate}
                    disabled={!canPost || creating}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                  >
                    {creating ? <Spinner label="Posting..." /> : "Post 🎉"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-5 mt-6  md:px-30">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white shadow-lg border border-pink-100 p-5 space-y-4 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-32 bg-pink-100 rounded-full" />
                      <div className="h-3 w-20 bg-pink-50 rounded-full" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-pink-50 rounded-full" />
                  <div className="h-3 w-5/6 bg-pink-50 rounded-full" />
                  <div className="h-56 w-full bg-pink-50 rounded-2xl" />
                  <div className="flex justify-between">
                    <div className="h-8 w-20 bg-pink-50 rounded-full" />
                    <div className="h-8 w-24 bg-pink-50 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-pink-200 bg-white/80 p-5 text-pink-700">
              No posts yet. Be the first to share!
            </div>
          ) : (
            posts.map((p) => (
              <article
                key={p.id}
                className={`rounded-3xl bg-white shadow-lg border border-pink-200 w-full mx-0 p-5 space-y-3 ${
                  p.imageURL ? "min-h-[410px]" : ""
                }`}
                id={p.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-sm">
                      {p.authorName?.[0] || p.authorEmail?.[0] || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {p.authorName || p.authorEmail || "User"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatCreatedAt(p.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.authorId === user?.uid && (
                      <button
                        onClick={() => handleDeletePost(p.id)}
                        disabled={postDeleting[p.id]}
                        className="p-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition disabled:opacity-60"
                      >
                        {postDeleting[p.id] ? (
                          <MiniSpinner />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleShare(p.id)}
                      className="p-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {p.content && (
                  <p className="text-slate-800 text-sm leading-relaxed">
                    {p.content}
                  </p>
                )}
                {p.imageURL && (
                  <button
                    type="button"
                    onClick={() => setViewerImage(p.imageURL || null)}
                    className="overflow-hidden rounded-2xl border border-pink-100 w-full block focus:outline-none focus:ring-2 focus:ring-pink-200"
                  >
                    <img
                      src={p.imageURL}
                      alt="Post"
                      className="w-full h-[430px] md:h-[550px] object-cover transition duration-150 hover:scale-[1.01]"
                    />
                  </button>
                )}

                <div className="flex items-center justify-between text-sm text-slate-600">
                  <button
                    onClick={() => handleLike(p.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${
                      p.liked
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${p.liked ? "fill-rose-500" : ""}`}
                    />
                    {p.likeCount || 0}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleComments(p.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full border bg-slate-50 border-slate-200 text-slate-700"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {p.commentCount || 0} comments
                    </button>
                  </div>
                </div>

                {p.showComments && (
                  <div className="border border-pink-100 rounded-2xl p-3 space-y-3 bg-pink-50/50">
                    <div className="flex items-center gap-2">
                      <input
                        value={commentInputs[p.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [p.id]: e.target.value,
                          }))
                        }
                        placeholder="Add a comment..."
                        className="flex-1 rounded-full border border-pink-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                      />
                      <button
                        onClick={() => handleAddComment(p.id)}
                        disabled={commentSubmitting[p.id]}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-pink-500 text-white text-sm disabled:opacity-60"
                      >
                        {commentSubmitting[p.id] ? (
                          <Spinner label="Sending..." />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send
                          </>
                        )}
                      </button>
                    </div>
                    {commentErrors[p.id] ? (
                      <p className="text-xs text-rose-500">
                        {commentErrors[p.id]}
                      </p>
                    ) : null}
                    <div className="space-y-2">
                      {(p.comments || []).length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No comments yet.
                        </p>
                      ) : (
                        <>
                          {(() => {
                            const total = p.comments?.length || 0;
                            const visibleCount =
                              p.visibleComments ?? COMMENT_INITIAL_VISIBLE;
                            return (
                              <>
                                {(p.comments || [])
                                  .slice(0, visibleCount)
                                  .map((c) => (
                                    <div
                                      key={c.id}
                                      className="flex items-start justify-between gap-2 rounded-xl bg-white px-3 py-2 border border-pink-100"
                                    >
                                      <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                          {c.authorName ||
                                            c.authorEmail ||
                                            "User"}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {c.text}
                                        </p>
                                      </div>
                                      {c.authorId === user?.uid && (
                                        <button
                                          onClick={() =>
                                            handleDeleteComment(
                                              p.id,
                                              c.id as string
                                            )
                                          }
                                          disabled={commentDeleting[c.id]}
                                          className="p-1 rounded-full text-rose-500 hover:bg-rose-50 disabled:opacity-60"
                                        >
                                          {commentDeleting[c.id] ? (
                                            <MiniSpinner />
                                          ) : (
                                            <Trash2 className="w-4 h-4" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                {total > visibleCount && (
                                  <button
                                    onClick={() => handleShowMoreComments(p.id)}
                                    className="text-xs font-semibold text-pink-600 hover:text-pink-700"
                                  >
                                    Show more comments
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </section>

        {nextCursor ? (
          <>
            <div ref={loadMoreRef} className="h-10" />
            <div className="flex justify-center mt-6">
              <button
                onClick={() => load(nextCursor, true)}
                disabled={loadingMore}
                className="px-4 py-2 rounded-full bg-white border border-pink-200 text-pink-700 shadow hover:-translate-y-0.5 transition disabled:opacity-60"
              >
                {loadingMore ? <Spinner label="Loading..." /> : "Load more"}
              </button>
            </div>
          </>
        ) : null}
      </div>

      {viewerImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setViewerImage(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-white/5 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewerImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black/80 transition"
              aria-label="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={viewerImage}
              alt="Post preview"
              className="w-full max-h-[80vh] object-contain bg-black"
            />
          </div>
        </div>
      )}
    </main>
  );
}
