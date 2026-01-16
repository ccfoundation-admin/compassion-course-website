import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Membership } from '../types/platform';

const COLLECTION_NAME = 'memberships';

export async function createMembership(
  userId: string,
  communityId: string,
  role: 'Owner' | 'Admin' | 'Moderator' | 'Member' = 'Member'
): Promise<Membership> {
  try {
    const membershipRef = doc(collection(db, COLLECTION_NAME));
    const membership: Membership = {
      id: membershipRef.id,
      userId,
      communityId,
      role,
      status: 'active',
      joinedAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(membershipRef, {
      ...membership,
      joinedAt: membership.joinedAt,
      updatedAt: membership.updatedAt,
    });

    return membership;
  } catch (error) {
    console.error('Error creating membership:', error);
    throw error;
  }
}

export async function getMembership(
  userId: string,
  communityId: string
): Promise<Membership | null> {
  try {
    const membershipsRef = collection(db, COLLECTION_NAME);
    const q = query(
      membershipsRef,
      where('userId', '==', userId),
      where('communityId', '==', communityId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        joinedAt: data.joinedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Membership;
    }
    return null;
  } catch (error) {
    console.error('Error getting membership:', error);
    throw error;
  }
}

export async function updateMembership(
  membershipId: string,
  updates: Partial<Pick<Membership, 'role' | 'status'>>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, membershipId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating membership:', error);
    throw error;
  }
}

export async function deleteMembership(membershipId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, membershipId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting membership:', error);
    throw error;
  }
}

export async function getCommunityMembers(communityId: string): Promise<Membership[]> {
  try {
    const membershipsRef = collection(db, COLLECTION_NAME);
    const q = query(membershipsRef, where('communityId', '==', communityId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Membership[];
  } catch (error) {
    console.error('Error getting community members:', error);
    throw error;
  }
}

export async function getUserMemberships(userId: string): Promise<Membership[]> {
  try {
    const membershipsRef = collection(db, COLLECTION_NAME);
    const q = query(membershipsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Membership[];
  } catch (error) {
    console.error('Error getting user memberships:', error);
    throw error;
  }
}
