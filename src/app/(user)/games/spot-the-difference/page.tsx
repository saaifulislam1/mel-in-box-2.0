// src/app/(user)/games/spot-the-difference/page.tsx

"use client";

import { useMemo, useState } from "react";
import HeadingSection from "@/components/HeadingSection";
import useUserGuard from "@/hooks/useUserGuard";
import { useGameProgress } from "@/hooks/useGameProgress";
import { CheckCircle2, Eye, Play, RefreshCcw } from "lucide-react";
import { Spinner } from "@/components/Spinner";

const GAME_ID = "spot-the-difference";

type Difficulty = "Easy" | "Medium" | "Hard";

type SpotShape = "star" | "heart" | "circle" | "diamond";

type Spot = {
  id: string;
  cx: number;
  cy: number;
  size: number;
  color: string;
  shape: SpotShape;
};

type Level = {
  id: number;
  sceneId: string;
  title: string;
  difficulty: Difficulty;
  points: number;
  spots: Spot[];
};

type SceneMeta = {
  id: string;
  name: string;
  gradient: string;
};

type SceneLevelSet = {
  sceneId: string;
  title: string;
  variants: Record<Difficulty, Spot[]>;
};

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

const scenes: SceneMeta[] = [
  {
    id: "playground",
    name: "Sunny Playground",
    gradient: "from-sky-50 via-emerald-50 to-amber-50",
  },
  {
    id: "ocean",
    name: "Ocean Picnic",
    gradient: "from-sky-50 via-blue-50 to-cyan-50",
  },
  {
    id: "space",
    name: "Starry Space",
    gradient: "from-slate-100 via-indigo-100 to-slate-200",
  },
  {
    id: "farm",
    name: "Happy Farm",
    gradient: "from-amber-50 via-lime-50 to-emerald-50",
  },
  {
    id: "garden",
    name: "Flower Garden",
    gradient: "from-rose-50 via-pink-50 to-amber-50",
  },
  {
    id: "castle",
    name: "Castle Courtyard",
    gradient: "from-indigo-50 via-violet-50 to-slate-50",
  },
];

const sceneById = Object.fromEntries(
  scenes.map((scene) => [scene.id, scene])
);

const spot = (
  id: string,
  cx: number,
  cy: number,
  size: number,
  shape: SpotShape,
  color: string
): Spot => ({ id, cx, cy, size, shape, color });

