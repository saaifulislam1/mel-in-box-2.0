// src/app/(user)/dress/library/page.tsx

"use client";

import { useMemo } from "react";
import { BookOpen, Clock3, PlayCircle, ShoppingBag, Star, Users } from "lucide-react";
import HeadingSection from "@/components/HeadingSection";
import { useDressAccess } from "@/hooks/useDressAccess";
import Link from "next/link";

export default function DressLibraryPage() {
  const { owned } = useDressAccess();

  const badges = useMemo(
    () => ({
      Beginner: "bg-emerald-100 text-emerald-700",
      Intermediate: "bg-amber-100 text-amber-700",
      Advanced: "bg-red-100 text-red-700",
    }),
    []
  );

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 text-amber-900 px-4 pb-16 pt-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.25),transparent_30%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {/* <Link
            href="/dress"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white text-amber-800 font-semibold shadow hover:-translate-y-0.5 transition border border-amber-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link> */}
          <HeadingSection
            href="/dress"
            title="My Dress Up Box Library"
            textColor="text-amber-700"
            icon={ShoppingBag}
          />
        </div>

        {owned.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-amber-200 bg-white/80 p-8 text-center text-amber-700 shadow">
            <p className="font-semibold">No purchased courses yet.</p>
            <p className="text-sm text-amber-600">
              Browse courses and complete checkout to unlock your library.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {owned.map((course) => (
              <div
                key={course.id}
                className="w-full bg-white/95 rounded-3xl shadow-lg hover:shadow-xl transition flex flex-col sm:flex-row gap-3 overflow-hidden border border-amber-50"
              >
                <Link
                  href={`/dress/${course.id}`}
                  className="relative w-full sm:w-48 h-40 shrink-0 block"
                >
                  <img
                    src={course.thumbnailURL}
                    alt={course.title}
                    className="w-full h-full object-cover p-3 rounded-3xl"
                  />
                  <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-semibold">
                    <Clock3 className="w-3 h-3" />
                    {course.duration || "Course"}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
                    <div className="bg-black/45 rounded-full p-2.5">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                  </div>
                </Link>

                <div className="flex-1 py-4 pr-4 pl-4 sm:pl-0 flex flex-col gap-3 justify-center">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-amber-900">
                        {course.title}
                      </h2>
                      <p className="text-sm text-amber-700 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-amber-700">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students ?? 0} students
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.lessons ?? 0} lessons
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      {(course.rating ?? 4.9).toFixed(1)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        badges[course.level as keyof typeof badges] ||
                        "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {course.level}
                    </span>
                  </div>

                  <Link
                    href={`/dress/${course.id}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-amber-200 text-amber-700 font-semibold hover:bg-amber-50 transition"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Continue learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
