// src/app/(user)/games/coloring/page.tsx

"use client";

import { useMemo, useState, type CSSProperties } from "react";
import HeadingSection from "@/components/HeadingSection";
import useUserGuard from "@/hooks/useUserGuard";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useCelebration } from "@/hooks/useCelebration";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { CheckCircle2, Palette, Play, RefreshCcw } from "lucide-react";
import { Spinner } from "@/components/Spinner";

const GAME_ID = "coloring";

type Difficulty = "Easy" | "Medium" | "Hard";

type PaletteColor = {
  name: string;
  className: string;
};

type ZoneShape = "circle" | "square" | "diamond" | "triangle";

type Zone = {
  id: string;
  row: number;
  col: number;
  shape: ZoneShape;
  target: number;
  tier: number;
  rowSpan?: number;
  colSpan?: number;
};

type Scene = {
  id: string;
  title: string;
  prompt: string;
  palette: PaletteColor[];
  rows: number;
  cols: number;
  zones: Zone[];
};

type Level = {
  id: number;
  sceneId: string;
  title: string;
  prompt: string;
  difficulty: Difficulty;
  points: number;
  palette: PaletteColor[];
  rows: number;
  cols: number;
  zones: Zone[];
};

const palettes = {
  garden: [
    { name: "Petal", className: "bg-rose-300" },
    { name: "Sunbeam", className: "bg-amber-300" },
    { name: "Leaf", className: "bg-emerald-300" },
    { name: "Sky", className: "bg-sky-300" },
  ],
  ocean: [
    { name: "Shell", className: "bg-rose-200" },
    { name: "Lagoon", className: "bg-cyan-300" },
    { name: "Wave", className: "bg-sky-300" },
    { name: "Deep", className: "bg-indigo-300" },
  ],
  candy: [
    { name: "Strawberry", className: "bg-pink-300" },
    { name: "Lemon", className: "bg-yellow-300" },
    { name: "Mint", className: "bg-emerald-200" },
    { name: "Blueberry", className: "bg-blue-300" },
  ],
  twilight: [
    { name: "Moon", className: "bg-slate-200" },
    { name: "Glow", className: "bg-violet-300" },
    { name: "Nebula", className: "bg-fuchsia-300" },
    { name: "Night", className: "bg-indigo-400" },
  ],
};

const baseZones: Zone[] = [
  { id: "z1", row: 1, col: 2, shape: "circle", target: 0, tier: 0 },
  { id: "z2", row: 1, col: 4, shape: "square", target: 1, tier: 0 },
  { id: "z3", row: 2, col: 1, shape: "triangle", target: 2, tier: 0 },
  { id: "z4", row: 2, col: 3, shape: "diamond", target: 0, tier: 0 },
  { id: "z5", row: 3, col: 2, shape: "square", target: 3, tier: 0 },
  { id: "z6", row: 3, col: 4, shape: "circle", target: 1, tier: 0 },
  { id: "z7", row: 4, col: 1, shape: "diamond", target: 2, tier: 1 },
  { id: "z8", row: 4, col: 3, shape: "triangle", target: 0, tier: 1 },
  { id: "z9", row: 5, col: 2, shape: "circle", target: 3, tier: 1 },
  { id: "z10", row: 2, col: 5, shape: "circle", target: 2, tier: 2 },
  { id: "z11", row: 4, col: 5, shape: "square", target: 1, tier: 2 },
  { id: "z12", row: 5, col: 4, shape: "diamond", target: 0, tier: 2 },
];

const buildZones = (prefix: string, shift: number, paletteSize: number) =>
  baseZones.map((zone) => ({
    ...zone,
    id: `${prefix}-${zone.id}`,
    target: (zone.target + shift) % paletteSize,
  }));

