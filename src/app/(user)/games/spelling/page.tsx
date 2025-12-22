// src/app/(user)/games/spelling/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import HeadingSection from "@/components/HeadingSection";
import useUserGuard from "@/hooks/useUserGuard";
import { useGameProgress } from "@/hooks/useGameProgress";
import { BookOpen, PartyPopper, Play, Timer } from "lucide-react";
import { Spinner } from "@/components/Spinner";

type Level = {
  id: number;
  word: string;
  clue: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number; // seconds
  points: number;
  image: string;
};

const levels: Level[] = [
  {
    id: 1,
    word: "cat",
    clue: "A furry pet that says meow",
    difficulty: "Easy",
    timeLimit: 20,
    points: 50,
    image:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    word: "cake",
    clue: "Sweet birthday treat",
    difficulty: "Easy",
    timeLimit: 20,
    points: 60,
    image:
      "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    word: "frog",
    clue: "Green and jumps",
    difficulty: "Easy",
    timeLimit: 20,
    points: 70,
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    word: "cloud",
    clue: "Fluffy in the sky",
    difficulty: "Easy",
    timeLimit: 20,
    points: 80,
    image:
      "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    word: "magic",
    clue: "Wands and sparkles",
    difficulty: "Easy",
    timeLimit: 20,
    points: 90,
    image:
      "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 6,
    word: "ocean",
    clue: "Big blue water",
    difficulty: "Easy",
    timeLimit: 18,
    points: 100,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 7,
    word: "robot",
    clue: "Metal helper",
    difficulty: "Medium",
    timeLimit: 18,
    points: 110,
    image:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 8,
    word: "puzzle",
    clue: "Pieces that fit",
    difficulty: "Medium",
    timeLimit: 18,
    points: 120,
    image:
      "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 9,
    word: "dragon",
    clue: "Mythical fire-breather",
    difficulty: "Medium",
    timeLimit: 18,
    points: 130,
    image:
      "https://images.unsplash.com/photo-1600852521975-91f2b7cc9e33?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 10,
    word: "galaxy",
    clue: "Stars all together",
    difficulty: "Medium",
    timeLimit: 16,
    points: 140,
    image:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 11,
    word: "banana",
    clue: "Yellow fruit",
    difficulty: "Medium",
    timeLimit: 16,
    points: 150,
    image:
      "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 12,
    word: "castle",
    clue: "Home for a king",
    difficulty: "Medium",
    timeLimit: 16,
    points: 160,
    image:
      "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 13,
    word: "compass",
    clue: "Finds directions",
    difficulty: "Hard",
    timeLimit: 14,
    points: 175,
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 14,
    word: "whistle",
    clue: "Makes a sharp sound",
    difficulty: "Hard",
    timeLimit: 14,
    points: 185,
    image:
      "https://images.unsplash.com/photo-1605259690524-d3360c8bb6d0?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 15,
    word: "journey",
    clue: "Another word for trip",
    difficulty: "Hard",
    timeLimit: 14,
    points: 195,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 16,
    word: "phoenix",
    clue: "Bird reborn from ashes",
    difficulty: "Hard",
    timeLimit: 12,
    points: 210,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 17,
    word: "triangle",
    clue: "Three-sided shape",
    difficulty: "Hard",
    timeLimit: 12,
    points: 220,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 18,
    word: "adventure",
    clue: "Exciting experience",
    difficulty: "Hard",
    timeLimit: 12,
    points: 230,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80",
  },
];

const GAME_ID = "spelling";

const difficultyPill: Record<Level["difficulty"], string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

