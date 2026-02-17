import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import type { LeadershipTeam } from '../types/leadership';
import { createBoardForTeam } from './leadershipBoardsService';

const COLLECTION = 'teams';

function toTeam(docSnap: { id: string; data: () => Record<string, unknown> }): LeadershipTeam {
  const d = docSnap.data() ?? {};
  return {
    id: docSnap.id,
    name: (d.name as string) ?? '',
    memberIds: Array.isArray(d.memberIds) ? d.memberIds : [],
    createdAt: (d.createdAt as { toDate: () => Date })?.toDate?.() ?? new Date(),
    updatedAt: (d.updatedAt as { toDate: () => Date })?.toDate?.() ?? new Date(),
  };
}

export async function listTeams(): Promise<LeadershipTeam[]> {
  const ref = collection(db, COLLECTION);
  const snap = await getDocs(ref);
  return snap.docs.map((d) => toTeam({ id: d.id, data: () => d.data() }));
}

export async function listTeamsForUser(userId: string): Promise<LeadershipTeam[]> {
  const ref = collection(db, COLLECTION);
  const q = query(ref, where('memberIds', 'array-contains', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toTeam({ id: d.id, data: () => d.data() }));
}

export async function getTeam(id: string): Promise<LeadershipTeam | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  return snap.exists() ? toTeam({ id: snap.id, data: () => snap.data() ?? {} }) : null;
}

export async function createTeam(name: string, memberIds: string[] = []): Promise<LeadershipTeam> {
  const ref = doc(collection(db, COLLECTION));
  await setDoc(ref, {
    name,
    memberIds,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return toTeam({ id: snap.id, data: () => snap.data() ?? {} });
}

/** Creates a team and its board (1:1). Retries board creation once on failure. */
export async function createTeamWithBoard(
  name: string,
  memberIds: string[] = []
): Promise<LeadershipTeam> {
  const team = await createTeam(name, memberIds);
  try {
    await createBoardForTeam(team.id);
  } catch (err) {
    try {
      await createBoardForTeam(team.id);
    } catch (retryErr) {
      throw retryErr;
    }
  }
  return team;
}

export async function updateTeam(
  id: string,
  updates: Partial<Pick<LeadershipTeam, 'name' | 'memberIds'>>
): Promise<void> {
  const path = `/${COLLECTION}/${id}`;
  console.log('🧪 Attempting write to', path);
  console.log('🧪 Current UID:', auth.currentUser?.uid);
  const ref = doc(db, COLLECTION, id);
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.memberIds !== undefined) data.memberIds = updates.memberIds;
  try {
    await updateDoc(ref, data);
    console.log('✅ SUCCESS writing', path);
  } catch (error) {
    console.error('❌ FAILED writing', path, error);
    console.error('❌ Full error object:', error);
    console.error('❌ auth.currentUser?.uid:', auth.currentUser?.uid);
    throw error;
  }
}

export async function deleteTeam(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
