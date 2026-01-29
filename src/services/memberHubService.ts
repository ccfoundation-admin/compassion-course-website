import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export interface MemberHubDoc {
  videosUrl?: string;
  meetUrl?: string;
  docs?: { label: string; url: string }[];
  driveUrl?: string;
  driveUrls?: string[];
  updatedAt?: unknown;
}

const CONFIG_DOC_ID = 'memberHub';

export async function getMemberHubConfig(): Promise<MemberHubDoc | null> {
  try {
    const ref = doc(db, 'config', CONFIG_DOC_ID);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      videosUrl: data.videosUrl ?? undefined,
      meetUrl: data.meetUrl ?? undefined,
      docs: Array.isArray(data.docs) ? data.docs : undefined,
      driveUrl: data.driveUrl ?? undefined,
      driveUrls: Array.isArray(data.driveUrls) ? data.driveUrls : undefined,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('Error getting member hub config:', error);
    throw error;
  }
}
