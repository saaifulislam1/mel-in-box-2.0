// src/app/(user)/games/counting/page.tsx

"use client";

import { useMemo, useState } from "react";
import HeadingSection from "@/components/HeadingSection";
import useUserGuard from "@/hooks/useUserGuard";
import { useGameProgress } from "@/hooks/useGameProgress";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { useCelebration } from "@/hooks/useCelebration";
import { CheckCircle2, Hash, Play } from "lucide-react";
import { Spinner } from "@/components/Spinner";

const GAME_ID = "counting";

type Difficulty = "Easy" | "Medium" | "Hard";

type Shape = "circle" | "square" | "diamond";

type Level = {
  id: number;
  title: string;
  prompt: string;
  count: number;
  shape: Shape;
  color: string;
  difficulty: Difficulty;
  points: number;
};

const levels: Level[] = [
  { id: 1, title: "Bubble Party", prompt: "Count the bubbles.", count: 3, shape: "circle", color: "bg-sky-300", difficulty: "Easy", points: 60 },
  { id: 2, title: "Toy Blocks", prompt: "Count the blocks.", count: 4, shape: "square", color: "bg-amber-300", difficulty: "Easy", points: 70 },
  { id: 3, title: "Garden Pebbles", prompt: "Count the pebbles.", count: 5, shape: "circle", color: "bg-emerald-300", difficulty: "Easy", points: 80 },
  { id: 4, title: "Kite Rhombus", prompt: "Count the kites.", count: 6, shape: "diamond", color: "bg-fuchsia-300", difficulty: "Easy", points: 90 },
  { id: 5, title: "Candy Squares", prompt: "Count the candies.", count: 7, shape: "square", color: "bg-rose-300", difficulty: "Easy", points: 100 },
  { id: 6, title: "Raindrops", prompt: "Count the drops.", count: 8, shape: "circle", color: "bg-indigo-300", difficulty: "Easy", points: 110 },
  { id: 7, title: "Star Tiles", prompt: "Count the tiles.", count: 6, shape: "diamond", color: "bg-amber-400", difficulty: "Medium", points: 120 },
  { id: 8, title: "Playroom Dots", prompt: "Count the dots.", count: 7, shape: "circle", color: "bg-teal-300", difficulty: "Medium", points: 130 },
  { id: 9, title: "Puzzle Squares", prompt: "Count the squares.", count: 8, shape: "square", color: "bg-pink-300", difficulty: "Medium", points: 140 },
  { id: 10, title: "Magic Gems", prompt: "Count the gems.", count: 9, shape: "diamond", color: "bg-purple-300", difficulty: "Medium", points: 150 },
  { id: 11, title: "Ocean Bubbles", prompt: "Count the bubbles.", count: 10, shape: "circle", color: "bg-sky-400", difficulty: "Medium", points: 160 },
  { id: 12, title: "Sun Squares", prompt: "Count the squares.", count: 9, shape: "square", color: "bg-yellow-300", difficulty: "Medium", points: 170 },
  { id: 13, title: "Moon Tiles", prompt: "Count the tiles.", count: 8, shape: "diamond", color: "bg-indigo-400", difficulty: "Hard", points: 180 },
  { id: 14, title: "Forest Dots", prompt: "Count the dots.", count: 9, shape: "circle", color: "bg-emerald-400", difficulty: "Hard", points: 190 },
  { id: 15, title: "Candy Hearts", prompt: "Count the candies.", count: 10, shape: "square", color: "bg-rose-400", difficulty: "Hard", points: 200 },
  { id: 16, title: "Magic Diamonds", prompt: "Count the diamonds.", count: 11, shape: "diamond", color: "bg-fuchsia-400", difficulty: "Hard", points: 210 },
  { id: 17, title: "Sky Drops", prompt: "Count the drops.", count: 10, shape: "circle", color: "bg-cyan-400", difficulty: "Hard", points: 220 },
  { id: 18, title: "Golden Blocks", prompt: "Count the blocks.", count: 11, shape: "square", color: "bg-amber-400", difficulty: "Hard", points: 230 },
];

const difficultyPill: Record<Difficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

const shapeClass: Record<Shape, string> = {
  circle: "rounded-full",
  square: "rounded-lg",
  diamond: "rounded-md",
};