const sceneSets: SceneLevelSet[] = [
  {
    sceneId: "playground",
    title: "Sunny Playground",
    variants: {
      Easy: [
        spot("pg-e-1", 96, 42, 8, "star", "#F59E0B"),
        spot("pg-e-2", 140, 172, 8, "heart", "#FB7185"),
        spot("pg-e-3", 248, 150, 8, "circle", "#60A5FA"),
      ],
      Medium: [
        spot("pg-m-1", 52, 140, 8, "diamond", "#A78BFA"),
        spot("pg-m-2", 84, 78, 8, "star", "#FCD34D"),
        spot("pg-m-3", 220, 112, 8, "circle", "#34D399"),
        spot("pg-m-4", 276, 92, 8, "heart", "#F472B6"),
      ],
      Hard: [
        spot("pg-h-1", 64, 168, 8, "heart", "#F97316"),
        spot("pg-h-2", 118, 100, 8, "star", "#FCD34D"),
        spot("pg-h-3", 170, 132, 8, "diamond", "#38BDF8"),
        spot("pg-h-4", 244, 108, 8, "circle", "#22C55E"),
        spot("pg-h-5", 292, 162, 8, "star", "#F43F5E"),
      ],
    },
  },
  {
    sceneId: "ocean",
    title: "Ocean Picnic",
    variants: {
      Easy: [
        spot("oc-e-1", 76, 182, 8, "circle", "#FCD34D"),
        spot("oc-e-2", 232, 170, 8, "star", "#F97316"),
        spot("oc-e-3", 188, 86, 8, "diamond", "#38BDF8"),
      ],
      Medium: [
        spot("oc-m-1", 58, 138, 8, "heart", "#FB7185"),
        spot("oc-m-2", 156, 174, 8, "circle", "#22C55E"),
        spot("oc-m-3", 226, 64, 8, "star", "#F59E0B"),
        spot("oc-m-4", 284, 128, 8, "diamond", "#A78BFA"),
      ],
      Hard: [
        spot("oc-h-1", 50, 162, 8, "circle", "#60A5FA"),
        spot("oc-h-2", 138, 70, 8, "heart", "#F472B6"),
        spot("oc-h-3", 198, 148, 8, "diamond", "#FCD34D"),
        spot("oc-h-4", 248, 92, 8, "star", "#F97316"),
        spot("oc-h-5", 294, 170, 8, "circle", "#34D399"),
      ],
    },
  },
  {
    sceneId: "space",
    title: "Starry Space",
    variants: {
      Easy: [
        spot("sp-e-1", 60, 44, 8, "star", "#FCD34D"),
        spot("sp-e-2", 258, 84, 8, "diamond", "#60A5FA"),
        spot("sp-e-3", 120, 182, 8, "circle", "#F472B6"),
      ],
      Medium: [
        spot("sp-m-1", 44, 156, 8, "star", "#FCD34D"),
        spot("sp-m-2", 208, 44, 8, "heart", "#F472B6"),
        spot("sp-m-3", 270, 168, 8, "circle", "#34D399"),
        spot("sp-m-4", 150, 90, 8, "diamond", "#A78BFA"),
      ],
      Hard: [
        spot("sp-h-1", 80, 66, 8, "star", "#FCD34D"),
        spot("sp-h-2", 236, 62, 8, "star", "#F97316"),
        spot("sp-h-3", 282, 128, 8, "diamond", "#60A5FA"),
        spot("sp-h-4", 124, 140, 8, "heart", "#FB7185"),
        spot("sp-h-5", 206, 182, 8, "circle", "#34D399"),
      ],
    },
  },
  {
    sceneId: "farm",
    title: "Happy Farm",
    variants: {
      Easy: [
        spot("fm-e-1", 82, 150, 8, "heart", "#F97316"),
        spot("fm-e-2", 228, 142, 8, "star", "#FCD34D"),
        spot("fm-e-3", 60, 94, 8, "circle", "#60A5FA"),
      ],
      Medium: [
        spot("fm-m-1", 44, 174, 8, "heart", "#FB7185"),
        spot("fm-m-2", 194, 92, 8, "star", "#FCD34D"),
        spot("fm-m-3", 264, 166, 8, "diamond", "#A78BFA"),
        spot("fm-m-4", 144, 68, 8, "circle", "#22C55E"),
      ],
      Hard: [
        spot("fm-h-1", 74, 130, 8, "star", "#FCD34D"),
        spot("fm-h-2", 162, 154, 8, "heart", "#F472B6"),
        spot("fm-h-3", 240, 96, 8, "diamond", "#60A5FA"),
        spot("fm-h-4", 286, 144, 8, "circle", "#22C55E"),
        spot("fm-h-5", 112, 74, 8, "star", "#F59E0B"),
      ],
    },
  },
  {
    sceneId: "garden",
    title: "Flower Garden",
    variants: {
      Easy: [
        spot("gd-e-1", 92, 150, 8, "heart", "#F472B6"),
        spot("gd-e-2", 206, 138, 8, "star", "#FCD34D"),
        spot("gd-e-3", 264, 72, 8, "circle", "#38BDF8"),
      ],
      Medium: [
        spot("gd-m-1", 64, 122, 8, "star", "#F59E0B"),
        spot("gd-m-2", 146, 172, 8, "heart", "#FB7185"),
        spot("gd-m-3", 212, 96, 8, "diamond", "#A78BFA"),
        spot("gd-m-4", 282, 154, 8, "circle", "#22C55E"),
      ],
      Hard: [
        spot("gd-h-1", 84, 96, 8, "star", "#FCD34D"),
        spot("gd-h-2", 132, 150, 8, "heart", "#F472B6"),
        spot("gd-h-3", 204, 120, 8, "diamond", "#60A5FA"),
        spot("gd-h-4", 260, 166, 8, "circle", "#22C55E"),
        spot("gd-h-5", 292, 66, 8, "star", "#F97316"),
      ],
    },
  },
  {
    sceneId: "castle",
    title: "Castle Courtyard",
    variants: {
      Easy: [
        spot("cs-e-1", 140, 92, 8, "star", "#FCD34D"),
        spot("cs-e-2", 224, 84, 8, "heart", "#F472B6"),
        spot("cs-e-3", 268, 46, 8, "circle", "#60A5FA"),
      ],
      Medium: [
        spot("cs-m-1", 104, 118, 8, "heart", "#FB7185"),
        spot("cs-m-2", 204, 106, 8, "diamond", "#A78BFA"),
        spot("cs-m-3", 262, 76, 8, "star", "#F59E0B"),
        spot("cs-m-4", 286, 144, 8, "circle", "#22C55E"),
      ],
      Hard: [
        spot("cs-h-1", 122, 134, 8, "star", "#FCD34D"),
        spot("cs-h-2", 182, 72, 8, "heart", "#F472B6"),
        spot("cs-h-3", 236, 126, 8, "diamond", "#60A5FA"),
        spot("cs-h-4", 272, 166, 8, "circle", "#22C55E"),
        spot("cs-h-5", 296, 96, 8, "star", "#F97316"),
      ],
    },
  },
];

