import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { LeadershipMessage } from '../types/leadership';

const COLLECTION = 'leadershipMessages';

function toMessage(docSnap: { id: string; data: () => Record<string, unknown> }): LeadershipMessage {
  const d = docSnap.data() ?? {};
  return {
    id: docSnap.id,
    senderId: d.senderId ?? '',
    text: d.text ?? '',
    readBy: Array.isArray(d.readBy) ? d.readBy : [],
    createdAt: d.createdAt?.toDate?.() ?? new Date(),
    updatedAt: d.updatedAt?.toDate?.() ?? new Date(),
  };
}

export async function listRecentMessages(count: number = 10): Promise<LeadershipMessage[]> {
  const ref = collection(db, COLLECTION);
  const q = query(ref, orderBy('createdAt', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toMessage({ id: d.id, data: () => d.data() })).reverse();
}

export async function getMessage(id: string): Promise<LeadershipMessage | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  return snap.exists() ? toMessage({ id: snap.id, data: () => snap.data() ?? {} }) : null;
}

export async function createMessage(senderId: string, text: string): Promise<LeadershipMessage> {
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    senderId,
    text,
    readBy: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const snap = await getDoc(docRef);
  return toMessage({ id: snap.id, data: () => snap.data() ?? {} });
}

export async function markMessageRead(messageId: string, userId: string): Promise<void> {
  const ref = doc(db, COLLECTION, messageId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const readBy = (snap.data()?.readBy ?? []) as string[];
  if (readBy.includes(userId)) return;
  await updateDoc(ref, {
    readBy: [...readBy, userId],
    updatedAt: serverTimestamp(),
  });
}
