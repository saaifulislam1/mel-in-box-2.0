// src/components/CelebrationOverlay.tsx

"use client";

type CelebrationOverlayProps = {
  isOpen: boolean;
  message: string;
};

const confettiColors = [
  "bg-rose-400",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-sky-400",
  "bg-fuchsia-400",
  "bg-indigo-400",
];

export default function CelebrationOverlay({
  isOpen,
  message,
}: CelebrationOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <span className="text-2xl font-bold text-rose-600">BOOM</span>
        </div>
        <p className="text-lg font-semibold text-slate-800">{message}</p>
        <p className="text-sm text-slate-500">You did it! Keep going.</p>
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={index}
              className={`confetti-piece ${confettiColors[index % confettiColors.length]}`}
              style={{
                left: `${10 + (index % 6) * 14}%`,
                animationDelay: `${index * 0.08}s`,
              }}
            />
          ))}
        </div>
      </div>
      <style jsx>{`
        .confetti-piece {
          position: absolute;
          top: 6%;
          width: 10px;
          height: 14px;
          border-radius: 999px;
          opacity: 0;
          animation: confetti-fall 1.2s ease forwards;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(120px) rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
