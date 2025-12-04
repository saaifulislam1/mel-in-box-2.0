// src/lib/socialService.ts

import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export type SocialPost = {
  authorId: string;
  authorEmail?: string;
  authorName?: string | null;
  content?: string;
  imageURL?: string;
  likeCount?: number;
  commentCount?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
};

export type SocialComment = {
  authorId: string;
  authorEmail?: string;
  authorName?: string | null;
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
};

const postsCol = collection(db, "socialPosts");
const postDoc = (id: string) => doc(db, "socialPosts", id);
const likesCol = (postId: string) => collection(postDoc(postId), "likes");
const likeDoc = (postId: string, userId: string) =>
  doc(db, "socialPosts", postId, "likes", userId);
const commentsCol = (postId: string) =>
  collection(postDoc(postId), "comments");

const cleanUndefined = (obj: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );

export async function createSocialPost(data: SocialPost) {
  const payload = cleanUndefined({
    ...data,
    likeCount: 0,
    commentCount: 0,
    createdAt: serverTimestamp(),
  });
  return await addDoc(postsCol, payload);
}

export async function getSocialPosts(
  pageSize = 5,
  cursor?: unknown
): Promise<{ posts: any[]; nextCursor: unknown }> {
  let q = query(postsCol, orderBy("createdAt", "desc"), limit(pageSize));
  if (cursor) {
    q = query(postsCol, orderBy("createdAt", "desc"), startAfter(cursor), limit(pageSize));
  }
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
  const nextCursor = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1].data().createdAt : null;
  return { posts: docs, nextCursor };
}

export async function toggleSocialLike(postId: string, userId: string) {
  const likeRef = likeDoc(postId, userId);
  const existing = await getDoc(likeRef);
  if (existing.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(postDoc(postId), { likeCount: increment(-1) });
    return false;
  }
  await setDoc(likeRef, { userId });
  await updateDoc(postDoc(postId), { likeCount: increment(1) });
  return true;
}

export async function hasUserLiked(postId: string, userId: string) {
  const likeRef = likeDoc(postId, userId);
  const existing = await getDoc(likeRef);
  return existing.exists();
}

export async function addSocialComment(
  postId: string,
  data: SocialComment
) {
  const payload = cleanUndefined({
    ...data,
    createdAt: serverTimestamp(),
  });
  await addDoc(commentsCol(postId), payload);
  await updateDoc(postDoc(postId), { commentCount: increment(1) });
}

export async function getSocialComments(postId: string, pageSize = 10) {
  const q = query(
    commentsCol(postId),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteSocialComment(postId: string, commentId: string) {
  await deleteDoc(doc(db, "socialPosts", postId, "comments", commentId));
  await updateDoc(postDoc(postId), { commentCount: increment(-1) });
}

export async function deleteSocialPost(postId: string) {
  await deleteDoc(postDoc(postId));
}
