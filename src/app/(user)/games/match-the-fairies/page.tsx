// src/app/(user)/games/match-the-fairies/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import HeadingSection from "@/components/HeadingSection";
import useUserGuard from "@/hooks/useUserGuard";
import { useGameProgress } from "@/hooks/useGameProgress";
import { CheckCircle2, Play, RefreshCcw, Sparkles } from "lucide-react";
import { Spinner } from "@/components/Spinner";

const GAME_ID = "match-the-fairies";

type Difficulty = "Easy" | "Medium" | "Hard";

type Fairy = {
  id: string;
  name: string;
  symbol: string;
  gradient: string;
};

type Scene = {
  id: string;
  title: string;
  gradient: string;
};

type Level = {
  id: number;
  sceneId: string;
  title: string;
  difficulty: Difficulty;
  points: number;
  pairCount: number;
};

type Card = {
  id: string;
  fairyId: string;
};

const fairies: Fairy[] = [
  { id: "blossom", name: "Blossom", symbol: "BL", gradient: "from-pink-400 to-rose-500" },
  { id: "spark", name: "Spark", symbol: "SP", gradient: "from-amber-400 to-orange-500" },
  { id: "dewdrop", name: "Dewdrop", symbol: "DD", gradient: "from-cyan-400 to-sky-500" },
  { id: "meadow", name: "Meadow", symbol: "ME", gradient: "from-emerald-400 to-lime-500" },
  { id: "moonbeam", name: "Moonbeam", symbol: "MB", gradient: "from-indigo-400 to-violet-500" },
  { id: "twinkle", name: "Twinkle", symbol: "TW", gradient: "from-fuchsia-400 to-purple-500" },
  { id: "breeze", name: "Breeze", symbol: "BR", gradient: "from-sky-400 to-blue-500" },
  { id: "poppy", name: "Poppy", symbol: "PO", gradient: "from-rose-400 to-red-500" },
  { id: "willow", name: "Willow", symbol: "WI", gradient: "from-teal-400 to-emerald-500" },
  { id: "sunny", name: "Sunny", symbol: "SU", gradient: "from-yellow-300 to-amber-400" },
  { id: "glimmer", name: "Glimmer", symbol: "GL", gradient: "from-slate-300 to-slate-500" },
  { id: "opal", name: "Opal", symbol: "OP", gradient: "from-violet-300 to-indigo-400" },
];

const scenes: Scene[] = [
  { id: "meadow", title: "Meadow Dance", gradient: "from-emerald-50 via-lime-50 to-amber-50" },
  { id: "lake", title: "Rainbow Lake", gradient: "from-sky-50 via-cyan-50 to-blue-50" },
  { id: "grove", title: "Starlit Grove", gradient: "from-indigo-50 via-violet-50 to-fuchsia-50" },
  { id: "cove", title: "Crystal Cove", gradient: "from-cyan-50 via-teal-50 to-emerald-50" },
  { id: "garden", title: "Sunrise Garden", gradient: "from-rose-50 via-amber-50 to-yellow-50" },
  { id: "hollow", title: "Twilight Hollow", gradient: "from-slate-50 via-blue-50 to-indigo-50" },
];

const sceneById = Object.fromEntries(scenes.map((scene) => [scene.id, scene]));

const difficultyPill: Record<Difficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

const pointsByDifficulty: Record<Difficulty, number> = {
  Easy: 60,
  Medium: 90,
  Hard: 120,
};

const pairsByDifficulty: Record<Difficulty, number> = {
  Easy: 6,
  Medium: 8,
  Hard: 10,
};

const difficultyOrder: Difficulty[] = ["Easy", "Medium", "Hard"];

const levels: Level[] = scenes.flatMap((scene, index) =>
  difficultyOrder.map((difficulty, difficultyIndex) => ({
    id: index * difficultyOrder.length + difficultyIndex + 1,
    sceneId: scene.id,
    title: scene.title,
    difficulty,
    points: pointsByDifficulty[difficulty],
    pairCount: pairsByDifficulty[difficulty],
  }))
);

const shuffle = <T,>(items: T[]) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const getFairiesForLevel = (levelId: number, pairCount: number) => {
  const start = (levelId - 1) % fairies.length;
  const selected: Fairy[] = [];
  for (let i = 0; i < pairCount; i += 1) {
    selected.push(fairies[(start + i) % fairies.length]);
  }
  return selected;
};

const buildDeck = (levelId: number, pairCount: number) => {
  const picks = getFairiesForLevel(levelId, pairCount);
  const cards = picks.flatMap((fairy) => [
    { id: `${levelId}-${fairy.id}-a`, fairyId: fairy.id },
    { id: `${levelId}-${fairy.id}-b`, fairyId: fairy.id },
  ]);
  return shuffle(cards);
};

