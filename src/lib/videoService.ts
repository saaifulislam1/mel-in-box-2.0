// src/lib/videoService.ts

import { db, storage } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export type VideoData = {
  title: string;
  description: string;
  duration: string;
  tags: string[];
  thumbnailURL: string;
  videoURL: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
};

const videosCol = collection(db, "videos");

export async function uploadFile(path: string, file: File) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function createVideo(data: VideoData) {
  return await addDoc(videosCol, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getAllVideos() {
  const snapshot = await getDocs(videosCol);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteVideo(id: string) {
  await deleteDoc(doc(db, "videos", id));
}
export async function incrementViewCount(id: string) {
  const ref = doc(db, "videos", id);
  await updateDoc(ref, {
    views: increment(1),
  });
}
