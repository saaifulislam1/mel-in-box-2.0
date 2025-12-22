// src/app/(user)/games/word-puzzle/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import HeadingSection from "@/components/HeadingSection";
import useUserGuard from "@/hooks/useUserGuard";
import { useGameProgress } from "@/hooks/useGameProgress";
import { BookOpen, Play, Shuffle, Sparkles } from "lucide-react";
import { Spinner } from "@/components/Spinner";

const GAME_ID = "word-puzzle";

type Difficulty = "Easy" | "Medium" | "Hard";

type Level = {
  id: number;
  word: string;
  clue: string;
  difficulty: Difficulty;
  points: number;
};

const levels: Level[] = [
  { id: 1, word: "cat", clue: "A furry friend who purrs", difficulty: "Easy", points: 50 },
  { id: 2, word: "sun", clue: "It warms the daytime sky", difficulty: "Easy", points: 60 },
  { id: 3, word: "tree", clue: "Tall plant with leaves", difficulty: "Easy", points: 70 },
  { id: 4, word: "cake", clue: "Sweet treat with frosting", difficulty: "Easy", points: 80 },
  { id: 5, word: "ball", clue: "You can bounce it", difficulty: "Easy", points: 90 },
  { id: 6, word: "fish", clue: "It swims in water", difficulty: "Easy", points: 100 },
  { id: 7, word: "rocket", clue: "It blasts off to space", difficulty: "Medium", points: 110 },
  { id: 8, word: "rainbow", clue: "Colors after the rain", difficulty: "Medium", points: 120 },
  { id: 9, word: "cupcake", clue: "Tiny cake in a wrapper", difficulty: "Medium", points: 130 },
  { id: 10, word: "jungle", clue: "A wild, leafy forest", difficulty: "Medium", points: 140 },
  { id: 11, word: "dolphin", clue: "A friendly ocean jumper", difficulty: "Medium", points: 150 },
  { id: 12, word: "picnic", clue: "Outdoor meal with snacks", difficulty: "Medium", points: 160 },
  { id: 13, word: "butterfly", clue: "Colorful winged insect", difficulty: "Hard", points: 175 },
  { id: 14, word: "playground", clue: "Swings and slides live here", difficulty: "Hard", points: 185 },
  { id: 15, word: "waterfall", clue: "A big falling stream", difficulty: "Hard", points: 195 },
  { id: 16, word: "telescope", clue: "Tool to see far stars", difficulty: "Hard", points: 210 },
  { id: 17, word: "adventure", clue: "An exciting journey", difficulty: "Hard", points: 220 },
  { id: 18, word: "storybook", clue: "A book full of tales", difficulty: "Hard", points: 230 },
];

const difficultyPill: Record<Difficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

const scrambleWord = (word: string) => {
  if (word.length < 2 || new Set(word).size === 1) return word;
  const letters = word.split("");
  for (let i = letters.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const scrambled = letters.join("");
  return scrambled === word ? scrambleWord(word) : scrambled;
};

export default function WordPuzzlePage() {
  useUserGuard();
  const { progress, loading, saving, saveLevel, unlocked } =
    useGameProgress(GAME_ID);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [input, setInput] = useState("");
  const [scrambled, setScrambled] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const background = useMemo(
    () =>
      "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.3),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.25),transparent_30%)]",
    []
  );

  useEffect(() => {
    if (!activeLevel) return;
    setScrambled(scrambleWord(activeLevel.word));
  }, [activeLevel]);

  const handleStart = (level: Level) => {
    setActiveLevel(level);
    setInput("");
    setFeedback(null);
  };

  const handleShuffle = () => {
    if (!activeLevel) return;
    setScrambled(scrambleWord(activeLevel.word));
  };

  const handleSubmit = async () => {
    if (!activeLevel) return;
    const correct =
      input.trim().toLowerCase() === activeLevel.word.toLowerCase();
    if (!correct) {
      setFeedback("Oops! Try again and use the clue.");
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
  };

  return (
    <main
      className={`min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-rose-50 text-slate-800 pb-16 pt-24 px-4 sm:px-5 ${background}`}
    >
      <div className="relative max-w-5xl mx-auto space-y-6">
        <HeadingSection
          href="/games"
          title="Word Puzzle"
          textColor="text-indigo-700"
          icon={BookOpen}
        />
        <p className="text-center text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Unscramble the letters, solve the clue, and collect points across 18
          levels.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="rounded-2xl bg-white shadow border border-indigo-100 px-4 py-3 text-sm text-slate-700 flex items-center justify-between min-w-[220px]">
            <div>
              <p className="text-xs text-indigo-500 font-semibold">Total points</p>
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
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
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
                      <p className="text-sm text-slate-600">{lvl.clue}</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
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
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Unscramble the letters to win.</span>
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
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs text-indigo-500 font-semibold">
                  Level {activeLevel.id}
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  Unscramble the word
                </h3>
                <p className="text-sm text-slate-600">{activeLevel.clue}</p>
              </div>
              <button
                onClick={handleShuffle}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {scrambled.split("").map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-lg font-semibold text-indigo-700"
                >
                  {letter}
                </span>
              ))}
            </div>
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
                <Sparkles className="w-4 h-4 text-indigo-400" />
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
