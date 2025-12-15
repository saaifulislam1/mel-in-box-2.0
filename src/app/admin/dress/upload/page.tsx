// src/app/admin/dress/upload/page.tsx

"use client";

import { FormEvent, useState } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import {
  createCourse,
  CourseLesson,
  CourseSection,
  uploadCourseFile,
  type CourseData,
} from "@/lib/courseService";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  PlusCircle,
  ShoppingBag,
  Tags,
  Video,
  Trash2,
} from "lucide-react";
type LessonForm = {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
  videoFile: File | null;
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

export default function UploadCoursePage() {
  useAdminGuard();
  const router = useRouter();

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

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [sections, setSections] = useState<SectionForm[]>([
    { id: genId(), title: "Introduction", lessons: [] },
  ]);

  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!thumbnail || !previewFile) return;

    setLoading(true);

    try {
      const thumbURL = await uploadCourseFile(
        buildFilePath("thumbnails", thumbnail.name),
        thumbnail
      );

      const previewURL = await uploadCourseFile(
        buildFilePath("previews", previewFile.name),
        previewFile
      );

      const sectionLessonCount = sections.reduce(
        (count, section) => count + section.lessons.length,
        0
      );

      const payload: CourseData = {
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
        thumbnailURL: thumbURL,
        previewURL,
        previewHeadline,
        sections: await buildSectionsPayload(sections),
      };

      await createCourse(payload);
      router.push("/admin/dress");
    } catch (err) {
      console.error("Failed to upload course", err);
      setLoading(false);
    }
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { id: genId(), title: "New section", lessons: [] },
    ]);
  };

  const updateSectionTitle = (id: string, title: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, title } : section
      )
    );
  };

  const addLesson = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      lessons: [
                        ...section.lessons,
                        {
                          id: genId(),
                          title: "New lesson",
                          duration: "",
                          isPreview: false,
                          videoFile: null,
                        },
              ],
            }
          : section
      )
    );
  };

  const updateLesson = (
    sectionId: string,
    lessonId: string,
    changes: Partial<LessonForm>
  ) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, ...changes } : lesson
              ),
            }
          : section
      )
    );
  };

  const removeLesson = (sectionId: string, lessonId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.filter((lesson) => lesson.id !== lessonId),
            }
          : section
      )
    );
  };

  const buildSectionsPayload = async (
    current: SectionForm[]
  ): Promise<CourseSection[]> => {
    const uploaded: CourseSection[] = [];

    for (const section of current) {
      const lessonsPayload: CourseLesson[] = [];
      for (const lesson of section.lessons) {
        let videoURL = "";
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

      uploaded.push({
        title: section.title,
        lessons: lessonsPayload,
      });
    }

    return uploaded;
  };

  return (
    <main className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-slate-200">
        <ShoppingBag className="w-5 h-5 text-amber-300" />
        <h1 className="text-xl font-semibold">Upload Dress Up Box Course</h1>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl p-6 space-y-4">
        <p className="text-sm text-slate-300">
          Add a course with pricing, preview video, and thumbnail. Highlights
          help parents understand what&apos;s inside.
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Title</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                placeholder="Princess Styling Course"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Price</label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                placeholder="29.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Duration</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                placeholder="45 mins"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
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
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                placeholder="8"
                value={lessons}
                onChange={(e) => setLessons(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Students</label>
              <input
                type="number"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                placeholder="120"
                value={students}
                onChange={(e) => setStudents(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Rating</label>
              <input
                type="number"
                step="0.1"
                max="5"
                min="0"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                placeholder="4.9"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200">Description</label>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              placeholder="Short description for parents"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                type="text"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                placeholder="makeup, fairy, costume"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-200">Preview headline</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                placeholder="Watch the sneak peek"
                value={previewHeadline}
                onChange={(e) => setPreviewHeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200">Highlights (one per line)</label>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              placeholder="Add one bullet per line"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              rows={3}
            />
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
                      type="text"
                      value={section.title}
                      onChange={(e) =>
                        updateSectionTitle(section.id, e.target.value)
                      }
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                      placeholder="Section title (e.g., Getting Started)"
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
                              type="text"
                              value={lesson.title}
                              onChange={(e) =>
                                updateLesson(section.id, lesson.id, {
                                  title: e.target.value,
                                })
                              }
                              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                              placeholder="Lesson title"
                            />
                            <input
                              type="text"
                              value={lesson.duration}
                              onChange={(e) =>
                                updateLesson(section.id, lesson.id, {
                                  duration: e.target.value,
                                })
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
                              Lesson video
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-200">Thumbnail</p>
              <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="text-slate-200"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Upload a bright 16:9 cover image.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-200 flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-300" />
                Preview video
              </p>
              <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-4">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                  className="text-slate-200"
                />
                <p className="text-xs text-slate-400 mt-1">
                  MP4 recommended. This clip is shown in the preview modal.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-amber-400 text-slate-900 font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Publish Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
