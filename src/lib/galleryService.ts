// src/lib/galleryService.ts

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
  increment,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export type PhotoData = {
  title: string;
  date: string;
  category: string;
  categoryColor: string;
  imageURL: string;
  description?: string;
  shareUrl?: string;
  likes?: number;
  downloads?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
};

const photosCol = collection(db, "galleryPhotos");
const photoDoc = (id: string) => doc(db, "galleryPhotos", id);

export async function uploadGalleryFile(path: string, file: File) {
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}

export async function createPhoto(data: PhotoData) {
  return await addDoc(photosCol, {
    ...data,
    likes: data.likes ?? 0,
    downloads: data.downloads ?? 0,
    createdAt: serverTimestamp(),
  });
}

export async function getAllPhotos() {
  const q = query(photosCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deletePhoto(id: string) {
  await deleteDoc(photoDoc(id));
}

export async function updatePhotoLikes(id: string, delta: number) {
  await updateDoc(photoDoc(id), {
    likes: increment(delta),
  });
}
