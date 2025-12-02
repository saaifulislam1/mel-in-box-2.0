// src/app/(user)/page.tsx

"use client";

import {
  Gamepad2,
  Book,
  Image as ImageIcon,
  PartyPopper,
  Users,
  Shirt,
  Star,
  Phone,
  Heart,
  Smile,
} from "lucide-react";

export default function UserDashboard() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 overflow-hidden pt-24">
      {/* === FLOATING ICONS LEFT === */}
      <div className="absolute left-10 top-38 animate-bounce-slow pointer-events-none">
        <Star className="text-yellow-400 w-10 h-10 opacity-90" />
      </div>

      <div className="absolute left-8 bottom-12 animate-bounce-slow-2 pointer-events-none">
        <Smile className="text-blue-400 w-10 h-10 opacity-90" />
      </div>

      {/* === FLOATING ICONS RIGHT === */}
      <div className="absolute right-10 top-40 animate-bounce-slow-3 pointer-events-none">
        <Heart className="text-pink-400 w-8 h-8 opacity-90" />
      </div>

      <div className="absolute right-14 bottom-10 animate-bounce-slow pointer-events-none">
        <Star className="text-purple-400 w-8 h-8 opacity-90" />
      </div>

      {/* === HEADING === */}
      <div className="text-center mt-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow">
          Welcome to Mel In a Box!
        </h1>
        <div className="flex justify-center items-center space-x-2 mb-4 px-4">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
          <p className="text-gray-700 text-base sm:text-lg">
            Choose your adventure!
          </p>
          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
        </div>
      </div>

      {/* === GRID OPTIONS === */}
      <section className="mt-8 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-xl mx-auto">
        {cards.map((card, index) => (
          <a
            key={index}
            href={card.href}
            className={`rounded-3xl shadow-xl p-6 text-white text-center font-semibold bg-gradient-to-br ${card.gradient} relative overflow-hidden`}
          >
            <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3 animate-bounce">
              {card.emoji}
            </div>
            <h2 className="text-xl">{card.title}</h2>
            <p className="text-sm opacity-90">{card.subtitle}</p>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-14 h-14 bg-white/20 rounded-bl-3xl"></div>
          </a>
        ))}
      </section>
      {/* === ANIMATIONS === */}
      <style>
        {`
          .animate-bounce-slow {
            animation: bounce-slow 3s infinite ease-in-out;
          }
          .animate-bounce-slow-2 {
            animation: bounce-slow 3.5s infinite ease-in-out;
          }
          .animate-bounce-slow-3 {
            animation: bounce-slow 2.8s infinite ease-in-out;
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}
      </style>
      <div className="w-full flex justify-center align-middle  mt-8 mb-[90px] px-4 ">
        {" "}
        <div className="flex px-2  align-middle  justify-center bg-white w-[390px] rounded-xl h-[200px] flex-col space-y-3">
          <img
            src="images/mel-logo.png"
            alt="Mel In a Box Logo"
            className="w-28 h-28 mx-auto rounded-full object-contain"
          />
          <p className=" space-x-3 text-center align-middle">
            🎁 Ready to explore? Tap any category to unlock the magic in your
            box! 🎁
          </p>
        </div>
      </div>
    </main>
  );
}

// === CARD DATA ===
const cards = [
  {
    title: "Games & Fun",
    subtitle: "8 Amazing Games!",
    icon: Gamepad2,
    emoji: "🎮",
    href: "/games",
    gradient: "from-orange-400 to-red-500",
  },
  {
    title: "Story Time",
    subtitle: "Party Videos & Stories",
    icon: Book,
    emoji: "📖",
    href: "/story-time",
    gradient: "from-green-400 to-teal-500",
  },
  {
    title: "Photo Gallery",
    subtitle: "Party Memories",
    icon: ImageIcon,
    href: "/gallery",
    emoji: "📸",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    title: "Kid Parties",
    subtitle: "Party Packages",
    icon: PartyPopper,
    href: "/parties",
    emoji: "🎉",
    gradient: "from-purple-400 to-indigo-500",
  },
  {
    title: "Social Fun",
    subtitle: "Share & Connect",
    icon: Users,
    emoji: "👨‍👩‍👧‍👦",
    href: "/social-fun",
    gradient: "from-pink-400 to-red-400",
  },
  {
    title: "Dress Up Box",
    subtitle: "Fashion Courses",
    icon: Shirt,
    emoji: "👗",
    href: "/dress",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    title: "About Me",
    subtitle: "Meet the Creator",
    icon: Star,
    emoji: "🌟",
    href: "/about",
    gradient: "from-blue-400 to-sky-500",
  },
  {
    title: "Contact Us",
    subtitle: "Get in Touch",
    icon: Phone,
    emoji: "📞",
    href: "/contact",
    gradient: "from-teal-400 to-green-500",
  },
];
