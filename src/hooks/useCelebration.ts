// src/hooks/useCelebration.ts

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCelebration(durationMs = 1400) {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [message, setMessage] = useState("");
  const timerRef = useRef<number | null>(null);

  const celebrate = useCallback(
    (text: string) => {
      setMessage(text);
      setIsCelebrating(true);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setIsCelebrating(false);
      }, durationMs);
    },
    [durationMs]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { isCelebrating, message, celebrate };
}
