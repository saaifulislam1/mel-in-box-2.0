// src/app/(user)/games/page.tsx

"use client";

import HeadingSection from "@/components/HeadingSection";
import { useMemo } from "react";
import { Gamepad2, Play, Star } from "lucide-react";

type Game = {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  color: string;
  icon: string;
};

const games: Game[] = [
  { id: "puzzle-paradise", title: "Puzzle Paradise", description: "Solve colorful puzzles!", difficulty: "Easy", color: "from-fuchsia-500 via-violet-500 to-blue-500", icon: "🧩" },
  { id: "memory-match", title: "Memory Match", description: "Match the cards!", difficulty: "Medium", color: "from-teal-400 via-sky-400 to-blue-500", icon: "🃏" },
  { id: "rainbow-colors", title: "Rainbow Colors", description: "Color magical pictures!", difficulty: "Easy", color: "from-rose-500 via-pink-500 to-orange-400", icon: "🎨" },
  { id: "number-quest", title: "Number Quest", description: "Learn numbers with fun!", difficulty: "Easy", color: "from-amber-400 via-orange-400 to-amber-500", icon: "🔢" },
  { id: "shape-safari", title: "Shape Safari", description: "Discover amazing shapes!", difficulty: "Easy", color: "from-purple-500 via-fuchsia-500 to-pink-500", icon: "🔺" },
  { id: "music-maker", title: "Music Maker", description: "Create beautiful music!", difficulty: "Medium", color: "from-cyan-400 via-sky-400 to-blue-500", icon: "🎵" },
  { id: "animal-friends", title: "Animal Friends", description: "Meet cute animals!", difficulty: "Easy", color: "from-emerald-500 via-green-500 to-teal-500", icon: "🦁" },
  { id: "treasure-hunt", title: "Treasure Hunt", description: "Find hidden treasures!", difficulty: "Hard", color: "from-orange-500 via-amber-500 to-yellow-400", icon: "🏴‍☠️" },
];

const difficultyStyle = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

export default function GamesPage() {
  const background = useMemo(
    () =>
      "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.3),transparent_30%)]",
    []
  );

  return (
    <main className={`min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-100 text-slate-800 pb-16 pt-24 px-4 sm:px-5 ${background}`}>
      <div className="relative max-w-5xl mx-auto space-y-6">
        <HeadingSection
          href="/"
          title="Games & Fun"
          textColor="text-rose-600"
          icon={Gamepad2}
        />
        <p className="text-center text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Quick brain-boosters for kids—pick a game, tap play, and have fun!
        </p>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {games.map((game) => (
            <article
              key={game.id}
              className={`relative overflow-hidden rounded-3xl shadow-lg border border-white/40 bg-gradient-to-br ${game.color} text-white p-4 sm:p-5`}
            >
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              <div className="relative flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{game.icon}</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold">
                      {game.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-white/90">
                      {game.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold ${difficultyStyle[game.difficulty]}`}
                >
                  {game.difficulty}
                </span>
              </div>

              <div className="relative mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <Star className="w-4 h-4" />
                  <span>Kid-friendly</span>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-rose-700 font-semibold shadow hover:-translate-y-0.5 transition">
                  <Play className="w-4 h-4" />
                  Play now
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
