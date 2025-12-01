// src/hooks/useAdminGuard.ts

"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/AuthProvider";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function useAdminGuard() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/admin/login");
      return;
    }

    if (!isAdmin) {
      signOut(auth);
      router.push("/admin/login");
    }
  }, [user, loading, isAdmin, router]);
}
