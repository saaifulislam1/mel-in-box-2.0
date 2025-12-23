// src/app/(user)/dress/page.tsx

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Clock3,
  GraduationCap,
  Heart,
  Lock,
  Pause,
  Play,
  PlayCircle,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Timer,
  Maximize2,
  Minimize2,
  Users,
  Video,
} from "lucide-react";
import HeadingSection from "@/components/HeadingSection";
import { getAllCourses, type CourseData } from "@/lib/courseService";
import { useDressCart } from "@/hooks/useDressCart";
import { useDressAccess } from "@/hooks/useDressAccess";
import Link from "next/link";
import { CourseSection } from "@/lib/courseService";

type Course = CourseData & {
  id: string;
  rating?: number;
  sections?: CourseSection[];
};

type CachePayload = { courses: Course[]; updatedAt: number };

const CACHE_KEY = "dress-courses-cache";

const formatPrice = (price?: number) =>
  typeof price === "number" ? `$${price.toFixed(2)}` : "$0.00";

const formatTime = (time: number) => {
  if (!Number.isFinite(time) || time <= 0) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export default function DressPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<Course | null>(null);
  const [activeLessonUrl, setActiveLessonUrl] = useState<string>("");
  const [activeLessonTitle, setActiveLessonTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const { items, addItem, isInCart } = useDressCart();
  const { isOwned } = useDressAccess();
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const badges = useMemo(
    () => ({
      Beginner: "bg-emerald-100 text-emerald-700",
      Intermediate: "bg-amber-100 text-amber-700",
      Advanced: "bg-red-100 text-red-700",
    }),
    []
  );

  const loadCourses = async (options?: { background?: boolean }) => {
    const background = options?.background ?? false;
    if (!background) setLoading(true);
    try {
      const data = (await getAllCourses()) as Course[];
      const normalized = data.map((c) => {
        const sections = Array.isArray(c.sections) ? c.sections : [];
        const sectionLessonCount = sections.reduce(
          (count, section) => count + (section.lessons ? section.lessons.length : 0),
          0
        );
        return {
          id: c.id,
          title: c.title ?? "Untitled Course",
          description: c.description ?? "",
          price: Number(c.price) || 0,
          duration: c.duration ?? "45 mins",
          level: c.level ?? "Beginner",
          lessons: Number(c.lessons) || sectionLessonCount,
          students: Number(c.students) || 0,
          rating: c.rating ? Number(c.rating) : 4.9,
          tags: Array.isArray(c.tags) ? c.tags : [],
          highlights: Array.isArray(c.highlights) ? c.highlights : [],
          thumbnailURL: c.thumbnailURL || "/images/mel-logo.png",
          previewURL: c.previewURL || "",
          previewHeadline: c.previewHeadline || "Preview this course",
          sections,
        };
      });
      setCourses(normalized);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            courses: normalized,
            updatedAt: Date.now(),
          } as CachePayload)
        );
      }
    } catch (err) {
      console.error("Failed to load courses", err);
      setCourses([]);
    } finally {
      if (!background) setLoading(false);
    }
  };

  useEffect(() => {
    const cached =
      typeof window !== "undefined"
        ? (localStorage.getItem(CACHE_KEY) as string | null)
        : null;

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as CachePayload;
        if (parsed?.courses?.length) {
          setCourses(parsed.courses);
          setLoading(false);
          loadCourses({ background: true });
          return;
        }
      } catch {
        // ignore and fall through
      }
    }

    loadCourses();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!selected) return;
    const firstPreviewLesson =
      selected.sections
        ?.flatMap((s) => s.lessons || [])
        .find((lesson) => lesson.preview && lesson.videoURL) || null;

    setActiveLessonUrl(firstPreviewLesson?.videoURL || selected.previewURL || "");
    setActiveLessonTitle(firstPreviewLesson?.title || selected.previewHeadline || selected.title);
    setCurrentTime(0);
    setDuration(0);
  }, [selected]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate, activeLessonUrl]);

  useEffect(() => {
    const handler = () => {
      const fsElement =
        document.fullscreenElement ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document as any).webkitFullscreenElement ||
        null;
      setIsFullscreen(Boolean(fsElement));
    };
    document.addEventListener("fullscreenchange", handler);
    // @ts-expect-error webkit fullscreen for Safari
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      // @ts-expect-error webkit fullscreen for Safari
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  const handleAddToCart = (course: Course) => {
    addItem(course);
    setToast(`${course.title} added to cart`);
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const fsElement =
      document.fullscreenElement ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).webkitFullscreenElement ||
      null;
    if (!fsElement) {
      const request =
        container.requestFullscreen ||
        // @ts-expect-error webkit
        container.webkitRequestFullscreen ||
        undefined;
      if (request) request.call(container);
    } else {
      const exit =
        document.exitFullscreen ||
        // @ts-expect-error webkit
        document.webkitExitFullscreen ||
        undefined;
      if (exit) exit.call(document);
    }
  }, []);

  const handleSeek = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
  }, []);

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 text-amber-900 px-4 pb-16 pt-24 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.25),transparent_30%)] pointer-events-none" />

      <div className="fixed right-4 top-28 z-30">
        <Link
          href="/dress/cart"
          className="relative inline-flex items-center gap-2 rounded-full bg-amber-500 text-white px-4 py-2 shadow-lg shadow-amber-200/60 hover:-translate-y-0.5 transition"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-sm font-semibold">
            Cart {items.length > 0 ? `(${items.length})` : ""}
          </span>
          {items.length > 0 && (
            <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-white text-amber-600 text-xs font-bold flex items-center justify-center shadow">
              {items.length}
            </span>
          )}
        </Link>
      </div>

      <div className="relative max-w-6xl mx-auto space-y-6">
        <HeadingSection
          href="/"
          title="Dress Up Box"
          textColor="text-amber-700"
          icon={ShoppingBag}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dress/cart"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-white font-semibold shadow hover:-translate-y-0.5 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            Cart {items.length > 0 ? `(${items.length})` : ""}
          </Link>
          <Link
            href="/dress/library"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-amber-200 bg-white text-amber-800 font-semibold shadow hover:-translate-y-0.5 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            My Library
          </Link>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.9fr] gap-4 lg:gap-6">
          <div className="bg-white/90 rounded-3xl p-6 shadow-xl border border-amber-50 space-y-4 relative overflow-hidden">
            <div className="absolute right-3 top-3 text-amber-300">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Premium Courses, Kid Friendly
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-amber-800">
                  Learn magical dress-up skills with Mel
                </h1>
                <p className="text-sm sm:text-base text-amber-700 mt-1">
                  Preview lessons for free, then unlock the full course to craft
                  show-stopping looks.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-50 text-amber-700">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                <div>
                  <p className="text-xs">Average rating</p>
                  <p className="font-semibold text-lg">
                    {courses[0]?.rating ?? 4.9} / 5
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Lessons", value: "Bite-sized videos", icon: Video },
                { label: "Skill level", value: "Beginner friendly", icon: GraduationCap },
                { label: "Downloadables", value: "Look sheets", icon: BookOpen },
                { label: "Access", value: "Watch on any device", icon: ShieldCheck },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-amber-50 px-3 py-3 text-amber-700 flex items-start gap-2"
                >
                  <item.icon className="w-4 h-4 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-amber-500">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl p-5 shadow-xl border border-amber-50 space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <Heart className="w-5 h-5 text-rose-400" />
              <p className="font-semibold">Why Dress Up Box?</p>
            </div>
            <ul className="space-y-2 text-sm text-amber-700">
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-1 text-amber-500" />
                Hands-on looks with friendly walkthroughs.
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-1 text-amber-500" />
                Free previews so kids know exactly what they get.
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-1 text-amber-500" />
                Save favorites to cart and check out together.
              </li>
            </ul>
            <Link
              href="/dress/cart"
              className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-amber-500 text-white font-semibold px-4 py-3 shadow-lg hover:-translate-y-0.5 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              Go to cart
            </Link>
          </div>
        </section>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="w-full bg-white/90 rounded-3xl shadow-md flex flex-col sm:flex-row gap-3 overflow-hidden border border-amber-50 p-4 animate-pulse"
              >
                <div className="w-full sm:w-48 h-36 bg-amber-100 rounded-2xl" />
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 w-2/3 bg-amber-100 rounded-full" />
                  <div className="h-3 w-full bg-amber-50 rounded-full" />
                  <div className="h-3 w-5/6 bg-amber-50 rounded-full" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-amber-50 rounded-full" />
                    <div className="h-6 w-16 bg-amber-50 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-amber-200 bg-white/80 p-8 text-center text-amber-700 shadow">
            <p className="font-semibold">No courses yet.</p>
            <p className="text-sm text-amber-600">
              Check back soon for new Dress Up Box adventures!
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {courses.map((course) => (
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
                    {course.duration}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelected(course);
                    }}
                    className="absolute inset-0 flex items-center justify-center text-white"
                    aria-label={`Preview ${course.title}`}
                  >
                    <div className="bg-black/45 rounded-full p-2.5 hover:scale-105 transition">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                  </button>
                </Link>

                <div className="flex-1 py-4 pr-4 pl-4 sm:pl-0 flex flex-col gap-3 justify-center">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/dress/${course.id}`}
                        className="text-lg sm:text-xl font-semibold text-amber-900 hover:underline"
                      >
                        {course.title}
                      </Link>
                      <p className="text-sm text-amber-700 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-amber-500 uppercase">
                        Course Price
                      </p>
                      <p className="text-xl font-bold text-amber-700">
                        {formatPrice(course.price)}
                      </p>
                    </div>
                  </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-amber-700">
              <span className="inline-flex items-center gap-1">
                <Users className="w-4 h-4" />
                {course.students ?? 0} students
              </span>
              <span className="inline-flex items-center gap-1">
                <Video className="w-4 h-4" />
                {course.sections?.length ?? 0} sections
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

                  {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {course.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      onClick={() => setSelected(course)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-amber-200 text-amber-700 font-semibold hover:bg-amber-50 transition"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleAddToCart(course)}
                      disabled={isInCart(course.id) || isOwned(course.id)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-amber-500 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isOwned(course.id)
                        ? "Owned"
                        : isInCart(course.id)
                        ? "In cart"
                        : "Add to cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-start md:items-center justify-center px-4 pt-16 pb-8"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 p-2.5 rounded-full bg-white/95 text-amber-700 shadow-lg hover:bg-amber-100 hover:scale-105 active:scale-95 transition z-10"
              aria-label="Close preview"
              type="button"
            >
              ✕
            </button>
            {activeLessonUrl || selected.previewURL ? (
              <div
                ref={containerRef}
                className="relative w-full overflow-hidden rounded-b-2xl bg-gradient-to-br from-amber-200 via-orange-200 to-amber-100 p-1"
              >
                <div className="relative rounded-xl overflow-hidden bg-black">
                  <video
                    key={activeLessonUrl || selected.previewURL}
                    ref={videoRef}
                    src={activeLessonUrl || selected.previewURL}
                    controls={false}
                    autoPlay
                    controlsList="nodownload"
                    playsInline
                    className="w-full max-h-[60vh] min-h-[240px] object-contain bg-black"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedMetadata={(event) => {
                      setDuration(event.currentTarget.duration || 0);
                      setCurrentTime(event.currentTarget.currentTime || 0);
                    }}
                    onTimeUpdate={(event) => {
                      setCurrentTime(event.currentTarget.currentTime || 0);
                    }}
                    onEnded={() => setIsPlaying(false)}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <input
                          type="range"
                          min={0}
                          max={duration || 0}
                          step={0.1}
                          value={Math.min(currentTime, duration || 0)}
                          onChange={(event) => handleSeek(Number(event.target.value))}
                          className="w-full accent-amber-300"
                          aria-label="Video progress"
                          disabled={!duration}
                        />
                        <div className="flex items-center justify-between text-xs text-white/80">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-white">
                        <button
                          onClick={togglePlay}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 text-white font-semibold hover:bg-white/25 transition"
                          aria-label={isPlaying ? "Pause video" : "Play video"}
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => skip(-10)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 text-white font-semibold hover:bg-white/25 transition"
                          aria-label="Rewind 10 seconds"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => skip(10)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 text-white font-semibold hover:bg-white/25 transition"
                          aria-label="Forward 10 seconds"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 text-white font-semibold hover:bg-white/25 transition">
                          <Timer className="w-4 h-4" />
                          <select
                            value={playbackRate}
                            onChange={(e) => setPlaybackRate(Number(e.target.value))}
                            className="bg-transparent border-0 text-white focus:outline-none"
                            aria-label="Playback speed"
                          >
                            {[0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                              <option key={rate} value={rate} className="text-amber-900">
                                {rate}x
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          onClick={toggleFullscreen}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 text-white font-semibold hover:bg-white/25 transition"
                          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                          {isFullscreen ? (
                            <Minimize2 className="w-4 h-4" />
                          ) : (
                            <Maximize2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-[55vh] flex items-center justify-center bg-amber-50">
                <p className="text-amber-700">Preview not available</p>
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-700">
                <PlayCircle className="w-5 h-5" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-amber-500">
                    {activeLessonTitle ? "Now playing" : "Course preview"}
                  </p>
                  <h3 className="text-lg font-semibold">
                    {activeLessonTitle ||
                      selected.previewHeadline ||
                      "Course preview"}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-amber-700">{selected.description}</p>
              {selected.highlights && selected.highlights.length > 0 && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-800">
                  {selected.highlights.slice(0, 4).map((item: string) => (
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
              {selected.sections && selected.sections.length > 0 && (
                <div className="pt-3 space-y-2">
                  <p className="text-sm font-semibold text-amber-800">
                    Lessons
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {selected.sections.map((section) => (
                      <div
                        key={section.title}
                        className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 space-y-2"
                      >
                        <p className="text-sm font-semibold text-amber-900">
                          {section.title}
                        </p>
                        <div className="space-y-2">
                          {section.lessons?.map((lesson) => {
                            const isPreview = !!lesson.preview;
                            const ownedCourse = selected ? isOwned(selected.id) : false;
                            const playable =
                              (ownedCourse || isPreview) && Boolean(lesson.videoURL);
                            const isActive =
                              activeLessonUrl &&
                              lesson.videoURL === activeLessonUrl;
                            return (
                              <button
                                key={lesson.title}
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
                                <div className="flex flex-col">
                                  <span className="font-semibold text-amber-900">
                                    {lesson.title}
                                  </span>
                                  <span className="text-xs text-amber-600">
                                    {lesson.duration || "Lesson"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-semibold">
                                  {ownedCourse ? (
                                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                      Unlocked
                                    </span>
                                  ) : isPreview ? (
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
                  <p className="text-xs text-amber-600">
                    Unlock all lessons by adding the course to your cart.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-4 py-2 rounded-full shadow-lg z-40">
          {toast}
        </div>
      )}
    </main>
  );
}
