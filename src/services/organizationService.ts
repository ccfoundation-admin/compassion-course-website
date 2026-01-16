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
import { Organization } from '../types/platform';
import { addOrganizationToProfile } from './userProfileService';

const COLLECTION_NAME = 'organizations';

export async function createOrganization(
  name: string,
  ownerId: string,
  description?: string
): Promise<Organization> {
  try {
    const orgRef = doc(collection(db, COLLECTION_NAME));
    const org: Organization = {
      id: orgRef.id,
      name,
      ownerId,
      description,
      settings: {
        allowPublicCommunities: true,
        defaultMemberRole: 'Member',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(orgRef, {
      ...org,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    });

    // Add organization to owner's profile
    await addOrganizationToProfile(ownerId, org.id);

    return org;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, orgId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Organization;
    }
    return null;
  } catch (error) {
    console.error('Error getting organization:', error);
    throw error;
  }
}

export async function updateOrganization(
  orgId: string,
  updates: Partial<Pick<Organization, 'name' | 'description' | 'settings'>>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, orgId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
}

export async function deleteOrganization(orgId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, orgId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  try {
    const orgsRef = collection(db, COLLECTION_NAME);
    const q = query(orgsRef, where('ownerId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Organization[];
  } catch (error) {
    console.error('Error getting user organizations:', error);
    throw error;
  }
}

export async function getOrganizationsByMember(userId: string): Promise<Organization[]> {
  try {
    // This would require a different query structure if we track members separately
    // For now, we'll get organizations where user is owner or member
    // In a full implementation, you'd query a memberships collection
    const ownedOrgs = await getUserOrganizations(userId);
    // TODO: Add query for organizations where user is a member (not owner)
    return ownedOrgs;
  } catch (error) {
    console.error('Error getting organizations by member:', error);
    throw error;
  }
}
