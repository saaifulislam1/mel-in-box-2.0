// src/hooks/useDressAccess.ts

"use client";

import { useAuth } from "@/app/AuthProvider";
import { CourseData } from "@/lib/courseService";
import { useEffect, useMemo, useState } from "react";

export type PurchasedCourse = CourseData & { id: string; purchasedAt: number };

export function useDressAccess() {
  const { user } = useAuth();
  const storageKey = useMemo(
    () => (user?.uid ? `dress-owned-${user.uid}` : "dress-owned-guest"),
    [user]
  );
  const [owned, setOwned] = useState<PurchasedCourse[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(storageKey);
    let next: PurchasedCourse[] = [];

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PurchasedCourse[];
        next = Array.isArray(parsed) ? parsed : [];
      } catch {
        next = [];
      }
    }

    const timer = window.setTimeout(() => setOwned(next), 0);
    return () => clearTimeout(timer);
  }, [storageKey]);

  const persist = (next: PurchasedCourse[]) => {
    setOwned(next);
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore storage write errors
    }
  };

  const addPurchased = (courses: (CourseData & { id: string })[]) => {
    const now = Date.now();
    setOwned((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const next = [
        ...prev,
        ...courses
          .filter((c) => !existingIds.has(c.id))
          .map((c) => ({ ...c, purchasedAt: now })),
      ];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  const clearOwned = () => persist([]);
  const isOwned = (id: string) => owned.some((c) => c.id === id);

  return { owned, addPurchased, isOwned, clearOwned };
}
