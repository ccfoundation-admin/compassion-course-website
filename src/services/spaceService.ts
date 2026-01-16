import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Space } from '../types/platform';

const COLLECTION_NAME = 'spaces';

export async function createSpace(
  communityId: string,
  name: string,
  description?: string,
  accessRules: 'public' | 'private' | 'paid' = 'public'
): Promise<Space> {
  try {
    const spaceRef = doc(collection(db, COLLECTION_NAME));
    const space: Space = {
      id: spaceRef.id,
      communityId,
      name,
      description,
      accessRules,
      settings: {
        allowMemberPosts: true,
        requireApproval: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(spaceRef, {
      ...space,
      createdAt: space.createdAt,
      updatedAt: space.updatedAt,
    });

    return space;
  } catch (error) {
    console.error('Error creating space:', error);
    throw error;
  }
}

export async function getSpace(spaceId: string): Promise<Space | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, spaceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Space;
    }
    return null;
  } catch (error) {
    console.error('Error getting space:', error);
    throw error;
  }
}

export async function updateSpace(
  spaceId: string,
  updates: Partial<Pick<Space, 'name' | 'description' | 'accessRules' | 'settings'>>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, spaceId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating space:', error);
    throw error;
  }
}

export async function deleteSpace(spaceId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, spaceId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting space:', error);
    throw error;
  }
}

export async function getSpacesByCommunity(communityId: string): Promise<Space[]> {
  try {
    const spacesRef = collection(db, COLLECTION_NAME);
    const q = query(
      spacesRef, 
      where('communityId', '==', communityId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Space[];
  } catch (error) {
    console.error('Error getting spaces by community:', error);
    throw error;
  }
}
