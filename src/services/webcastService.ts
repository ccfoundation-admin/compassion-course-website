import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Webcast, WebcastSession } from '../types/platform';

const WEBCASTS_COLLECTION = 'webcasts';
const WEBCAST_SESSIONS_COLLECTION = 'webcastSessions';

export async function createWebcast(
  orgId: string,
  title: string,
  description: string,
  scheduledAt: Date,
  hostId: string,
  price: number = 0,
  currency: string = 'USD',
  duration?: number,
  translationLanguages: string[] = [],
  accessType: 'free' | 'paid' | 'member-only' = 'free'
): Promise<Webcast> {
  try {
    const webcastRef = doc(collection(db, WEBCASTS_COLLECTION));
    const webcast: Webcast = {
      id: webcastRef.id,
      orgId,
      title,
      description,
      scheduledAt,
      duration,
      price,
      currency,
      status: 'scheduled',
      translationLanguages,
      hostId,
      accessType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(webcastRef, {
      ...webcast,
      scheduledAt: webcast.scheduledAt,
      createdAt: webcast.createdAt,
      updatedAt: webcast.updatedAt,
    });

    return webcast;
  } catch (error) {
    console.error('Error creating webcast:', error);
    throw error;
  }
}

export async function getWebcast(webcastId: string): Promise<Webcast | null> {
  try {
    const docRef = doc(db, WEBCASTS_COLLECTION, webcastId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        scheduledAt: data.scheduledAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Webcast;
    }
    return null;
  } catch (error) {
    console.error('Error getting webcast:', error);
    throw error;
  }
}

export async function updateWebcast(
  webcastId: string,
  updates: Partial<Pick<Webcast, 'title' | 'description' | 'scheduledAt' | 'status' | 'recordingUrl' | 'duration'>>
): Promise<void> {
  try {
    const docRef = doc(db, WEBCASTS_COLLECTION, webcastId);
    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };
    
    if (updates.scheduledAt) {
      updateData.scheduledAt = updates.scheduledAt;
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating webcast:', error);
    throw error;
  }
}

export async function getWebcastsByOrganization(orgId: string): Promise<Webcast[]> {
  try {
    const webcastsRef = collection(db, WEBCASTS_COLLECTION);
    const q = query(
      webcastsRef,
      where('orgId', '==', orgId),
      orderBy('scheduledAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledAt: doc.data().scheduledAt?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Webcast[];
  } catch (error) {
    console.error('Error getting webcasts by organization:', error);
    throw error;
  }
}

export async function getUpcomingWebcasts(orgId?: string): Promise<Webcast[]> {
  try {
    const webcastsRef = collection(db, WEBCASTS_COLLECTION);
    let q = query(
      webcastsRef,
      where('status', 'in', ['scheduled', 'live']),
      orderBy('scheduledAt', 'asc')
    );
    
    if (orgId) {
      q = query(
        webcastsRef,
        where('orgId', '==', orgId),
        where('status', 'in', ['scheduled', 'live']),
        orderBy('scheduledAt', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledAt: doc.data().scheduledAt?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Webcast[];
  } catch (error) {
    console.error('Error getting upcoming webcasts:', error);
    throw error;
  }
}

export async function createWebcastSession(
  webcastId: string,
  userId: string,
  language?: string
): Promise<WebcastSession> {
  try {
    const sessionRef = doc(collection(db, WEBCAST_SESSIONS_COLLECTION));
    const session: WebcastSession = {
      id: sessionRef.id,
      webcastId,
      userId,
      joinedAt: new Date(),
      language,
    };

    await setDoc(sessionRef, {
      ...session,
      joinedAt: session.joinedAt,
    });

    return session;
  } catch (error) {
    console.error('Error creating webcast session:', error);
    throw error;
  }
}

export async function updateWebcastSession(
  sessionId: string,
  leftAt: Date
): Promise<void> {
  try {
    const docRef = doc(db, WEBCAST_SESSIONS_COLLECTION, sessionId);
    await updateDoc(docRef, {
      leftAt,
    });
  } catch (error) {
    console.error('Error updating webcast session:', error);
    throw error;
  }
}

export async function getWebcastSessions(webcastId: string): Promise<WebcastSession[]> {
  try {
    const sessionsRef = collection(db, WEBCAST_SESSIONS_COLLECTION);
    const q = query(
      sessionsRef,
      where('webcastId', '==', webcastId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate() || new Date(),
      leftAt: doc.data().leftAt?.toDate(),
    })) as WebcastSession[];
  } catch (error) {
    console.error('Error getting webcast sessions:', error);
    throw error;
  }
}