const FairyAvatar = ({
  fairy,
  size = "lg",
  showWings = true,
}: {
  fairy: Fairy;
  size?: "sm" | "lg";
  showWings?: boolean;
}) => {
  const base = size === "lg" ? "h-16 w-16" : "h-10 w-10";
  const wing = size === "lg" ? "h-8 w-5" : "h-6 w-4";
  const core = size === "lg" ? "h-9 w-9 text-xs" : "h-7 w-7 text-[10px]";
  return (
    <div className={`relative ${base}`}>
      {showWings && (
        <>
          <div
            className={`absolute -left-2 top-3 ${wing} rounded-full bg-white/70 shadow-sm`}
          />
          <div
            className={`absolute -right-2 top-3 ${wing} rounded-full bg-white/70 shadow-sm`}
          />
        </>
      )}
      <div
        className={`relative ${base} rounded-2xl bg-gradient-to-br ${fairy.gradient} shadow-inner flex items-center justify-center`}
      >
        <div
          className={`rounded-full ${core} bg-white/85 text-slate-700 font-semibold flex items-center justify-center`}
        >
          {fairy.symbol}
        </div>
        <span className="absolute -top-1 right-2 h-2 w-2 rounded-full bg-white/80" />
        <span className="absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full bg-white/70" />
      </div>
    </div>
  );
};

