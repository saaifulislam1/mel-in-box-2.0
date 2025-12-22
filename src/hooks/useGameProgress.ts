// src/hooks/useGameProgress.ts

"use client";

import { useAuth } from "@/app/AuthProvider";
import { useEffect, useState } from "react";
import {
  getGameProgress,
  saveGameLevel,
  type GameProgress,
} from "@/lib/gameProgressService";

export function useGameProgress(gameId: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      try {
        const data = await getGameProgress(user.uid, gameId);
        if (!mounted) return;
        if (data) setProgress(data);
      } catch (err) {
        console.error("Failed to load game progress", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user, gameId]);

  const saveLevel = async (levelId: number, points: number) => {
    if (!user) return null;
    setSaving(true);
    try {
      const updated = await saveGameLevel(user.uid, gameId, levelId, points);
      setProgress(updated);
      return updated;
    } catch (err) {
      console.error("Failed to save game level", err);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const unlocked = (levelId: number) => {
    if (!progress) return levelId === 1;
    const maxCompleted = Math.max(0, ...progress.completedLevels);
    return levelId <= maxCompleted + 1;
  };

  return { user, progress, loading, saving, saveLevel, unlocked };
}
