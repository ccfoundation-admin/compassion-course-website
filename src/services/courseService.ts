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
import { Course, Module, Lesson } from '../types/platform';

const COURSES_COLLECTION = 'courses';
const MODULES_COLLECTION = 'modules';
const LESSONS_COLLECTION = 'lessons';

// Course operations
export async function createCourse(
  orgId: string,
  title: string,
  description: string,
  price: number = 0,
  currency: string = 'USD',
  communityId?: string,
  thumbnail?: string
): Promise<Course> {
  try {
    const courseRef = doc(collection(db, COURSES_COLLECTION));
    const course: Course = {
      id: courseRef.id,
      orgId,
      communityId,
      title,
      description,
      price,
      currency,
      status: 'draft',
      thumbnail,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(courseRef, {
      ...course,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    });

    return course;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
}

export async function getCourse(courseId: string): Promise<Course | null> {
  try {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Course;
    }
    return null;
  } catch (error) {
    console.error('Error getting course:', error);
    throw error;
  }
}

export async function updateCourse(
  courseId: string,
  updates: Partial<Pick<Course, 'title' | 'description' | 'price' | 'status' | 'thumbnail'>>
): Promise<void> {
  try {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    const docRef = doc(db, COURSES_COLLECTION, courseId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
}

export async function getCoursesByOrganization(orgId: string): Promise<Course[]> {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);
    const q = query(
      coursesRef,
      where('orgId', '==', orgId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Course[];
  } catch (error) {
    console.error('Error getting courses by organization:', error);
    throw error;
  }
}

export async function getPublishedCourses(orgId?: string): Promise<Course[]> {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);
    let q = query(
      coursesRef,
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );
    
    if (orgId) {
      q = query(
        coursesRef,
        where('orgId', '==', orgId),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Course[];
  } catch (error) {
    console.error('Error getting published courses:', error);
    throw error;
  }
}

// Module operations
export async function createModule(
  courseId: string,
  title: string,
  order: number,
  description?: string
): Promise<Module> {
  try {
    const moduleRef = doc(collection(db, MODULES_COLLECTION));
    const module: Module = {
      id: moduleRef.id,
      courseId,
      title,
      order,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(moduleRef, {
      ...module,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    });

    return module;
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
}

export async function getModulesByCourse(courseId: string): Promise<Module[]> {
  try {
    const modulesRef = collection(db, MODULES_COLLECTION);
    const q = query(
      modulesRef,
      where('courseId', '==', courseId),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Module[];
  } catch (error) {
    console.error('Error getting modules by course:', error);
    throw error;
  }
}

// Lesson operations
export async function createLesson(
  moduleId: string,
  title: string,
  type: 'video' | 'text' | 'download',
  contentRef: string,
  order: number,
  duration?: number
): Promise<Lesson> {
  try {
    const lessonRef = doc(collection(db, LESSONS_COLLECTION));
    const lesson: Lesson = {
      id: lessonRef.id,
      moduleId,
      title,
      type,
      contentRef,
      order,
      duration,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(lessonRef, {
      ...lesson,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    });

    return lesson;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
}

export async function getLessonsByModule(moduleId: string): Promise<Lesson[]> {
  try {
    const lessonsRef = collection(db, LESSONS_COLLECTION);
    const q = query(
      lessonsRef,
      where('moduleId', '==', moduleId),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Lesson[];
  } catch (error) {
    console.error('Error getting lessons by module:', error);
    throw error;
  }
}
