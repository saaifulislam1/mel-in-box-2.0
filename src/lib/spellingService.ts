// src/lib/spellingService.ts

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export type SpellingProgress = {
  totalPoints: number;
  completedLevels: number[];
  levelScores: Record<string, number>;
  updatedAt?: unknown;
};

const progressDoc = (userId: string) => doc(db, "spellingProgress", userId);

export async function getSpellingProgress(
  userId: string
): Promise<SpellingProgress | null> {
  const snap = await getDoc(progressDoc(userId));
  if (!snap.exists()) return null;
  return snap.data() as SpellingProgress;
}

export async function saveSpellingLevel(
  userId: string,
  level: number,
  pointsEarned: number
) {
  const current = (await getSpellingProgress(userId)) || {
    totalPoints: 0,
    completedLevels: [],
    levelScores: {},
  };
  const previousScore = current.levelScores?.[String(level)] ?? 0;
  const bestScore = Math.max(previousScore, pointsEarned);

  const newCompleted = Array.from(
    new Set([...current.completedLevels, level])
  );
  const newLevelScores = {
    ...current.levelScores,
    [String(level)]: bestScore,
  };
  const delta = bestScore - previousScore;

  await setDoc(
    progressDoc(userId),
    {
      totalPoints: current.totalPoints + Math.max(delta, 0),
      completedLevels: newCompleted,
      levelScores: newLevelScores,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    totalPoints: current.totalPoints + Math.max(delta, 0),
    completedLevels: newCompleted,
    levelScores: newLevelScores,
  } as SpellingProgress;
}
