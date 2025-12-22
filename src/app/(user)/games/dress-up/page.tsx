// src/app/(user)/games/dress-up/page.tsx

"use client";

import { useMemo, useState } from "react";
import HeadingSection from "@/components/HeadingSection";
import useUserGuard from "@/hooks/useUserGuard";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { useCelebration } from "@/hooks/useCelebration";
import { RefreshCcw, Shuffle, Sparkles, Shirt } from "lucide-react";

const items = {
  hair: [
    { id: "hair-curly", name: "Curly Hair", src: "/images/dress-up/hair-curly.svg" },
    { id: "hair-bob", name: "Bob Cut", src: "/images/dress-up/hair-bob.svg" },
    { id: "hair-ponytail", name: "Ponytail", src: "/images/dress-up/hair-ponytail.svg" },
    { id: "hair-braids", name: "Braids", src: "/images/dress-up/hair-braids.svg" },
  ],
  top: [
    { id: "top-tee", name: "Sky Tee", src: "/images/dress-up/top-tee.svg" },
    { id: "top-hoodie", name: "Cozy Hoodie", src: "/images/dress-up/top-hoodie.svg" },
    { id: "top-sparkle", name: "Sparkle Top", src: "/images/dress-up/top-sparkle.svg" },
    { id: "top-jacket", name: "Mint Jacket", src: "/images/dress-up/top-jacket.svg" },
  ],
  bottom: [
    { id: "bottom-skirt", name: "Rose Skirt", src: "/images/dress-up/bottom-skirt.svg" },
    { id: "bottom-shorts", name: "Sunny Shorts", src: "/images/dress-up/bottom-shorts.svg" },
    { id: "bottom-jeans", name: "Blue Jeans", src: "/images/dress-up/bottom-jeans.svg" },
    { id: "bottom-leggings", name: "Soft Leggings", src: "/images/dress-up/bottom-leggings.svg" },
  ],
  shoes: [
    { id: "shoes-sneakers", name: "Sneakers", src: "/images/dress-up/shoes-sneakers.svg" },
    { id: "shoes-boots", name: "Boots", src: "/images/dress-up/shoes-boots.svg" },
    { id: "shoes-ballet", name: "Ballet Flats", src: "/images/dress-up/shoes-ballet.svg" },
    { id: "shoes-sandals", name: "Sandals", src: "/images/dress-up/shoes-sandals.svg" },
  ],
  accessory: [
    { id: "accessory-crown", name: "Crown", src: "/images/dress-up/accessory-crown.svg" },
    { id: "accessory-glasses", name: "Glasses", src: "/images/dress-up/accessory-glasses.svg" },
    { id: "accessory-necklace", name: "Necklace", src: "/images/dress-up/accessory-necklace.svg" },
    { id: "accessory-wand", name: "Wand", src: "/images/dress-up/accessory-wand.svg" },
  ],
};

type Category = keyof typeof items;

type Selection = Record<Category, string | null>;

const categoryLabels: Record<Category, string> = {
  hair: "Hair",
  top: "Top",
  bottom: "Bottom",
  shoes: "Shoes",
  accessory: "Accessory",
};

const emptySelection = (): Selection => ({
  hair: null,
  top: null,
  bottom: null,
  shoes: null,
  accessory: null,
});

