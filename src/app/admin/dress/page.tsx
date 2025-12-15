// src/app/admin/dress/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import {
  getAllCourses,
  deleteCourse,
  type CourseData,
} from "@/lib/courseService";
import {
  AlertCircle,
  BookOpen,
  Clock3,
  GraduationCap,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/Spinner";

type Course = CourseData & { id: string };
const formatPrice = (price?: number) =>
  typeof price === "number" ? `$${price.toFixed(2)}` : "$0.00";

export default function AdminDressPage() {
  useAdminGuard();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadCourses = async () => {
      setLoading(true);
      try {
        const data = await getAllCourses();
        if (active) setCourses(data as Course[]);
      } catch (err) {
        console.error("Unable to load courses", err);
        if (active) setCourses([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCourses();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-200">
          <ShoppingBag className="w-5 h-5 text-amber-300" />
          <h1 className="text-xl font-semibold">Dress Up Box Courses</h1>
        </div>
        <Link
          href="/admin/dress/upload"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-slate-900 font-semibold shadow hover:-translate-y-0.5 transition"
        >
          <Upload className="w-4 h-4" />
          Add Course
        </Link>
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200">
        <p className="text-sm text-slate-300">
          Upload thumbnails, preview videos, and pricing so families can browse
          the Dress Up Box catalog.
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm shadow">
          <AlertCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      {loading ? (
        <Spinner label="Loading courses..." />
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-slate-300">
          <p>No courses yet.</p>
          <Link
            href="/admin/dress/upload"
            className="inline-flex items-center gap-2 px-4 py-2 mt-3 rounded-full bg-amber-400 text-slate-900 font-semibold shadow hover:-translate-y-0.5 transition"
          >
            <Upload className="w-4 h-4" />
            Upload your first course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <article
              key={course.id}
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur flex flex-col"
            >
              <div className="relative h-48 bg-slate-900">
                <img
                  src={course.thumbnailURL}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-semibold shadow">
                  {course.duration}
                </span>
                <button
                  onClick={() => setConfirmId(course.id)}
                  disabled={deletingId === course.id}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/70 transition disabled:opacity-60"
                  aria-label="Delete course"
                >
                  {deletingId === course.id ? (
                    <Spinner label="Deleting..." />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <h3 className="text-lg font-semibold text-white">
                    {course.title}
                  </h3>
                </div>
                {course.description && (
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {course.description}
                  </p>
                )}
                {course.sections && course.sections.length > 0 && (
                  <div className="text-xs text-slate-300">
                    {course.sections.length} sections /{" "}
                    {course.sections.reduce(
                      (count, section) =>
                        count + (section.lessons ? section.lessons.length : 0),
                      0
                    )}{" "}
                    lessons
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                    <BookOpen className="w-3 h-3 text-amber-300" />
                    {course.lessons ?? 0} lessons
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                    <Users className="w-3 h-3 text-amber-300" />
                    {course.students ?? 0} students
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                    <Star className="w-3 h-3 text-amber-300" />
                    {(course.rating ?? 4.9).toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                    <GraduationCap className="w-3 h-3 text-amber-300" />
                    {course.level}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-200">
                    <p className="text-xs text-slate-400">Price</p>
                    <p className="text-lg font-semibold">
                      {formatPrice(course.price)}
                    </p>
                  </div>
                  <Link
                    href={`/admin/dress/${course.id}/edit`}
                    className="text-xs text-amber-300 hover:text-amber-200 underline"
                  >
                    Edit
                  </Link>
                  <div className="inline-flex items-center gap-1 text-xs text-slate-300">
                    <Clock3 className="w-4 h-4 text-amber-300" />
                    Updated
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-slate-900 text-white rounded-2xl border border-white/10 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-300" />
                <h3 className="text-lg font-semibold">Delete course?</h3>
              </div>
              <button
                onClick={() => setConfirmId(null)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-300">
              This will remove the course and its preview from Dress Up Box.
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-full border border-white/15 text-slate-200 hover:bg-white/5 transition"
                disabled={deletingId === confirmId}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!confirmId) return;
                  setDeletingId(confirmId);
                  try {
                    await deleteCourse(confirmId);
                    setMessage("Course deleted");
                    setCourses((prev) =>
                      prev.filter((course) => course.id !== confirmId)
                    );
                  } catch (err) {
                    console.error("Failed to delete course", err);
                    setMessage("Unable to delete course right now.");
                  } finally {
                    setDeletingId(null);
                    setConfirmId(null);
                  }
                }}
                disabled={deletingId === confirmId}
                className="px-4 py-2 rounded-full bg-rose-500 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
              >
                {deletingId === confirmId ? (
                  <Spinner label="Deleting..." />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