const difficultyOrder: Difficulty[] = ["Easy", "Medium", "Hard"];

const levels: Level[] = sceneSets.flatMap((sceneSet, index) =>
  difficultyOrder.map((difficulty) => ({
    id: index * difficultyOrder.length + difficultyOrder.indexOf(difficulty) + 1,
    sceneId: sceneSet.sceneId,
    title: sceneSet.title,
    difficulty,
    points: pointsByDifficulty[difficulty],
    spots: sceneSet.variants[difficulty],
  }))
);

const starPath = (
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number
) => {
  let path = "";
  let rot = Math.PI / 2 * 3;
  path += `M ${cx} ${cy - outerRadius}`;
  for (let i = 0; i < 5; i += 1) {
    const x1 = cx + Math.cos(rot) * outerRadius;
    const y1 = cy + Math.sin(rot) * outerRadius;
    path += ` L ${x1} ${y1}`;
    rot += Math.PI / 5;
    const x2 = cx + Math.cos(rot) * innerRadius;
    const y2 = cy + Math.sin(rot) * innerRadius;
    path += ` L ${x2} ${y2}`;
    rot += Math.PI / 5;
  }
  path += " Z";
  return path;
};

const heartPath = (cx: number, cy: number, size: number) => {
  const top = cy - size * 0.6;
  const left = cx - size;
  const right = cx + size;
  const bottom = cy + size;
  return [
    `M ${cx} ${bottom}`,
    `C ${cx - size * 1.2} ${cy + size * 0.2} ${left} ${cy - size * 0.4} ${cx} ${top}`,
    `C ${right} ${cy - size * 0.4} ${cx + size * 1.2} ${cy + size * 0.2} ${cx} ${bottom}`,
    "Z",
  ].join(" ");
};

const renderSpotShape = (spotItem: Spot) => {
  switch (spotItem.shape) {
    case "circle":
      return (
        <circle
          cx={spotItem.cx}
          cy={spotItem.cy}
          r={spotItem.size}
          fill={spotItem.color}
        />
      );
    case "diamond":
      return (
        <polygon
          points={`${spotItem.cx} ${spotItem.cy - spotItem.size} ${
            spotItem.cx + spotItem.size
          } ${spotItem.cy} ${spotItem.cx} ${
            spotItem.cy + spotItem.size
          } ${spotItem.cx - spotItem.size} ${spotItem.cy}`}
          fill={spotItem.color}
        />
      );
    case "heart":
      return (
        <path
          d={heartPath(spotItem.cx, spotItem.cy, spotItem.size)}
          fill={spotItem.color}
        />
      );
    case "star":
    default:
      return (
        <path
          d={starPath(
            spotItem.cx,
            spotItem.cy,
            spotItem.size,
            spotItem.size / 2
          )}
          fill={spotItem.color}
        />
      );
  }
};

