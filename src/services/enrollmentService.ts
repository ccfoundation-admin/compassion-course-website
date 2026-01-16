import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Enrollment } from '../types/platform';

const COLLECTION_NAME = 'enrollments';

export async function createEnrollment(
  userId: string,
  courseId: string
): Promise<Enrollment> {
  try {
    // Check if enrollment already exists
    const existing = await getEnrollment(userId, courseId);
    if (existing) {
      return existing;
    }

    const enrollmentRef = doc(collection(db, COLLECTION_NAME));
    const enrollment: Enrollment = {
      id: enrollmentRef.id,
      userId,
      courseId,
      progress: {},
      enrolledAt: new Date(),
    };

    await setDoc(enrollmentRef, {
      ...enrollment,
      enrolledAt: enrollment.enrolledAt,
    });

    return enrollment;
  } catch (error) {
    console.error('Error creating enrollment:', error);
    throw error;
  }
}

export async function getEnrollment(
  userId: string,
  courseId: string
): Promise<Enrollment | null> {
  try {
    const enrollmentsRef = collection(db, COLLECTION_NAME);
    const q = query(
      enrollmentsRef,
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        progress: data.progress || {},
        enrolledAt: data.enrolledAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
      } as Enrollment;
    }
    return null;
  } catch (error) {
    console.error('Error getting enrollment:', error);
    throw error;
  }
}

export async function updateLessonProgress(
  userId: string,
  courseId: string,
  lessonId: string,
  completed: boolean
): Promise<void> {
  try {
    const enrollment = await getEnrollment(userId, courseId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const progress = { ...enrollment.progress };
    if (completed) {
      progress[lessonId] = true;
    } else {
      delete progress[lessonId];
    }

    const docRef = doc(db, COLLECTION_NAME, enrollment.id);
    await updateDoc(docRef, {
      progress,
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
}

export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  try {
    const enrollmentsRef = collection(db, COLLECTION_NAME);
    const q = query(enrollmentsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      progress: doc.data().progress || {},
      enrolledAt: doc.data().enrolledAt?.toDate() || new Date(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as Enrollment[];
  } catch (error) {
    console.error('Error getting user enrollments:', error);
    throw error;
  }
}

export async function getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
  try {
    const enrollmentsRef = collection(db, COLLECTION_NAME);
    const q = query(enrollmentsRef, where('courseId', '==', courseId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      progress: doc.data().progress || {},
      enrolledAt: doc.data().enrolledAt?.toDate() || new Date(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as Enrollment[];
  } catch (error) {
    console.error('Error getting course enrollments:', error);
    throw error;
  }
}