const shuffle = (values: number[]) => {
  const array = [...values];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const buildChoices = (answer: number) => {
  const options = new Set([answer]);
  while (options.size < 3) {
    const delta = Math.floor(Math.random() * 3) + 1;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const next = Math.max(1, answer + sign * delta);
    options.add(next);
  }
  return shuffle(Array.from(options));
};

export default function CountingGamePage() {
  useUserGuard();
  const { progress, loading, saving, saveLevel, unlocked } =
    useGameProgress(GAME_ID);
  const { isCelebrating, message, celebrate } = useCelebration();
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [choices, setChoices] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const background = useMemo(
    () =>
      "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.3),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.25),transparent_30%)]",
    []
  );

  const handleStart = (level: Level) => {
    setActiveLevel(level);
    setChoices(buildChoices(level.count));
    setFeedback(null);
  };

  const handleChoice = async (value: number) => {
    if (!activeLevel) return;
    if (value !== activeLevel.count) {
      setFeedback("Try again.");
      return;
    }
    const updated = await saveLevel(activeLevel.id, activeLevel.points);
    if (updated) {
      celebrate(`Correct! +${activeLevel.points} points`);
      setFeedback(`Correct! You earned ${activeLevel.points} points.`);
    } else {
      setFeedback("Could not save your score. Try again.");
    }
    setActiveLevel(null);
  };

  return (
    <main
      className={`min-h-screen bg-gradient-to-br from-cyan-50 via-amber-50 to-rose-50 text-slate-800 pb-16 pt-24 px-4 sm:px-5 ${background}`}
    >
      <div className="relative max-w-5xl mx-auto space-y-6">
        <HeadingSection
          href="/games"
          title="Counting Quest"
          textColor="text-cyan-700"
          icon={Hash}
        />
        <p className="text-center text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Count the shapes, tap the right number, and unlock the next level.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="rounded-2xl bg-white shadow border border-cyan-100 px-4 py-3 text-sm text-slate-700 flex items-center justify-between min-w-[220px]">
            <div>
              <p className="text-xs text-cyan-500 font-semibold">Total points</p>
              <p className="text-xl font-bold text-cyan-700">
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
        ) : activeLevel ? (
          <section className="rounded-3xl border border-cyan-100 bg-white shadow-lg p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs text-cyan-500 font-semibold">
                  Level {activeLevel.id}
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {activeLevel.title}
                </h2>
                <p className="text-sm text-slate-600">
                  {activeLevel.prompt}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                  difficultyPill[activeLevel.difficulty]
                }`}
              >
                {activeLevel.difficulty}
              </span>
            </div>

            <div className="rounded-3xl border border-cyan-100 bg-cyan-50/40 p-4">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 justify-items-center">
                {Array.from({ length: activeLevel.count }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-10 w-10 ${shapeClass[activeLevel.shape]} ${activeLevel.color}`}
                    style={
                      activeLevel.shape === "diamond"
                        ? { transform: "rotate(45deg)" }
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleChoice(choice)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {choice}
                </button>
              ))}
            </div>

            {feedback && (
              <div className="rounded-xl bg-cyan-50 border border-cyan-100 px-3 py-2 text-sm text-cyan-700">
                {feedback}
              </div>
            )}

            <button
              onClick={() => setActiveLevel(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold"
            >
              Back to levels
            </button>
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {levels.map((level) => {
              const isUnlocked = unlocked(level.id);
              const best = progress?.levelScores?.[String(level.id)];
              return (
                <article
                  key={level.id}
                  className={`rounded-3xl border border-cyan-100 bg-white shadow-lg p-4 sm:p-5 space-y-3 ${
                    !isUnlocked ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs text-cyan-500 font-semibold">
                        Level {level.id}
                      </p>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {level.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Count {level.count} shapes.
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                        difficultyPill[level.difficulty]
                      }`}
                    >
                      {level.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{level.points} pts</span>
                    {best ? (
                      <span className="text-emerald-600 font-semibold">
                        Best: {best}
                      </span>
                    ) : (
                      <span className="text-slate-400">No score yet</span>
                    )}
                  </div>
                  <button
                    disabled={!isUnlocked}
                    onClick={() => handleStart(level)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-50"
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
      </div>
      <CelebrationOverlay isOpen={isCelebrating} message={message} />
    </main>
  );
}
