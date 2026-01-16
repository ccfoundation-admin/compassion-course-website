import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Chat, Message } from '../types/platform';

const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';

export async function createChat(
  type: 'dm' | 'group',
  participants: string[],
  name?: string
): Promise<Chat> {
  try {
    // For DMs, check if chat already exists
    if (type === 'dm' && participants.length === 2) {
      const existing = await findDMChat(participants[0], participants[1]);
      if (existing) {
        return existing;
      }
    }

    const chatRef = doc(collection(db, CHATS_COLLECTION));
    const chat: Chat = {
      id: chatRef.id,
      type,
      participants,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(chatRef, {
      ...chat,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    });

    return chat;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
}

export async function findDMChat(userId1: string, userId2: string): Promise<Chat | null> {
  try {
    const chatsRef = collection(db, CHATS_COLLECTION);
    const q = query(
      chatsRef,
      where('type', '==', 'dm'),
      where('participants', 'array-contains', userId1)
    );
    const querySnapshot = await getDocs(q);
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      if (data.participants.includes(userId2)) {
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Chat;
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding DM chat:', error);
    throw error;
  }
}

export async function getChat(chatId: string): Promise<Chat | null> {
  try {
    const docRef = doc(db, CHATS_COLLECTION, chatId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Chat;
    }
    return null;
  } catch (error) {
    console.error('Error getting chat:', error);
    throw error;
  }
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  try {
    const chatsRef = collection(db, CHATS_COLLECTION);
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Chat[];
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
}

export async function sendMessage(
  chatId: string,
  authorId: string,
  content: string
): Promise<Message> {
  try {
    const messageRef = doc(collection(db, MESSAGES_COLLECTION));
    const message: Message = {
      id: messageRef.id,
      chatId,
      authorId,
      content,
      readBy: [authorId],
      createdAt: new Date(),
    };

    await setDoc(messageRef, {
      ...message,
      createdAt: message.createdAt,
    });

    // Update chat's last message
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      lastMessage: {
        content,
        authorId,
        createdAt: Timestamp.now(),
      },
      updatedAt: Timestamp.now(),
    });

    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function getMessages(
  chatId: string,
  pageSize: number = 50
): Promise<Message[]> {
  try {
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      readBy: doc.data().readBy || [],
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Message[];
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

export function subscribeToMessages(
  chatId: string,
  callback: (messages: Message[]) => void
): () => void {
  const messagesRef = collection(db, MESSAGES_COLLECTION);
  const q = query(
    messagesRef,
    where('chatId', '==', chatId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      readBy: doc.data().readBy || [],
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Message[];
    callback(messages.reverse()); // Reverse to show oldest first
  });
}

export async function markMessageAsRead(
  messageId: string,
  userId: string
): Promise<void> {
  try {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    const message = await getDoc(messageRef);
    if (!message.exists()) return;

    const data = message.data();
    const readBy = data.readBy || [];
    
    if (!readBy.includes(userId)) {
      await updateDoc(messageRef, {
        readBy: [...readBy, userId],
      });
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}
