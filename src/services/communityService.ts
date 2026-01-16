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
import { Community } from '../types/platform';

const COLLECTION_NAME = 'communities';

export async function createCommunity(
  orgId: string,
  name: string,
  description?: string,
  visibility: 'public' | 'private' | 'paid' = 'public'
): Promise<Community> {
  try {
    const communityRef = doc(collection(db, COLLECTION_NAME));
    const community: Community = {
      id: communityRef.id,
      orgId,
      name,
      description,
      visibility,
      settings: {
        allowMemberPosts: true,
        requireApproval: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(communityRef, {
      ...community,
      createdAt: community.createdAt,
      updatedAt: community.updatedAt,
    });

    return community;
  } catch (error) {
    console.error('Error creating community:', error);
    throw error;
  }
}

export async function getCommunity(communityId: string): Promise<Community | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, communityId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Community;
    }
    return null;
  } catch (error) {
    console.error('Error getting community:', error);
    throw error;
  }
}

export async function updateCommunity(
  communityId: string,
  updates: Partial<Pick<Community, 'name' | 'description' | 'visibility' | 'settings'>>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, communityId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating community:', error);
    throw error;
  }
}

export async function deleteCommunity(communityId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, communityId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting community:', error);
    throw error;
  }
}

export async function getCommunitiesByOrganization(orgId: string): Promise<Community[]> {
  try {
    const communitiesRef = collection(db, COLLECTION_NAME);
    const q = query(
      communitiesRef, 
      where('orgId', '==', orgId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Community[];
  } catch (error) {
    console.error('Error getting communities by organization:', error);
    throw error;
  }
}