const SceneArt = ({ sceneId }: { sceneId: string }) => {
  switch (sceneId) {
    case "playground":
      return (
        <>
          <rect x="0" y="0" width="320" height="130" fill="#BFDBFE" />
          <rect x="0" y="130" width="320" height="90" fill="#BBF7D0" />
          <circle cx="60" cy="50" r="22" fill="#FDE68A" />
          <rect x="34" y="118" width="16" height="40" fill="#B45309" />
          <circle cx="42" cy="102" r="24" fill="#34D399" />
          <rect x="198" y="120" width="18" height="58" fill="#F59E0B" />
          <polygon points="198,120 198,150 258,150" fill="#FCD34D" />
          <rect x="92" y="150" width="84" height="32" rx="10" fill="#FBBF24" />
        </>
      );
    case "ocean":
      return (
        <>
          <rect x="0" y="0" width="320" height="120" fill="#BFDBFE" />
          <rect x="0" y="120" width="320" height="100" fill="#60A5FA" />
          <circle cx="262" cy="50" r="18" fill="#FDE68A" />
          <polygon points="120,120 200,120 180,150 140,150" fill="#F97316" />
          <polygon points="160,60 160,120 200,120" fill="#FDE68A" />
          <path
            d="M40 150 C60 140 80 140 100 150 C80 160 60 160 40 150 Z"
            fill="#FBBF24"
          />
          <path
            d="M220 170 C236 162 252 162 268 170 C252 178 236 178 220 170 Z"
            fill="#FDE68A"
          />
        </>
      );
    case "space":
      return (
        <>
          <rect x="0" y="0" width="320" height="220" fill="#0F172A" />
          <circle cx="100" cy="120" r="36" fill="#818CF8" />
          <ellipse cx="100" cy="120" rx="55" ry="18" fill="none" stroke="#A5B4FC" strokeWidth="4" />
          <rect x="220" y="110" width="22" height="52" rx="8" fill="#F97316" />
          <polygon points="231,86 246,110 216,110" fill="#FDE68A" />
          <circle cx="40" cy="40" r="3" fill="#E2E8F0" />
          <circle cx="260" cy="30" r="3" fill="#E2E8F0" />
          <circle cx="280" cy="180" r="3" fill="#E2E8F0" />
          <circle cx="70" cy="180" r="3" fill="#E2E8F0" />
        </>
      );
    case "farm":
      return (
        <>
          <rect x="0" y="0" width="320" height="120" fill="#BAE6FD" />
          <rect x="0" y="120" width="320" height="100" fill="#BBF7D0" />
          <rect x="120" y="90" width="90" height="70" fill="#F87171" />
          <polygon points="115,90 165,50 215,90" fill="#EF4444" />
          <rect x="150" y="120" width="30" height="40" fill="#FCD34D" />
          <rect x="134" y="102" width="16" height="16" fill="#FDE68A" />
          <rect x="180" y="102" width="16" height="16" fill="#FDE68A" />
          <rect x="40" y="118" width="16" height="42" fill="#92400E" />
          <circle cx="48" cy="98" r="22" fill="#34D399" />
        </>
      );
    case "garden":
      return (
        <>
          <rect x="0" y="0" width="320" height="110" fill="#E0F2FE" />
          <rect x="0" y="110" width="320" height="110" fill="#DCFCE7" />
          <rect x="70" y="140" width="8" height="40" fill="#22C55E" />
          <circle cx="74" cy="130" r="12" fill="#F472B6" />
          <rect x="150" y="150" width="8" height="40" fill="#22C55E" />
          <circle cx="154" cy="140" r="12" fill="#FCD34D" />
          <rect x="230" y="145" width="8" height="40" fill="#22C55E" />
          <circle cx="234" cy="135" r="12" fill="#60A5FA" />
          <path
            d="M20 110 C60 80 120 90 160 110"
            stroke="#86EFAC"
            strokeWidth="6"
            fill="none"
          />
        </>
      );
    case "castle":
      return (
        <>
          <rect x="0" y="0" width="320" height="120" fill="#E0E7FF" />
          <rect x="0" y="120" width="320" height="100" fill="#C7D2FE" />
          <rect x="110" y="90" width="120" height="70" fill="#A5B4FC" />
          <rect x="90" y="70" width="30" height="90" fill="#818CF8" />
          <rect x="210" y="70" width="30" height="90" fill="#818CF8" />
          <polygon points="90,70 105,50 120,70" fill="#6366F1" />
          <polygon points="210,70 225,50 240,70" fill="#6366F1" />
          <rect x="150" y="120" width="40" height="40" fill="#FDE68A" />
          <circle cx="260" cy="48" r="16" fill="#FDE68A" />
        </>
      );
    default:
      return null;
  }
};

