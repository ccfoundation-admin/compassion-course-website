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
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Post } from '../types/platform';

const COLLECTION_NAME = 'posts';

export async function createPost(
  spaceId: string,
  authorId: string,
  content: string,
  attachments?: string[]
): Promise<Post> {
  try {
    const postRef = doc(collection(db, COLLECTION_NAME));
    const post: Post = {
      id: postRef.id,
      spaceId,
      authorId,
      content,
      attachments,
      reactions: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(postRef, {
      ...post,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });

    return post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function getPost(postId: string): Promise<Post | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, postId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        reactions: data.reactions || {},
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Post;
    }
    return null;
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
}

export async function updatePost(
  postId: string,
  updates: Partial<Pick<Post, 'content' | 'attachments'>>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, postId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, postId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

export async function getPostsBySpace(
  spaceId: string,
  pageSize: number = 20,
  lastPostId?: string
): Promise<Post[]> {
  try {
    const postsRef = collection(db, COLLECTION_NAME);
    let q = query(
      postsRef,
      where('spaceId', '==', spaceId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      reactions: doc.data().reactions || {},
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Post[];
  } catch (error) {
    console.error('Error getting posts by space:', error);
    throw error;
  }
}

export async function addReaction(
  postId: string,
  userId: string,
  reactionType: string
): Promise<void> {
  try {
    const post = await getPost(postId);
    if (!post) throw new Error('Post not found');

    const reactions = { ...post.reactions };
    if (!reactions[reactionType]) {
      reactions[reactionType] = [];
    }
    
    if (!reactions[reactionType].includes(userId)) {
      reactions[reactionType].push(userId);
    }

    const docRef = doc(db, COLLECTION_NAME, postId);
    await updateDoc(docRef, {
      reactions,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
}

export async function removeReaction(
  postId: string,
  userId: string,
  reactionType: string
): Promise<void> {
  try {
    const post = await getPost(postId);
    if (!post) throw new Error('Post not found');

    const reactions = { ...post.reactions };
    if (reactions[reactionType]) {
      reactions[reactionType] = reactions[reactionType].filter(id => id !== userId);
      if (reactions[reactionType].length === 0) {
        delete reactions[reactionType];
      }
    }

    const docRef = doc(db, COLLECTION_NAME, postId);
    await updateDoc(docRef, {
      reactions,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
}
