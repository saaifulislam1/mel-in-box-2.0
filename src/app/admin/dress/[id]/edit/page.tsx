// src/app/admin/dress/[id]/edit/page.tsx

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import {
  CourseData,
  CourseLesson,
  CourseSection,
  getCourseById,
  updateCourse,
  uploadCourseFile,
} from "@/lib/courseService";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  PlusCircle,
  Save,
  ShoppingBag,
  Tags,
  Trash2,
  Video,
} from "lucide-react";

type LessonForm = {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
  videoFile?: File | null;
  videoURL?: string;
};

type SectionForm = {
  id: string;
  title: string;
  lessons: LessonForm[];
};

const genId = () => Math.random().toString(36).slice(2);
const buildFilePath = (folder: string, filename: string) =>
  `courses/${folder}/${
    (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID?.()) ||
    genId()
  }-${filename}`;

export default function EditCoursePage() {
  useAdminGuard();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [lessons, setLessons] = useState("");
  const [students, setStudents] = useState("");
  const [rating, setRating] = useState("4.9");
  const [previewHeadline, setPreviewHeadline] = useState("Preview this course");
  const [tags, setTags] = useState("");
  const [highlights, setHighlights] = useState("");

  const [thumbnailURL, setThumbnailURL] = useState("");
  const [previewURL, setPreviewURL] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [sections, setSections] = useState<SectionForm[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;
      setLoading(true);
      const course = await getCourseById(courseId);
      if (!course) {
        router.push("/admin/dress");
        return;
      }

      setTitle(course.title || "");
      setDescription(course.description || "");
      setPrice(String(course.price ?? ""));
      setDuration(course.duration || "");
      setLevel(course.level || "Beginner");
      setLessons(String(course.lessons ?? ""));
      setStudents(String(course.students ?? ""));
      setRating(String(course.rating ?? "4.9"));
      setPreviewHeadline(course.previewHeadline || "Preview this course");
      setTags(Array.isArray(course.tags) ? course.tags.join(", ") : "");
      setHighlights(
        Array.isArray(course.highlights) ? course.highlights.join("\n") : ""
      );
      setThumbnailURL(course.thumbnailURL || "");
      setPreviewURL(course.previewURL || "");
      const sectionData =
        (course.sections as CourseSection[] | undefined) || [];
      setSections(
        sectionData.map((s) => ({
          id: genId(),
          title: s.title,
          lessons:
            s.lessons?.map((l) => ({
              id: genId(),
              title: l.title,
              duration: l.duration || "",
              isPreview: !!l.preview,
              videoURL: l.videoURL,
              videoFile: null,
            })) || [],
        })) || []
      );
      setLoading(false);
    };

    load();
  }, [courseId, router]);

  const sectionLessonCount = useMemo(
    () =>
      sections.reduce(
        (count, section) => count + (section.lessons ? section.lessons.length : 0),
        0
      ),
    [sections]
  );

  const addSection = () =>
    setSections((prev) => [...prev, { id: genId(), title: "New section", lessons: [] }]);

  const updateSectionTitle = (id: string, next: string) =>
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: next } : s))
    );

  const addLesson = (sectionId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: [
                ...s.lessons,
                {
                  id: genId(),
                  title: "New lesson",
                  duration: "",
                  isPreview: false,
                  videoFile: null,
                },
              ],
            }
          : s
      )
    );

  const updateLesson = (
    sectionId: string,
    lessonId: string,
    changes: Partial<LessonForm>
  ) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              lessons: s.lessons.map((l) =>
                l.id === lessonId ? { ...l, ...changes } : l
              ),
            }
          : s
      )
    );

  const removeLesson = (sectionId: string, lessonId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) }
          : s
      )
    );

  const buildSectionsPayload = async (
    current: SectionForm[]
  ): Promise<CourseSection[]> => {
    const uploaded: CourseSection[] = [];
    for (const section of current) {
      const lessonsPayload: CourseLesson[] = [];
      for (const lesson of section.lessons) {
        let videoURL = lesson.videoURL || "";
        if (lesson.videoFile) {
          videoURL = await uploadCourseFile(
            buildFilePath("lessons", lesson.videoFile.name),
            lesson.videoFile
          );
        }
        lessonsPayload.push({
          title: lesson.title,
          duration: lesson.duration,
          videoURL,
          preview: lesson.isPreview,
        });
      }
      uploaded.push({ title: section.title, lessons: lessonsPayload });
    }
    return uploaded;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    setSaving(true);
    try {
      let nextThumbnail = thumbnailURL;
      let nextPreview = previewURL;

      if (thumbnailFile) {
        nextThumbnail = await uploadCourseFile(
          buildFilePath("thumbnails", thumbnailFile.name),
          thumbnailFile
        );
      }
      if (previewFile) {
        nextPreview = await uploadCourseFile(
          buildFilePath("previews", previewFile.name),
          previewFile
        );
      }

      const payload: Partial<CourseData> = {
        title,
        description,
        price: Number(price) || 0,
        duration,
        level,
        lessons: Number(lessons) || sectionLessonCount,
        students: Number(students) || 0,
        rating: Number(rating) || 4.9,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        highlights: highlights
          .split("\n")
          .map((h) => h.trim())
          .filter(Boolean),
        thumbnailURL: nextThumbnail,
        previewURL: nextPreview,
        previewHeadline,
        sections: await buildSectionsPayload(sections),
      };

      await updateCourse(courseId, payload);
      router.push("/admin/dress");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="flex items-center gap-2 text-slate-200">
          <ShoppingBag className="w-5 h-5 text-amber-300" />
          <h1 className="text-xl font-semibold">Loading course...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-slate-200">
        <ShoppingBag className="w-5 h-5 text-amber-300" />
        <h1 className="text-xl font-semibold">Edit Course</h1>
        <button
          type="button"
          onClick={() => router.push("/admin/dress")}
          className="ml-auto inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl p-6 space-y-4">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Price</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Duration</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Skill level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Lessons</label>
              <input
                type="number"
                value={lessons}
                onChange={(e) => setLessons(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Students</label>
              <input
                type="number"
                value={students}
                onChange={(e) => setStudents(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Rating</label>
              <input
                type="number"
                step="0.1"
                max="5"
                min="0"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-200 flex items-center gap-2">
                <Tags className="w-4 h-4 text-amber-300" />
                Tags (comma separated)
              </label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Preview headline</label>
              <input
                value={previewHeadline}
                onChange={(e) => setPreviewHeadline(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200">Highlights (one per line)</label>
            <textarea
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-200">Thumbnail</p>
              <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-4 space-y-2">
                {thumbnailURL && (
                  <p className="text-xs text-slate-300">Current: {thumbnailURL}</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  className="text-slate-200"
                />
                <p className="text-xs text-slate-400">
                  Upload to replace the existing thumbnail.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-200 flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-300" />
                Preview video
              </p>
              <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-4 space-y-2">
                {previewURL && (
                  <p className="text-xs text-slate-300">Current: {previewURL}</p>
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                  className="text-slate-200"
                />
                <p className="text-xs text-slate-400">
                  Uploading replaces the preview video shown to users.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-200">Sections & lessons</label>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-amber-400 text-slate-900 text-sm font-semibold shadow hover:-translate-y-0.5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Add section
              </button>
            </div>

            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <input
                      value={section.title}
                      onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                      placeholder="Section title"
                    />
                    <button
                      type="button"
                      onClick={() => addLesson(section.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-slate-200 text-sm font-semibold border border-white/15 hover:bg-white/15 transition"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add lesson
                    </button>
                  </div>

                  {section.lessons.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      No lessons yet. Add a lesson to this section.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2"
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <input
                              value={lesson.title}
                              onChange={(e) =>
                                updateLesson(section.id, lesson.id, { title: e.target.value })
                              }
                              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                              placeholder="Lesson title"
                            />
                            <input
                              value={lesson.duration}
                              onChange={(e) =>
                                updateLesson(section.id, lesson.id, { duration: e.target.value })
                              }
                              className="w-32 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                              placeholder="05:00"
                            />
                            <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                              <input
                                type="checkbox"
                                checked={lesson.isPreview}
                                onChange={(e) =>
                                  updateLesson(section.id, lesson.id, {
                                    isPreview: e.target.checked,
                                  })
                                }
                                className="rounded border-white/30 bg-transparent"
                              />
                              Free preview
                            </label>
                            <button
                              type="button"
                              onClick={() => removeLesson(section.id, lesson.id)}
                              className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-slate-400">
                              Lesson video {lesson.videoURL ? "(kept if empty)" : ""}
                            </label>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) =>
                                updateLesson(section.id, lesson.id, {
                                  videoFile: e.target.files?.[0] || null,
                                })
                              }
                              className="text-slate-200"
                            />
                            {lesson.videoURL && (
                              <p className="text-[11px] text-slate-300">
                                Current: {lesson.videoURL}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-amber-400 text-slate-900 font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
