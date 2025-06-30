import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, deleteField } from 'firebase/firestore';
import { auth } from './firebase';
import { User } from '../types';

// Initialize Firestore
export const db = getFirestore();

// Collections
export const USERS_COLLECTION = 'users';
export const POSTS_COLLECTION = 'posts';

// User operations
export const createUserDocument = async (user: User): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userRef, {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

export const getUserDocument = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        partnerId: data.partnerId,
        partnerName: data.partnerName,
        partnerEmail: data.partnerEmail,
        inviteCode: data.inviteCode
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    throw error;
  }
};

export const updateUserDocument = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    // nullの値をdeleteFieldに変換
    const processedUpdates: any = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        processedUpdates[key] = deleteField();
      } else {
        processedUpdates[key] = value;
      }
    });
    
    await updateDoc(userRef, {
      ...processedUpdates,
      updatedAt: new Date()
    });
    
    console.log('User document updated successfully:', { userId, updates: processedUpdates });
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

export const findUserByInviteCode = async (inviteCode: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        partnerId: data.partnerId,
        partnerName: data.partnerName,
        partnerEmail: data.partnerEmail,
        inviteCode: data.inviteCode
      };
    }
    return null;
  } catch (error) {
    console.error('Error finding user by invite code:', error);
    throw error;
  }
};

export const generateUniqueInviteCode = async (): Promise<string> => {
  const generateCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();
  
  let code = generateCode();
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const existingUser = await findUserByInviteCode(code);
    if (!existingUser) {
      return code;
    }
    code = generateCode();
    attempts++;
  }
  
  throw new Error('Failed to generate unique invite code');
};