// src/lib/courseService.ts

import { db, storage } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export type CourseData = {
  title: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  lessons: number;
  students: number;
  rating?: number;
  tags?: string[];
  highlights?: string[];
  previewHeadline?: string;
  thumbnailURL: string;
  previewURL: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
};

const coursesCol = collection(db, "courses");
const courseDoc = (id: string) => doc(db, "courses", id);

export async function uploadCourseFile(path: string, file: File) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function createCourse(data: CourseData) {
  return await addDoc(coursesCol, {
    ...data,
    students: data.students ?? 0,
    lessons: data.lessons ?? 0,
    rating: data.rating ?? 5,
    createdAt: serverTimestamp(),
  });
}

export async function getAllCourses() {
  const q = query(coursesCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteCourse(id: string) {
  await deleteDoc(courseDoc(id));
}

export async function updateCourse(id: string, data: Partial<CourseData>) {
  await updateDoc(courseDoc(id), data);
}