export default function DressUpGamePage() {
  useUserGuard();
  const { isCelebrating, message, celebrate } = useCelebration();
  const [selection, setSelection] = useState<Selection>(emptySelection);

  const background = useMemo(
    () =>
      "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.3),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(255,255,255,0.25),transparent_30%)]",
    []
  );

  const handleSelect = (category: Category, itemId: string) => {
    setSelection((prev) => ({ ...prev, [category]: itemId }));
  };

  const handleReset = () => setSelection(emptySelection());

  const handleRandomize = () => {
    const next: Selection = {
      hair: items.hair[Math.floor(Math.random() * items.hair.length)]?.id ?? null,
      top: items.top[Math.floor(Math.random() * items.top.length)]?.id ?? null,
      bottom:
        items.bottom[Math.floor(Math.random() * items.bottom.length)]?.id ?? null,
      shoes:
        items.shoes[Math.floor(Math.random() * items.shoes.length)]?.id ?? null,
      accessory:
        items.accessory[Math.floor(Math.random() * items.accessory.length)]?.id ??
        null,
    };
    setSelection(next);
  };

  const handleCelebrate = () => {
    celebrate("Lovely look! Keep styling.");
  };

  return (
    <main
      className={`min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 text-slate-800 pb-16 pt-24 px-4 sm:px-5 ${background}`}
    >
      <div className="relative max-w-6xl mx-auto space-y-6">
        <HeadingSection
          href="/games"
          title="Dress-Up Studio"
          textColor="text-rose-600"
          icon={Shirt}
        />
        <p className="text-center text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Free play studio. Mix and match outfits and accessories to make your
          own princess style.
        </p>

        <section className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-3xl border border-rose-100 bg-white shadow-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-500 font-semibold">
                    Princess Preview
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Style your character
                  </h2>
                </div>
                <Sparkles className="h-6 w-6 text-rose-400" />
              </div>
              <p className="text-sm text-slate-600">
                Tap any item to dress up. Use randomize for quick ideas.
              </p>
            </div>

            <div className="rounded-3xl border border-rose-100 bg-white shadow-lg p-4">
              <div className="relative mx-auto h-[300px] w-[220px]">
                <img
                  src="/images/dress-up/base.svg"
                  alt="Dress up base"
                  className="absolute inset-0 h-full w-full"
                />
                {selection.bottom && (
                  <img
                    src={`/images/dress-up/${selection.bottom}.svg`}
                    alt="Bottom"
                    className="absolute inset-0 h-full w-full"
                  />
                )}
                {selection.shoes && (
                  <img
                    src={`/images/dress-up/${selection.shoes}.svg`}
                    alt="Shoes"
                    className="absolute inset-0 h-full w-full"
                  />
                )}
                {selection.top && (
                  <img
                    src={`/images/dress-up/${selection.top}.svg`}
                    alt="Top"
                    className="absolute inset-0 h-full w-full"
                  />
                )}
                {selection.hair && (
                  <img
                    src={`/images/dress-up/${selection.hair}.svg`}
                    alt="Hair"
                    className="absolute inset-0 h-full w-full"
                  />
                )}
                {selection.accessory && (
                  <img
                    src={`/images/dress-up/${selection.accessory}.svg`}
                    alt="Accessory"
                    className="absolute inset-0 h-full w-full"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleRandomize}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-semibold shadow hover:-translate-y-0.5 transition"
              >
                <Shuffle className="w-4 h-4" />
                Randomize
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-700 text-sm font-semibold"
              >
                <RefreshCcw className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={handleCelebrate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold"
              >
                <Sparkles className="w-4 h-4" />
                Celebrate
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-white shadow-lg p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-500 font-semibold">
                  Closet
                </p>
                <p className="text-sm text-slate-600">
                  Tap to choose items for each category.
                </p>
              </div>
            </div>

            {(Object.keys(items) as Category[]).map((category) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    {categoryLabels[category]}
                  </p>
                  {selection[category] && (
                    <span className="text-xs text-emerald-600 font-semibold">
                      Selected
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {items[category].map((item) => {
                    const selected = selection[category] === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(category, item.id)}
                        className={`rounded-2xl border p-2 text-left text-xs transition ${
                          selected
                            ? "border-rose-400 bg-rose-50 shadow"
                            : "border-slate-200 bg-slate-50 hover:-translate-y-0.5"
                        }`}
                      >
                        <div className="relative w-full h-16 rounded-xl bg-white border border-slate-100 overflow-hidden">
                          <img
                            src={item.src}
                            alt={item.name}
                            className="absolute inset-0 h-full w-full"
                            loading="lazy"
                          />
                        </div>
                        <p className="mt-2 font-semibold text-slate-700">
                          {item.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <CelebrationOverlay isOpen={isCelebrating} message={message} />
    </main>
  );
}