const scenes: Scene[] = [
  {
    id: "garden",
    title: "Garden Bloom",
    prompt: "Follow the garden key and color each shape.",
    palette: palettes.garden,
    rows: 5,
    cols: 5,
    zones: buildZones("garden", 0, palettes.garden.length),
  },
  {
    id: "ocean",
    title: "Ocean Splash",
    prompt: "Match the sea colors using the key.",
    palette: palettes.ocean,
    rows: 5,
    cols: 5,
    zones: buildZones("ocean", 1, palettes.ocean.length),
  },
  {
    id: "candy",
    title: "Candy Sky",
    prompt: "Color the shapes with the candy palette.",
    palette: palettes.candy,
    rows: 5,
    cols: 5,
    zones: buildZones("candy", 2, palettes.candy.length),
  },
  {
    id: "twilight",
    title: "Twilight Stars",
    prompt: "Use the night key to finish the page.",
    palette: palettes.twilight,
    rows: 5,
    cols: 5,
    zones: buildZones("twilight", 3, palettes.twilight.length),
  },
];

const difficultyOrder: Difficulty[] = ["Easy", "Medium", "Hard"];

const pointsByDifficulty: Record<Difficulty, number> = {
  Easy: 60,
  Medium: 90,
  Hard: 120,
};

const difficultyPill: Record<Difficulty, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

const shapeClass: Record<ZoneShape, string> = {
  circle: "rounded-full",
  square: "rounded-2xl",
  diamond: "rounded-lg",
  triangle: "rounded-xl",
};

const levels: Level[] = scenes.flatMap((scene, sceneIndex) =>
  difficultyOrder.map((difficulty, difficultyIndex) => ({
    id: sceneIndex * difficultyOrder.length + difficultyIndex + 1,
    sceneId: scene.id,
    title: scene.title,
    prompt: scene.prompt,
    difficulty,
    points: pointsByDifficulty[difficulty],
    palette: scene.palette,
    rows: scene.rows,
    cols: scene.cols,
    zones: scene.zones.filter((zone) => zone.tier <= difficultyIndex),
  }))
);

const buildZoneStyle = (zone: Zone): CSSProperties => {
  const style: CSSProperties = {
    gridColumn: `${zone.col} / span ${zone.colSpan ?? 1}`,
    gridRow: `${zone.row} / span ${zone.rowSpan ?? 1}`,
  };

  if (zone.shape === "diamond") {
    style.transform = "rotate(45deg)";
  }

  if (zone.shape === "triangle") {
    style.clipPath = "polygon(50% 0%, 0% 100%, 100% 100%)";
  }

  return style;
};

const labelForTarget = (target: number) =>
  String.fromCharCode(65 + target);