export default function MatchTheFairiesPage() {
  useUserGuard();
  const { progress, loading, saving, saveLevel, unlocked } =
    useGameProgress(GAME_ID);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [deck, setDeck] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const background = useMemo(
    () =>
      "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.3),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.25),transparent_30%)]",
    []
  );

  const fairyById = useMemo(
    () => new Map(fairies.map((fairy) => [fairy.id, fairy])),
    []
  );

  const deckById = useMemo(
    () => new Map(deck.map((card) => [card.id, card])),
    [deck]
  );

  const activeFairies = useMemo(() => {
    if (!activeLevel) return [];
    return getFairiesForLevel(activeLevel.id, activeLevel.pairCount);
  }, [activeLevel]);

  const activeScene = activeLevel ? sceneById[activeLevel.sceneId] : null;

  const allMatched =
    Boolean(activeLevel) && matched.length === activeLevel?.pairCount;

  const resetRound = (level: Level) => {
    setDeck(buildDeck(level.id, level.pairCount));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setChecking(false);
    setFeedback(null);
  };

  const handleStart = (level: Level) => {
    setActiveLevel(level);
    resetRound(level);
    setFeedback(null);
  };

  const handleReset = () => {
    if (!activeLevel) return;
    resetRound(activeLevel);
  };

  const handleCardClick = (cardId: string) => {
    if (!activeLevel || checking) return;
    if (flipped.length >= 2) return;
    if (flipped.includes(cardId)) return;
    const card = deckById.get(cardId);
    if (!card) return;
    if (matched.includes(card.fairyId)) return;
    setFlipped((prev) => {
      const next = [...prev, cardId];
      if (next.length === 2) {
        setMoves((current) => current + 1);
      }
      return next;
    });
  };

  useEffect(() => {
    if (flipped.length !== 2) return;
    setChecking(true);
    const [firstId, secondId] = flipped;
    const first = deckById.get(firstId);
    const second = deckById.get(secondId);
    const timer = setTimeout(() => {
      if (first && second && first.fairyId === second.fairyId) {
        setMatched((prev) =>
          prev.includes(first.fairyId) ? prev : [...prev, first.fairyId]
        );
      }
      setFlipped([]);
      setChecking(false);
    }, 650);
    return () => clearTimeout(timer);
  }, [deckById, flipped]);

  const handleFinish = async () => {
    if (!activeLevel || !allMatched) return;
    const updated = await saveLevel(activeLevel.id, activeLevel.points);
    if (updated) {
      setFeedback(`Sweet match! You earned ${activeLevel.points} points.`);
    } else {
      setFeedback("Could not save your score. Try again.");
    }
    setActiveLevel(null);
    setDeck([]);
    setFlipped([]);
    setMatched([]);
  };

  return (
    <main
      className={`min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-sky-50 text-slate-800 pb-16 pt-24 px-4 sm:px-5 ${background}`}
    >
      <div className="relative max-w-6xl mx-auto space-y-6">
        <HeadingSection
          href="/games"
          title="Match the Fairies"
          textColor="text-rose-600"
          icon={Sparkles}
        />
        <p className="text-center text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Flip the cards, remember the symbols, and match every fairy pair to
          unlock the next level.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="rounded-2xl bg-white shadow border border-rose-100 px-4 py-3 text-sm text-slate-700 flex items-center justify-between min-w-[220px]">
            <div>
              <p className="text-xs text-rose-500 font-semibold">Total points</p>
              <p className="text-xl font-bold text-rose-600">
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
          <section className="rounded-3xl bg-white shadow-lg border border-rose-100 p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs text-rose-500 font-semibold">
                  Level {activeLevel.id}
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {activeLevel.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span
                    className={`px-2 py-1 rounded-full text-[11px] font-semibold ${difficultyPill[activeLevel.difficulty]}`}
                  >
                    {activeLevel.difficulty}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {matched.length}/{activeLevel.pairCount} pairs
                  </span>
                  <span>{moves} moves</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveLevel(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
                >
                  Back to levels
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-700 text-sm font-semibold hover:bg-rose-100 transition"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            {activeScene && (
              <div
                className={`relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br ${activeScene.gradient} p-4`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.6),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.5),transparent_35%)] opacity-80" />
                <div className="relative flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-600">
                      Scene
                    </p>
                    <p className="text-lg font-semibold text-slate-800">
                      {activeScene.title}
                    </p>
                    <p className="text-xs text-slate-600">
                      {activeLevel.pairCount * 2} cards in this round
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-xs font-semibold">Fairy magic</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              {activeFairies.map((fairy) => (
                <span
                  key={fairy.id}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 overflow-visible"
                >
                  <span
                    className={`h-7 w-7 rounded-full bg-gradient-to-br ${fairy.gradient} p-1 shadow-sm`}
                  >
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-white/90">
                      <img
                        src={`/images/symbol/${fairy.id}.svg`}
                        alt={`${fairy.name} symbol`}
                        className="h-4 w-4 object-contain"
                        loading="lazy"
                      />
                    </span>
                  </span>
                  <span className="font-semibold">{fairy.name}</span>
                </span>
              ))}
            </div>

            <div
              className={`relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br ${
                activeScene?.gradient ?? "from-rose-50"
              } p-4`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.7),transparent_45%),radial-gradient(circle_at_10%_90%,rgba(255,255,255,0.5),transparent_40%)] opacity-80" />
              <div className="relative grid grid-cols-4 sm:grid-cols-5 gap-3">
                {deck.map((card) => {
                  const fairy = fairyById.get(card.fairyId);
                  const isFlipped =
                    flipped.includes(card.id) ||
                    matched.includes(card.fairyId);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleCardClick(card.id)}
                      className={`group aspect-square rounded-2xl border shadow-sm transition ${
                        isFlipped
                          ? "bg-white border-rose-100"
                          : "bg-white/70 border-rose-200 hover:-translate-y-0.5"
                      }`}
                      aria-label={`Card for ${fairy?.name ?? "fairy"}`}
                    >
                      {isFlipped && fairy ? (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                          <div
                            className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${fairy.gradient} p-1 shadow`}
                          >
                            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/90">
                              <img
                                src={`/images/symbol/${fairy.id}.svg`}
                                alt={`${fairy.name} symbol`}
                                className="h-10 w-10 object-contain"
                                loading="lazy"
                              />
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700">
                            {fairy.name}
                          </span>
                        </div>
                      ) : (
                        <div className="relative flex h-full w-full items-center justify-center">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/90 via-rose-50 to-amber-50" />
                          <div className="relative flex flex-col items-center gap-1 text-rose-400">
                            <Sparkles className="h-6 w-6" />
                            <span className="text-[10px] font-semibold uppercase">
                              Magic
                            </span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Match every fairy to finish the level.
              </div>
              <button
                onClick={handleFinish}
                disabled={!allMatched || saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
              >
                {saving ? (
                  <Spinner label="Saving..." />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Finish level
                  </>
                )}
              </button>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {levels.map((level) => {
              const isUnlocked = unlocked(level.id);
              const best = progress?.levelScores?.[String(level.id)];
              const scene = sceneById[level.sceneId];
              return (
                <article
                  key={level.id}
                  className={`rounded-3xl border border-rose-100 bg-white shadow-lg p-4 sm:p-5 space-y-3 ${
                    !isUnlocked ? "opacity-60" : ""
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm font-semibold text-slate-800 bg-gradient-to-br ${
                      scene?.gradient ?? "from-slate-50"
                    }`}
                  >
                    {level.title}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-rose-500 font-semibold">
                      Level {level.id}
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-[11px] font-semibold ${difficultyPill[level.difficulty]}`}
                    >
                      {level.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Match {level.pairCount} fairy pairs.
                  </p>
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-50"
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
          <div className="rounded-2xl bg-white shadow border border-rose-100 px-4 py-3 text-sm text-slate-700">
            {feedback}
          </div>
        )}
      </div>
    </main>
  );
}