export default function SpotTheDifferencePage() {
  useUserGuard();
  const { progress, loading, saving, saveLevel, unlocked } =
    useGameProgress(GAME_ID);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const background = useMemo(
    () =>
      "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.3),transparent_30%)]",
    []
  );

  const foundSet = useMemo(() => new Set(found), [found]);
  const activeScene = activeLevel ? sceneById[activeLevel.sceneId] : null;
  const totalSpots = activeLevel?.spots.length ?? 0;
  const totalFound = found.length;
  const allFound = totalSpots > 0 && totalFound === totalSpots;

  const handleStart = (level: Level) => {
    setActiveLevel(level);
    setFound([]);
    setFeedback(null);
  };

  const handleSpotClick = (spotId: string) => {
    if (!activeLevel) return;
    setFound((prev) => (prev.includes(spotId) ? prev : [...prev, spotId]));
  };

  const handleReset = () => setFound([]);

  const handleFinish = async () => {
    if (!activeLevel || !allFound) return;
    const updated = await saveLevel(activeLevel.id, activeLevel.points);
    if (updated) {
      setFeedback(`Great job! You earned ${activeLevel.points} points.`);
    } else {
      setFeedback("Could not save your score. Try again.");
    }
    setActiveLevel(null);
    setFound([]);
  };

  return (
    <main
      className={`min-h-screen bg-gradient-to-br from-sky-50 via-rose-50 to-amber-50 text-slate-800 pb-16 pt-24 px-4 sm:px-5 ${background}`}
    >
      <div className="relative max-w-6xl mx-auto space-y-6">
        <HeadingSection
          href="/games"
          title="Spot the Difference"
          textColor="text-rose-600"
          icon={Eye}
        />
        <p className="text-center text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Find the sneaky changes between two playful scenes. Finish the level
          to unlock the next one.
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
                  {activeScene?.name ?? activeLevel.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span
                    className={`px-2 py-1 rounded-full text-[11px] font-semibold ${difficultyPill[activeLevel.difficulty]}`}
                  >
                    {activeLevel.difficulty}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {totalFound}/{totalSpots} found
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveLevel(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
              >
                Back to levels
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3 space-y-2">
                <p className="text-xs font-semibold text-rose-500">
                  Original scene
                </p>
                <div className="rounded-xl bg-white border border-rose-100 overflow-hidden">
                  <svg viewBox="0 0 320 220" className="w-full h-auto">
                    <SceneArt sceneId={activeLevel.sceneId} />
                  </svg>
                </div>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-3 space-y-2">
                <p className="text-xs font-semibold text-rose-500">
                  Find the differences
                </p>
                <div className="rounded-xl bg-white border border-rose-100 overflow-hidden">
                  <svg viewBox="0 0 320 220" className="w-full h-auto">
                    <SceneArt sceneId={activeLevel.sceneId} />
                    {activeLevel.spots.map((spotItem) => (
                      <g key={spotItem.id}>
                        {renderSpotShape(spotItem)}
                      </g>
                    ))}
                    {activeLevel.spots.map((spotItem) => (
                      <g
                        key={`${spotItem.id}-hit`}
                        onClick={() => handleSpotClick(spotItem.id)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={spotItem.cx}
                          cy={spotItem.cy}
                          r={spotItem.size + 10}
                          fill="transparent"
                        />
                        {foundSet.has(spotItem.id) && (
                          <circle
                            cx={spotItem.cx}
                            cy={spotItem.cy}
                            r={spotItem.size + 6}
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="3"
                          />
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Eye className="w-4 h-4 text-rose-500" />
                Tap the right picture to mark each difference.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!allFound || saving}
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
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Progress</span>
              <div className="flex items-center gap-1">
                {activeLevel.spots.map((spotItem) => (
                  <span
                    key={`${spotItem.id}-dot`}
                    className={`h-2 w-2 rounded-full ${
                      foundSet.has(spotItem.id)
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500">
                {activeLevel.points} pts
              </span>
            </div>
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
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm font-semibold text-slate-800 bg-gradient-to-br ${
                      sceneById[level.sceneId]?.gradient ?? "from-slate-50"
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
                    Find {level.spots.length} differences.
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
