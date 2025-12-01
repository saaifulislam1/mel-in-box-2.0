// src/hooks/useUserGuard.ts

"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/AuthProvider";
import { useRouter } from "next/navigation";

export default function useUserGuard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login"); // redirect to login
    }
  }, [user, loading, router]);
}
