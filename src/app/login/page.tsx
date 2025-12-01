// src/app/login/page.tsx

"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";

import { Star, Heart, Smile } from "lucide-react";

export default function UserLoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);

    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-100 via-purple-100 to-sky-100 px-4 overflow-hidden">
      {/* === FLOATING ICONS — LEFT SIDE === */}
      <div className="absolute left-3 top-10 animate-bounce-slow pointer-events-none">
        {/* <Star className="text-yellow-400 opacity-90" size={34} /> */}
        <Star className="absolute top-10 left-10 text-yellow-400 w-8 h-8 animate-bounce" />
      </div>
      <div className="absolute left-6 bottom-20 animate-bounce-slow-2 pointer-events-none">
        <Smile className="absolute bottom-4 left-20 text-blue-400 w-8 h-8 animate-bounce" />
      </div>
      {/* === FLOATING ICONS — RIGHT SIDE === */}
      <div className="absolute right-4 top-16 animate-bounce-slow-3 pointer-events-none">
        <Heart className="absolute top-20 right-20 text-pink-400 w-6 h-6 animate-pulse" />
      </div>

      <div className="absolute right-8 bottom-24 animate-bounce-slow pointer-events-none">
        <Star className="absolute bottom-32 right-16 text-purple-400 w-6 h-6 animate-pulse" />
      </div>
      {/* === LOGIN CARD === */}
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 space-y-6 border border-white/40">
        <div className="text-center space-y-2 mb-4">
          <img
            src="images/mel-logo.png" // <--- UPDATE THIS with your actual logo path
            alt="Mel In a Box Logo"
            className="w-28 h-28 mx-auto rounded-full object-contain"
          />

          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow">
            Mel In a Box
          </h1>

          <p className="text-slate-600 text-sm font-medium">
            Where Magic Comes Alive!
          </p>
        </div>

        {error && (
          <div className="text-sm bg-red-200 text-red-700 p-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full mt-1 px-4 py-2 rounded-xl border border-pink-300 bg-white/60 backdrop-blur focus:ring-2 focus:ring-pink-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full mt-1 px-4 py-2 rounded-xl border border-purple-300 bg-white/60 backdrop-blur focus:ring-2 focus:ring-purple-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Sign Up"}
          </button>
        </form>

        {/* GOOGLE BUTTON */}
        <button
          disabled={loading}
          onClick={handleGoogle}
          className="w-full py-3 rounded-xl bg-white text-slate-700 font-medium border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2 shadow"
        >
          <img src="/google.png" alt="google" className="w-5 h-5" />
          Continue with Google
        </button>

        {/* SWITCH MODE */}
        <p className="text-center text-sm text-slate-700">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-pink-600 font-semibold underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-pink-600 font-semibold underline"
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
      {/* === ANIMATION KEYFRAMES === */}
      {/* <style>
        {`
          .animate-bounce-slow {
            animation: bounce-slow 3s infinite ease-in-out;
          }
          .animate-bounce-slow-2 {
            animation: bounce-slow 3.4s infinite ease-in-out;
          }
          .animate-bounce-slow-3 {
            animation: bounce-slow 2.8s infinite ease-in-out;
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}
      </style> */}
    </main>
  );
}
