// src/hooks/useDressCart.ts

"use client";

import { useAuth } from "@/app/AuthProvider";
import { CourseData } from "@/lib/courseService";
import { useEffect, useMemo, useState } from "react";

export type CourseItem = CourseData & { id: string };

export function useDressCart() {
  const { user } = useAuth();
  const storageKey = useMemo(
    () => (user?.uid ? `dress-cart-${user.uid}` : "dress-cart-guest"),
    [user]
  );

  const [items, setItems] = useState<CourseItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(storageKey);
    let next: CourseItem[] = [];

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CourseItem[];
        next = Array.isArray(parsed) ? parsed : [];
      } catch {
        next = [];
      }
    }

    const timer = window.setTimeout(() => setItems(next), 0);
    return () => clearTimeout(timer);
  }, [storageKey]);

  const persist = (next: CourseItem[]) => {
    setItems(next);
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
  };

  const addItem = (course: CourseItem) => {
    setItems((prev) => {
      if (prev.some((c) => c.id === course.id)) return prev;
      const next = [...prev, course];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore storage failures
        }
      }
      return next;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore storage failures
        }
      }
      return next;
    });
  };

  const clearCart = () => persist([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (item.price ?? 0), 0),
    [items]
  );

  const isInCart = (id: string) => items.some((i) => i.id === id);

  return { items, addItem, removeItem, clearCart, total, isInCart };
}
