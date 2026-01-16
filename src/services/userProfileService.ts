import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { UserProfile } from '../types/platform';

const COLLECTION_NAME = 'userProfiles';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function createUserProfile(
  userId: string,
  email: string,
  name: string,
  avatar?: string,
  bio?: string
): Promise<UserProfile> {
  try {
    const profile: Omit<UserProfile, 'id'> = {
      name,
      email,
      avatar,
      bio,
      organizations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = doc(db, COLLECTION_NAME, userId);
    await setDoc(docRef, {
      ...profile,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });

    return {
      id: userId,
      ...profile,
    };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'name' | 'avatar' | 'bio'>>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function addOrganizationToProfile(
  userId: string,
  organizationId: string
): Promise<void> {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    if (!profile.organizations.includes(organizationId)) {
      const docRef = doc(db, COLLECTION_NAME, userId);
      await updateDoc(docRef, {
        organizations: [...profile.organizations, organizationId],
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error adding organization to profile:', error);
    throw error;
  }
}

export async function getUserProfilesByOrganization(
  organizationId: string
): Promise<UserProfile[]> {
  try {
    const profilesRef = collection(db, COLLECTION_NAME);
    const q = query(profilesRef, where('organizations', 'array-contains', organizationId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as UserProfile[];
  } catch (error) {
    console.error('Error getting user profiles by organization:', error);
    throw error;
  }
}
