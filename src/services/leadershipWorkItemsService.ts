import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import type { LeadershipWorkItem, WorkItemStatus } from '../types/leadership';

const COLLECTION = 'leadershipWorkItems';

function toWorkItem(docSnap: { id: string; data: () => Record<string, unknown> }): LeadershipWorkItem {
  const d = docSnap.data() ?? {};
  const status = (d.status as WorkItemStatus) ?? 'todo';
  return {
    id: docSnap.id,
    title: (d.title as string) ?? '',
    description: d.description as string | undefined,
    assigneeId: d.assigneeId as string | undefined,
    teamId: d.teamId as string | undefined,
    status: status === 'todo' || status === 'in_progress' || status === 'done' ? status : 'todo',
    dueDate: (d.dueDate as { toDate: () => Date })?.toDate?.() ?? undefined,
    createdAt: (d.createdAt as { toDate: () => Date })?.toDate?.() ?? new Date(),
    updatedAt: (d.updatedAt as { toDate: () => Date })?.toDate?.() ?? new Date(),
  };
}

export async function listWorkItems(teamId?: string): Promise<LeadershipWorkItem[]> {
  const ref = collection(db, COLLECTION);
  const q = teamId && teamId !== '' ? query(ref, where('teamId', '==', teamId)) : query(ref);
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => toWorkItem({ id: d.id, data: () => d.data() }));
  items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return items;
}

export async function listWorkItemsForUser(assigneeId: string): Promise<LeadershipWorkItem[]> {
  const ref = collection(db, COLLECTION);
  const q = query(ref, where('assigneeId', '==', assigneeId));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => toWorkItem({ id: d.id, data: () => d.data() }));
  items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return items;
}

export async function getWorkItem(id: string): Promise<LeadershipWorkItem | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  return snap.exists() ? toWorkItem({ id: snap.id, data: () => snap.data() ?? {} }) : null;
}

export async function createWorkItem(data: {
  title: string;
  description?: string;
  assigneeId?: string;
  teamId?: string;
  status?: WorkItemStatus;
  dueDate?: Date;
}): Promise<LeadershipWorkItem> {
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    title: data.title,
    description: data.description ?? null,
    assigneeId: data.assigneeId ?? null,
    teamId: data.teamId ?? null,
    status: data.status ?? 'todo',
    dueDate: data.dueDate ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const snap = await getDoc(docRef);
  return toWorkItem({ id: snap.id, data: () => snap.data() ?? {} });
}

export async function updateWorkItem(
  id: string,
  updates: Partial<Pick<LeadershipWorkItem, 'title' | 'description' | 'assigneeId' | 'teamId' | 'status' | 'dueDate'>>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (updates.title !== undefined) data.title = updates.title;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.assigneeId !== undefined) data.assigneeId = updates.assigneeId;
  if (updates.teamId !== undefined) data.teamId = updates.teamId;
  if (updates.status !== undefined) data.status = updates.status;
  if (updates.dueDate !== undefined) data.dueDate = updates.dueDate;
  await updateDoc(ref, data);
}

export async function deleteWorkItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
