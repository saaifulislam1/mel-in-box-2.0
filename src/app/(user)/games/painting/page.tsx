// src/app/(user)/games/painting/page.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HeadingSection from "@/components/HeadingSection";
import useUserGuard from "@/hooks/useUserGuard";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useCelebration } from "@/hooks/useCelebration";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { Brush, CheckCircle2, Play, RefreshCcw } from "lucide-react";
import { Spinner } from "@/components/Spinner";

const GAME_ID = "painting";

type Difficulty = "Easy" | "Medium" | "Hard";

type Level = {
  id: number;
  title: string;
  prompt: string;
  difficulty: Difficulty;
  points: number;
};

type PaletteColor = {
  name: string;
  className: string;
  color: string;
};

type BrushSize = {
  name: string;
  value: number;
};

const levels: Level[] = [
  { id: 1, title: "Sunny Scribble", prompt: "Draw a big sun with rays.", difficulty: "Easy", points: 60 },
  { id: 2, title: "Rainbow Roads", prompt: "Draw a rainbow with clouds.", difficulty: "Easy", points: 70 },
  { id: 3, title: "Balloon Party", prompt: "Draw five balloons.", difficulty: "Easy", points: 80 },
  { id: 4, title: "Flower Garden", prompt: "Draw three flowers.", difficulty: "Easy", points: 90 },
  { id: 5, title: "Happy House", prompt: "Draw a house and a door.", difficulty: "Easy", points: 100 },
  { id: 6, title: "Butterfly Trail", prompt: "Draw two butterflies.", difficulty: "Easy", points: 110 },
  { id: 7, title: "Ocean Friends", prompt: "Draw a fish and bubbles.", difficulty: "Medium", points: 120 },
  { id: 8, title: "Pirate Map", prompt: "Draw an island and an X.", difficulty: "Medium", points: 130 },
  { id: 9, title: "Rocket Launch", prompt: "Draw a rocket with stars.", difficulty: "Medium", points: 140 },
  { id: 10, title: "Robot Buddy", prompt: "Draw a robot with buttons.", difficulty: "Medium", points: 150 },
  { id: 11, title: "Magic Castle", prompt: "Draw a castle with flags.", difficulty: "Medium", points: 160 },
  { id: 12, title: "Jungle Adventure", prompt: "Draw a tree and a monkey.", difficulty: "Medium", points: 170 },
  { id: 13, title: "Space Parade", prompt: "Draw a planet and two moons.", difficulty: "Hard", points: 180 },
  { id: 14, title: "City Skyline", prompt: "Draw tall buildings and windows.", difficulty: "Hard", points: 190 },
  { id: 15, title: "Underwater Reef", prompt: "Draw coral and a sea turtle.", difficulty: "Hard", points: 200 },
  { id: 16, title: "Dino Tracks", prompt: "Draw a dinosaur and footprints.", difficulty: "Hard", points: 210 },
  { id: 17, title: "Festival Lights", prompt: "Draw hanging lights and stars.", difficulty: "Hard", points: 220 },
  { id: 18, title: "Dreamy Meadow", prompt: "Draw a rainbow, sun, and flowers.", difficulty: "Hard", points: 230 },
];

const palettes: PaletteColor[] = [
  { name: "Rose", className: "bg-rose-400", color: "#fb7185" },
  { name: "Sun", className: "bg-amber-300", color: "#fcd34d" },
  { name: "Sky", className: "bg-sky-300", color: "#7dd3fc" },
  { name: "Mint", className: "bg-emerald-300", color: "#6ee7b7" },
  { name: "Grape", className: "bg-violet-300", color: "#c4b5fd" },
  { name: "Cloud", className: "bg-slate-200", color: "#e2e8f0" },
  { name: "Midnight", className: "bg-slate-700", color: "#334155" },
];

const brushSizes: BrushSize[] = [
  { name: "Small", value: 6 },
  { name: "Medium", value: 12 },
  { name: "Large", value: 18 },
];

const difficultyPill: Record<Difficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

