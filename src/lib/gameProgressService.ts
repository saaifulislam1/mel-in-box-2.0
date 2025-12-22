// src/lib/gameProgressService.ts

import { db } from "@/lib/firebase";
import { deleteDoc, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export type GameProgress = {
  totalPoints: number;
  completedLevels: number[];
  levelScores: Record<string, number>;
  updatedAt?: unknown;
};

type GameProgressDoc = {
  games?: Record<string, GameProgress>;
  updatedAt?: unknown;
};

export type GameSummary = {
  totalPoints: number;
  totalLevelsCompleted: number;
  totalGamesPlayed: number;
  games: Record<string, GameProgress>;
};

const progressDoc = (userId: string) => doc(db, "gameProgress", userId);

export async function getGameProgress(
  userId: string,
  gameId: string
): Promise<GameProgress | null> {
  const snap = await getDoc(progressDoc(userId));
  if (!snap.exists()) return null;
  const data = snap.data() as GameProgressDoc;
  return data.games?.[gameId] ?? null;
}

export async function saveGameLevel(
  userId: string,
  gameId: string,
  level: number,
  pointsEarned: number
): Promise<GameProgress> {
  const current = (await getGameProgress(userId, gameId)) || {
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

  const next: GameProgress = {
    totalPoints: current.totalPoints + Math.max(delta, 0),
    completedLevels: newCompleted,
    levelScores: newLevelScores,
  };

  await setDoc(
    progressDoc(userId),
    {
      games: {
        [gameId]: {
          ...next,
          updatedAt: serverTimestamp(),
        },
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return next;
}

export async function getTotalGamePoints(userId: string): Promise<number> {
  const snap = await getDoc(progressDoc(userId));
  if (!snap.exists()) return 0;
  const data = snap.data() as GameProgressDoc;
  if (!data.games) return 0;
  return Object.values(data.games).reduce(
    (sum, game) => sum + (game.totalPoints || 0),
    0
  );
}

export async function getGameSummary(userId: string): Promise<GameSummary> {
  const snap = await getDoc(progressDoc(userId));
  if (!snap.exists()) {
    return {
      totalPoints: 0,
      totalLevelsCompleted: 0,
      totalGamesPlayed: 0,
      games: {},
    };
  }
  const data = snap.data() as GameProgressDoc;
  const games = data.games ?? {};
  const values = Object.values(games);
  const totalPoints = values.reduce(
    (sum, game) => sum + (game.totalPoints || 0),
    0
  );
  const totalLevelsCompleted = values.reduce(
    (sum, game) => sum + (game.completedLevels?.length || 0),
    0
  );
  const totalGamesPlayed = values.filter(
    (game) => (game.completedLevels?.length || 0) > 0
  ).length;

  return {
    totalPoints,
    totalLevelsCompleted,
    totalGamesPlayed,
    games,
  };
}

export async function deleteGameProgress(userId: string) {
  await deleteDoc(progressDoc(userId));
}