export default function ColoringGamePage() {
  useUserGuard();
  const { progress, loading, saving, saveLevel, unlocked } =
    useGameProgress(GAME_ID);
  const { isCelebrating, message, celebrate } = useCelebration();
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [colored, setColored] = useState<number[]>([]);
  const [selectedColor, setSelectedColor] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const background = useMemo(
    () =>
      "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.5),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.3),transparent_30%)]",
    []
  );

  const handleStart = (level: Level) => {
    setActiveLevel(level);
    setColored(Array.from({ length: level.zones.length }, () => -1));
    setSelectedColor(0);
    setFeedback(null);
  };

  const handleColor = (index: number) => {
    if (!activeLevel) return;
    setColored((prev) => {
      const next = [...prev];
      next[index] = selectedColor;
      return next;
    });
    setFeedback(null);
  };

  const handleClear = () => {
    if (!activeLevel) return;
    setColored(Array.from({ length: activeLevel.zones.length }, () => -1));
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (!activeLevel) return;
    if (colored.some((value) => value < 0)) {
      setFeedback("Finish coloring every shape.");
      return;
    }
    const matches = colored.every(
      (value, index) => value === activeLevel.zones[index]?.target
    );
    if (!matches) {
      setFeedback("Try again.");
      return;
    }
    const updated = await saveLevel(activeLevel.id, activeLevel.points);
    if (updated) {
      celebrate(`Coloring complete! +${activeLevel.points} points`);
      setActiveLevel(null);
      setFeedback(null);
    } else {
      setFeedback("Could not save your score. Try again.");
    }
  };

  const zoneCount = activeLevel?.zones.length ?? 0;
  const canvasGap = zoneCount > 10 ? "gap-2" : "gap-3";
  const labelSize = zoneCount > 10 ? "text-xs" : "text-sm";

  return (
    <main
      className={`min-h-screen bg-gradient-to-br from-emerald-50 via-lime-50 to-sky-50 text-slate-800 pb-16 pt-24 px-4 sm:px-5 ${background}`}
    >
      <div className="relative max-w-5xl mx-auto space-y-6">
        <HeadingSection
          href="/games"
          title="Coloring Corner"
          textColor="text-emerald-700"
          icon={Palette}
        />
        <p className="text-center text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Pick a color, follow the key, and fill every shape to finish the page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <div className="rounded-2xl bg-white shadow border border-emerald-100 px-4 py-3 text-sm text-slate-700 flex items-center justify-between min-w-[220px]">
            <div>
              <p className="text-xs text-emerald-600 font-semibold">
                Total points
              </p>
              <p className="text-xl font-bold text-emerald-700">
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
          <section className="rounded-3xl border border-emerald-100 bg-white shadow-lg p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs text-emerald-600 font-semibold">
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
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <div
                    className={`grid ${canvasGap} w-full max-w-xl mx-auto aspect-square`}
                    style={{
                      gridTemplateColumns: `repeat(${activeLevel.cols}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${activeLevel.rows}, minmax(0, 1fr))`,
                    }}
                  >
                    {activeLevel.zones.map((zone, index) => {
                      const fillIndex = colored[index];
                      const fillClass =
                        fillIndex >= 0
                          ? activeLevel.palette[fillIndex]?.className ?? "bg-white"
                          : "bg-white";
                      const label = labelForTarget(zone.target);
                      return (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => handleColor(index)}
                          disabled={saving}
                          className={`relative flex items-center justify-center border border-emerald-100 shadow-sm ${shapeClass[zone.shape]} ${fillClass} transition hover:-translate-y-0.5`}
                          style={buildZoneStyle(zone)}
                          aria-label={`Color shape ${label}`}
                        >
                          <span
                            className={`font-semibold ${labelSize} ${
                              fillIndex >= 0
                                ? "text-white/80"
                                : "text-slate-400"
                            }`}
                            style={
                              zone.shape === "diamond"
                                ? { transform: "rotate(-45deg)" }
                                : undefined
                            }
                          >
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500">
                    Pick a color
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {activeLevel.palette.map((color, index) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(index)}
                        className="flex flex-col items-center gap-1"
                      >
                        <span
                          className={`h-10 w-10 rounded-full border-2 border-white shadow ${color.className} ${
                            selectedColor === index
                              ? "ring-2 ring-emerald-500"
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
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3">
                  <p className="text-xs font-semibold text-emerald-600">
                    Color key
                  </p>
                  <div className="grid gap-2">
                    {activeLevel.palette.map((color, index) => (
                      <div
                        key={color.name}
                        className="flex items-center justify-between text-sm text-slate-600"
                      >
                        <span className="font-semibold text-emerald-700">
                          {labelForTarget(index)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-4 w-4 rounded-full ${color.className}`}
                          />
                          <span>{color.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Check coloring
                </button>

                <button
                  onClick={handleClear}
                  type="button"
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Clear page
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
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm text-emerald-700">
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
                  className={`rounded-3xl border border-emerald-100 bg-white shadow-lg p-4 sm:p-5 space-y-3 ${
                    !isUnlocked ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs text-emerald-600 font-semibold">
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    {isUnlocked ? "Color" : "Locked"}
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
