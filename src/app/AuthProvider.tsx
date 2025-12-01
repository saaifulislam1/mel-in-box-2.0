// app/AuthProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

const getAdminEmails = (): string[] => {
  // From env: NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,another.admin@example.com
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminEmails = getAdminEmails();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser?.email) {
        const email = firebaseUser.email.toLowerCase();
        setIsAdmin(adminEmails.includes(email));
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