export default function PaintingGamePage() {
  useUserGuard();
  const { progress, loading, saving, saveLevel, unlocked } =
    useGameProgress(GAME_ID);
  const { isCelebrating, message, celebrate } = useCelebration();
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [brushSize, setBrushSize] = useState(brushSizes[1]?.value ?? 12);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
    ratio: 1,
  });

  const background = useMemo(
    () =>
      "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.5),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.3),transparent_30%)]",
    []
  );

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const wrapper = canvasWrapRef.current;
    if (!canvas || !wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.clearRect(0, 0, rect.width, rect.height);
    setCanvasSize({ width: rect.width, height: rect.height, ratio });
    setHasDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.setTransform(canvasSize.ratio, 0, 0, canvasSize.ratio, 0, 0);
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    setHasDrawing(false);
  };

  useEffect(() => {
    if (!activeLevel) return;
    const frame = requestAnimationFrame(resizeCanvas);
    window.addEventListener("resize", resizeCanvas);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [activeLevel]);

  const handleStart = (level: Level) => {
    setActiveLevel(level);
    setSelectedColor(0);
    setBrushSize(brushSizes[1]?.value ?? 12);
    setFeedback(null);
  };

  const handleClear = () => {
    clearCanvas();
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (!activeLevel) return;
    if (!hasDrawing) {
      setFeedback("Draw something before checking.");
      return;
    }
    const updated = await saveLevel(activeLevel.id, activeLevel.points);
    if (updated) {
      celebrate(`Awesome art! +${activeLevel.points} points`);
      setActiveLevel(null);
      setFeedback(null);
    } else {
      setFeedback("Could not save your score. Try again.");
    }
  };

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeLevel) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = getPoint(event);
    setFeedback(null);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const point = getPoint(event);
    ctx.strokeStyle = palettes[selectedColor]?.color ?? "#111827";
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
    if (!hasDrawing) setHasDrawing(true);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  return (
    <main
      className={`min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 text-slate-800 pb-16 pt-24 px-4 sm:px-5 ${background}`}
    >
      <div className="relative max-w-5xl mx-auto space-y-6">
        <HeadingSection
          href="/games"
          title="Painting Party"
          textColor="text-rose-600"
          icon={Brush}
        />
        <p className="text-center text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Pick a prompt, grab a brush, and draw your own masterpiece.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="rounded-2xl bg-white shadow border border-rose-100 px-4 py-3 text-sm text-slate-700 flex items-center justify-between min-w-[220px]">
            <div>
              <p className="text-xs text-rose-500 font-semibold">Total points</p>
              <p className="text-xl font-bold text-rose-700">
                {progress?.totalPoints ?? 0}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Levels done</p>
              <p className="font-semibold text-slate-800">
                {(progress?.completedLevels?.length ?? 0)}/{levels.length}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner label="Loading progress..." />
          </div>
        ) : activeLevel ? (
          <section className="rounded-3xl border border-rose-100 bg-white shadow-lg p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs text-rose-500 font-semibold">
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

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
              <div className="space-y-4">
                <div className="rounded-3xl border border-rose-100 bg-white p-4 shadow-inner">
                  <div
                    ref={canvasWrapRef}
                    className="w-full h-[320px] sm:h-[360px] relative"
                  >
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full rounded-2xl bg-white touch-none"
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerLeave={handlePointerUp}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500">
                    Pick a color
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {palettes.map((color, index) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(index)}
                        className="flex flex-col items-center gap-1"
                      >
                        <span
                          className={`h-10 w-10 rounded-full border-2 border-white shadow ${color.className} ${
                            selectedColor === index
                              ? "ring-2 ring-rose-500"
                              : "ring-0"
                          }`}
                        />
                        <span className="text-[11px] text-slate-600">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-rose-100 bg-rose-50/60 p-4 space-y-3">
                  <p className="text-xs font-semibold text-rose-500">
                    Brush size
                  </p>
                  <div className="grid gap-2">
                    {brushSizes.map((size) => (
                      <button
                        key={size.name}
                        type="button"
                        onClick={() => setBrushSize(size.value)}
                        className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                          brushSize === size.value
                            ? "border-rose-300 bg-white text-rose-600"
                            : "border-transparent bg-white/70 text-slate-600"
                        }`}
                      >
                        <span>{size.name}</span>
                        <span
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white"
                          style={{ fontSize: size.value }}
                        >
                          •
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Finish drawing
                </button>

                <button
                  onClick={handleClear}
                  type="button"
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Clear canvas
                </button>

                <button
                  onClick={() => setActiveLevel(null)}
                  type="button"
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-white text-slate-600 text-sm font-semibold border border-slate-200"
                >
                  Back to levels
                </button>
              </div>
            </div>

            {feedback && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-sm text-rose-700">
                {feedback}
              </div>
            )}
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {levels.map((level) => {
              const isUnlocked = unlocked(level.id);
              const best = progress?.levelScores?.[String(level.id)];
              return (
                <article
                  key={level.id}
                  className={`rounded-3xl border border-rose-100 bg-white shadow-lg p-4 sm:p-5 space-y-3 ${
                    !isUnlocked ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs text-rose-500 font-semibold">
                        Level {level.id}
                      </p>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {level.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {level.prompt}
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    {isUnlocked ? "Draw" : "Locked"}
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
