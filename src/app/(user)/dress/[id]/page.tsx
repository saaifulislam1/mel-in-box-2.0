// src/app/(user)/dress/[id]/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Clock3,
  Lock,
  PlayCircle,
  ShieldCheck,
  ShoppingBag,
  Star,
  Users,
  Video,
} from "lucide-react";
import HeadingSection from "@/components/HeadingSection";
import { CourseSection, getCourseById } from "@/lib/courseService";
import { useDressCart } from "@/hooks/useDressCart";
import { useDressAccess } from "@/hooks/useDressAccess";

type CoursePageData = {
  id: string;
  title: string;
  description?: string;
  price?: number;
  duration?: string;
  level?: string;
  lessons?: number;
  students?: number;
  rating?: number;
  tags?: string[];
  highlights?: string[];
  previewHeadline?: string;
  thumbnailURL?: string;
  previewURL?: string;
  sections?: CourseSection[];
};

const formatPrice = (price?: number) =>
  typeof price === "number" ? `$${price.toFixed(2)}` : "$0.00";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string | undefined;

  const { addItem, isInCart } = useDressCart();
  const { isOwned } = useDressAccess();

  const [course, setCourse] = useState<CoursePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonUrl, setActiveLessonUrl] = useState("");
  const [activeLessonTitle, setActiveLessonTitle] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      setLoading(true);
      const data = await getCourseById(courseId);
      if (!data) {
        router.push("/dress");
        return;
      }
      const sections = Array.isArray(data.sections) ? data.sections : [];
      const normalized = {
        ...data,
        price: Number(data.price) || 0,
        lessons:
          Number(data.lessons) ||
          sections.reduce(
            (count, section) => count + (section.lessons ? section.lessons.length : 0),
            0
          ),
        sections,
      };
      setCourse(normalized);
      const firstPreview =
        sections
          .flatMap((s) => s.lessons || [])
          .find((l) => l.preview && l.videoURL) || null;
      setActiveLessonUrl(firstPreview?.videoURL || data.previewURL || "");
      setActiveLessonTitle(
        firstPreview?.title || data.previewHeadline || data.title || ""
      );
      setLoading(false);
    };
    load();
  }, [courseId, router]);

  const owned = course ? isOwned(course.id) : false;

  const badges = useMemo(
    () => ({
      Beginner: "bg-emerald-100 text-emerald-700",
      Intermediate: "bg-amber-100 text-amber-700",
      Advanced: "bg-red-100 text-red-700",
    }),
    []
  );

  if (loading || !course) {
    return (
      <main className="relative min-h-screen bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 text-amber-900 px-4 pb-16 pt-24">
        <div className="relative max-w-6xl mx-auto">
          <HeadingSection
            href="/dress"
            title="Dress Up Box"
            textColor="text-amber-700"
            icon={ShoppingBag}
          />
          <p className="mt-6 text-amber-700">Loading course...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 text-amber-900 px-4 pb-16 pt-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.25),transparent_30%)] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto space-y-6">
        <HeadingSection
          href="/dress"
          title={course.title}
          textColor="text-amber-700"
          icon={ShoppingBag}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-4 lg:gap-6">
          <div className="bg-white/95 rounded-3xl p-4 sm:p-6 shadow-xl border border-amber-50 space-y-4">
            {activeLessonUrl || course.previewURL ? (
              <div className="relative w-full overflow-hidden rounded-2xl bg-black">
                <video
                  key={activeLessonUrl || course.previewURL}
                  src={activeLessonUrl || course.previewURL}
                  controls
                  autoPlay
                  controlsList="nodownload"
                  className="w-full max-h-[60vh] min-h-[240px] object-contain bg-black"
                />
              </div>
            ) : (
              <div className="w-full h-[55vh] flex items-center justify-center bg-amber-50 rounded-2xl">
                <p className="text-amber-700">Preview not available</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-700">
                <PlayCircle className="w-5 h-5" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-amber-500">
                    {activeLessonTitle ? "Now playing" : "Course preview"}
                  </p>
                  <h3 className="text-lg font-semibold">
                    {activeLessonTitle || course.previewHeadline || "Course preview"}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-amber-700">{course.description}</p>
              {course.highlights && course.highlights.length > 0 && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-800">
                  {course.highlights.slice(0, 6).map((item) => (
                    <li
                      key={item}
                      className="inline-flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2"
                    >
                      <ShieldCheck className="w-4 h-4 mt-0.5 text-amber-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl p-5 shadow-xl border border-amber-50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-amber-500 uppercase">Course</p>
                <h2 className="text-2xl font-bold text-amber-900">{course.title}</h2>
                <p className="text-sm text-amber-700">{course.description}</p>
              </div>
              {!owned && (
                <div className="text-right">
                  <p className="text-xs text-amber-500 uppercase">Price</p>
                  <p className="text-3xl font-bold text-amber-700">
                    {formatPrice(course.price)}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-amber-700">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50">
                <Video className="w-4 h-4" />
                {course.sections?.length ?? 0} sections
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50">
                <BookOpen className="w-4 h-4" />
                {course.lessons ?? 0} lessons
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50">
                <Clock3 className="w-4 h-4" />
                {course.duration}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50">
                <Users className="w-4 h-4" />
                {course.students ?? 0} students
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                {(course.rating ?? 4.9).toFixed(1)}
              </span>
              <span
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${
                  badges[course.level as keyof typeof badges] || "bg-amber-50 text-amber-700"
                }`}
              >
                Level: {course.level}
              </span>
            </div>

            {!owned ? (
              <div className="space-y-2">
                <button
                  onClick={() => addItem(course)}
                  disabled={isInCart(course.id)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 text-white font-semibold px-4 py-3 shadow-lg hover:-translate-y-0.5 transition disabled:opacity-70"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isInCart(course.id) ? "In Cart" : "Add to Cart"}
                </button>
                <p className="text-xs text-amber-600 text-center">
                  After purchase, all lessons unlock. Previews remain free for everyone.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  Owned — all lessons unlocked
                </div>
                <p className="text-xs text-amber-600">
                  Jump into any lesson below to continue learning.
                </p>
              </div>
            )}
          </div>
        </div>

        {course.sections && course.sections.length > 0 && (
          <section className="bg-white/95 rounded-3xl p-4 sm:p-6 shadow-lg border border-amber-50 space-y-3">
            <div className="flex items-center gap-2 text-amber-800">
              <BookOpen className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Course content</h3>
            </div>
            <div className="space-y-3">
              {course.sections.map((section, sectionIndex) => (
                <div
                  key={`${section.title}-${sectionIndex}`}
                  className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-amber-900">
                      {section.title}
                    </p>
                    <span className="text-xs text-amber-600">
                      {(section.lessons || []).length} lessons
                    </span>
                  </div>
                  <div className="space-y-2">
                    {section.lessons?.map((lesson, lessonIndex) => {
                      const playable =
                        (lesson.preview || owned) && Boolean(lesson.videoURL);
                      const isActive =
                        activeLessonUrl && lesson.videoURL === activeLessonUrl;
                      return (
                        <button
                          key={`${lesson.title}-${lessonIndex}`}
                          type="button"
                          disabled={!playable}
                          onClick={() => {
                            if (!playable) return;
                            setActiveLessonUrl(lesson.videoURL || "");
                            setActiveLessonTitle(lesson.title);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-sm flex items-center justify-between gap-2 ${
                            playable
                              ? "border-amber-200 bg-white hover:bg-amber-100/70"
                              : "border-amber-100 bg-white/70"
                          } ${isActive ? "ring-2 ring-amber-300" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold">
                              {lessonIndex + 1}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-amber-900">
                                {lesson.title}
                              </span>
                              <span className="text-xs text-amber-600">
                                {lesson.duration || "Lesson"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            {owned ? (
                              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                Unlocked
                              </span>
                            ) : lesson.preview ? (
                              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                Preview
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 inline-flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Locked
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
