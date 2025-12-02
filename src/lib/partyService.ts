// src/lib/partyService.ts

import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export type PartyPackage = {
  name: string;
  price: number;
  duration: string;
  kidsCount: number;
  includes: string[];
  icon?: string;
  badge?: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
};

export type PartyBooking = {
  packageId: string;
  packageName: string;
  packagePrice: number;
  partyDate: string;
  partyTime: string;
  kidsExpected: number;
  location: string;
  mapLink?: string;
  notes?: string;
  email?: string;
  phone?: string;
  status?: "pending_payment" | "paid" | "canceled";
  stripeSessionId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
};

const packagesCol = collection(db, "partyPackages");
const bookingsCol = collection(db, "partyBookings");

const packageDoc = (id: string) => doc(db, "partyPackages", id);

export async function createPartyPackage(data: PartyPackage) {
  const cleaned: Record<string, unknown> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) cleaned[key] = value;
  });
  return await addDoc(packagesCol, { ...cleaned, createdAt: serverTimestamp() });
}

export async function updatePartyPackage(
  id: string,
  data: Partial<PartyPackage>
) {
  const cleaned: Record<string, unknown> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) cleaned[key] = value;
  });
  await updateDoc(packageDoc(id), cleaned);
}

export async function deletePartyPackage(id: string) {
  await deleteDoc(packageDoc(id));
}

export async function getAllPartyPackages() {
  const q = query(packagesCol, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPartyPackage(id: string) {
  const snap = await getDoc(packageDoc(id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createPartyBooking(data: PartyBooking) {
  return await addDoc(bookingsCol, {
    ...data,
    status: data.status ?? "pending_payment",
    createdAt: serverTimestamp(),
  });
}

export async function getAllPartyBookings() {
  const q = query(bookingsCol, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updatePartyBooking(
  id: string,
  data: Partial<PartyBooking>
) {
  await updateDoc(doc(db, "partyBookings", id), data);
}