export default function SpellingGamePage() {
  useUserGuard();
  const { progress, loading, saving, saveLevel, unlocked } =
    useGameProgress(GAME_ID);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [input, setInput] = useState("");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const gradient = useMemo(
    () =>
      "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.3),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.25),transparent_30%)]",
    []
  );

  useEffect(() => {
    if (!activeLevel) return;
    setSecondsLeft(activeLevel.timeLimit);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(timer);
          setFeedback("Time's up! Try again.");
          setActiveLevel(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeLevel]);

  const handleStart = (level: Level) => {
    setFeedback(null);
    setInput("");
    setActiveLevel(level);
  };

  const handleSubmit = async () => {
    if (!activeLevel) return;
    const correct =
      input.trim().toLowerCase() === activeLevel.word.toLowerCase();
    if (!correct) {
      setFeedback("Oops, check your spelling and try again!");
      setActiveLevel(null);
      return;
    }
    const updated = await saveLevel(activeLevel.id, activeLevel.points);
    if (updated) {
      setFeedback(`Great job! You earned ${activeLevel.points} points.`);
    } else {
      setFeedback("Could not save your score. Try again.");
    }
    setActiveLevel(null);
    setInput("");
    setSecondsLeft(null);
  };

  return (
    <main
      className={`min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-amber-50 text-slate-800 pb-16 pt-24 px-4 sm:px-5 ${gradient}`}
    >
      <div className="relative max-w-5xl mx-auto space-y-6">
        <HeadingSection
          href="/games"
          title="Spelling Adventure"
          textColor="text-indigo-700"
          icon={BookOpen}
        />
        <p className="text-center text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          18 levels of fun spelling practice. Beat the timer, earn points, and
          unlock the next challenge.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="rounded-2xl bg-white shadow border border-indigo-100 px-4 py-3 text-sm text-slate-700 flex items-center justify-between min-w-[220px]">
            <div>
              <p className="text-xs text-indigo-500 font-semibold">
                Total points
              </p>
              <p className="text-xl font-bold text-indigo-700">
                {progress?.totalPoints ?? 0}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Levels done</p>
              <p className="font-semibold text-slate-800">
                {(progress?.completedLevels?.length ?? 0)}/18
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner label="Loading progress..." />
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {levels.map((lvl) => {
              const isUnlocked = unlocked(lvl.id);
              const best = progress?.levelScores?.[String(lvl.id)];
              return (
                <article
                  key={lvl.id}
                  className={`rounded-3xl border border-indigo-100 bg-white shadow-lg p-4 sm:p-5 space-y-3 ${
                    !isUnlocked ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={lvl.image}
                          alt={lvl.word}
                          className="w-12 h-12 rounded-xl object-cover border border-indigo-100"
                        />
                        <div>
                          <p className="text-xs text-indigo-500 font-semibold">
                            Level {lvl.id}
                          </p>
                          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            {lvl.word}
                            <span
                              className={`px-2 py-1 rounded-full text-[11px] ${
                                difficultyPill[lvl.difficulty]
                              }`}
                            >
                              {lvl.difficulty}
                            </span>
                          </h3>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">{lvl.clue}</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <p className="inline-flex items-center gap-1">
                        <Timer className="w-4 h-4 text-indigo-400" />
                        {lvl.timeLimit}s
                      </p>
                      <p className="font-semibold text-indigo-600">
                        {lvl.points} pts
                      </p>
                      {best ? (
                        <p className="text-[11px] text-emerald-600 font-semibold">
                          Best score: {best}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <button
                    disabled={!isUnlocked}
                    onClick={() => handleStart(lvl)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    {isUnlocked ? "Play" : "Locked"}
                  </button>
                  {!isUnlocked && (
                    <p className="text-xs text-slate-500">
                      Unlock by finishing previous level.
                    </p>
                  )}
                </article>
              );
            })}
          </section>
        )}

        {feedback && (
          <div className="rounded-2xl bg-white shadow border border-indigo-100 px-4 py-3 text-sm text-slate-700">
            {feedback}
          </div>
        )}
      </div>

      {activeLevel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setActiveLevel(null)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-indigo-500 font-semibold">
                  Level {activeLevel.id}
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  Spell the word
                </h3>
                <p className="text-sm text-slate-600">{activeLevel.clue}</p>
              </div>
              <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                <Timer className="w-4 h-4" />
                {secondsLeft ?? activeLevel.timeLimit}s
              </div>
            </div>
            <img
              src={activeLevel.image}
              alt={activeLevel.word}
              className="w-full max-h-56 object-cover rounded-xl border border-indigo-100"
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Type the word..."
              autoFocus
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <PartyPopper className="w-4 h-4 text-rose-500" />
                {activeLevel.points} points on success
              </div>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
              >
                {saving ? <Spinner label="Saving..." /> : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
