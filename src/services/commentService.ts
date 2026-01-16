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
import { Comment } from '../types/platform';

const COLLECTION_NAME = 'comments';

export async function createComment(
  postId: string,
  authorId: string,
  content: string,
  parentId?: string
): Promise<Comment> {
  try {
    const commentRef = doc(collection(db, COLLECTION_NAME));
    const comment: Comment = {
      id: commentRef.id,
      postId,
      authorId,
      content,
      parentId,
      reactions: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(commentRef, {
      ...comment,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    });

    return comment;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

export async function getComment(commentId: string): Promise<Comment | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, commentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        reactions: data.reactions || {},
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Comment;
    }
    return null;
  } catch (error) {
    console.error('Error getting comment:', error);
    throw error;
  }
}

export async function updateComment(
  commentId: string,
  content: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, commentId);
    await updateDoc(docRef, {
      content,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, commentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  try {
    const commentsRef = collection(db, COLLECTION_NAME);
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      reactions: doc.data().reactions || {},
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Comment[];
  } catch (error) {
    console.error('Error getting comments by post:', error);
    throw error;
  }
}

export async function addCommentReaction(
  commentId: string,
  userId: string,
  reactionType: string
): Promise<void> {
  try {
    const comment = await getComment(commentId);
    if (!comment) throw new Error('Comment not found');

    const reactions = { ...comment.reactions };
    if (!reactions[reactionType]) {
      reactions[reactionType] = [];
    }
    
    if (!reactions[reactionType].includes(userId)) {
      reactions[reactionType].push(userId);
    }

    const docRef = doc(db, COLLECTION_NAME, commentId);
    await updateDoc(docRef, {
      reactions,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error adding comment reaction:', error);
    throw error;
  }
}

export async function removeCommentReaction(
  commentId: string,
  userId: string,
  reactionType: string
): Promise<void> {
  try {
    const comment = await getComment(commentId);
    if (!comment) throw new Error('Comment not found');

    const reactions = { ...comment.reactions };
    if (reactions[reactionType]) {
      reactions[reactionType] = reactions[reactionType].filter(id => id !== userId);
      if (reactions[reactionType].length === 0) {
        delete reactions[reactionType];
      }
    }

    const docRef = doc(db, COLLECTION_NAME, commentId);
    await updateDoc(docRef, {
      reactions,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error removing comment reaction:', error);
    throw error;
  }
}
