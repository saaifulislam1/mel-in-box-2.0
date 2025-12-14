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
  where,
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
  amountPaid?: number;
  partyDate: string;
  partyTime: string;
  kidsExpected: number;
  location: string;
  mapLink?: string;
  notes?: string;
  email?: string; // owner email (logged-in user)
  contactEmail?: string; // contact email from form
  phone?: string;
  status?:
    | "pending_payment"
    | "paid"
    | "accepted"
    | "rejected"
    | "completed"
    | "canceled";
  read?: boolean;
  stripeSessionId?: string;
  paymentIntentId?: string;
  refundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  refundedAt?: string;
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

export async function getPartyBooking(id: string) {
  if (!id) return null;
  const snap = await getDoc(doc(db, "partyBookings", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createPartyBooking(data: PartyBooking) {
  const normalizedEmail =
    typeof data.email === "string" ? data.email.toLowerCase() : data.email;
  const normalizedContact =
    typeof data.contactEmail === "string"
      ? data.contactEmail.toLowerCase()
      : data.contactEmail;
  return await addDoc(bookingsCol, {
    ...data,
    email: normalizedEmail,
    contactEmail: normalizedContact,
    status: data.status ?? "pending_payment",
    read: data.read ?? false,
    amountPaid: data.amountPaid ?? 0,
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

export async function getPartyBookingsForEmail(email: string) {
  if (!email) return [];
  const normalized = email.toLowerCase();
  try {
    const q = query(
      bookingsCol,
      where("email", "==", normalized),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    // If a composite index is missing, fall back to an un-ordered query and sort client-side.
    console.warn("Falling back to basic booking query", err);
    const q = query(bookingsCol, where("email", "==", normalized));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any, b: any) => {
          const ad = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bd = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bd - ad;
        }
      );
  }
}
