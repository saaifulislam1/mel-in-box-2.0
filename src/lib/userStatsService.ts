// src/lib/userStatsService.ts

import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  increment,
  deleteDoc,
} from "firebase/firestore";

export type UserStats = {
  storiesWatched: number;
  updatedAt?: unknown;
};

const statsDoc = (userId: string) => doc(db, "userStats", userId);

export async function getUserStats(userId: string): Promise<UserStats> {
  const snap = await getDoc(statsDoc(userId));
  if (!snap.exists()) {
    return { storiesWatched: 0 };
  }
  const data = snap.data() as UserStats;
  return {
    storiesWatched: data.storiesWatched ?? 0,
    updatedAt: data.updatedAt,
  };
}

export async function incrementStoryWatched(userId: string) {
  await setDoc(
    statsDoc(userId),
    {
      storiesWatched: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteUserStats(userId: string) {
  await deleteDoc(statsDoc(userId));
}
