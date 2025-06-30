import { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  Timestamp 
} from 'firebase/firestore';
import { db, POSTS_COLLECTION } from '../config/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Sparkle, SparkleFormData, Reaction } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getRandomAIMessage } from '../utils/aiMessages';

type PostsContextType = {
  posts: Sparkle[];
  isLoading: boolean;
  createPost: (data: SparkleFormData) => Promise<{ success: boolean; message?: string }>;
  addReaction: (postId: string, emoji: string) => Promise<boolean>;
  removeReaction: (postId: string, reactionId: string) => Promise<boolean>;
  latestAIMessage: string | null;
  clearAIMessage: () => void;
};

export const PostsContext = createContext<PostsContextType>({
  posts: [],
  isLoading: true,
  createPost: async () => ({ success: false }),
  addReaction: async () => false,
  removeReaction: async () => false,
  latestAIMessage: null,
  clearAIMessage: () => {},
});

export const PostsProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Sparkle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [latestAIMessage, setLatestAIMessage] = useState<string | null>(null);
  const { user } = useAuth();

  // Load posts when user changes
  useEffect(() => {
    if (!user) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Create query to get posts from user and their partner
    const userIds = [user.id];
    if (user.partnerId) {
      userIds.push(user.partnerId);
    }

    const postsRef = collection(db, POSTS_COLLECTION);
    const q = query(
      postsRef,
      where('userId', 'in', userIds),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData: Sparkle[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        postsData.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          createdAt: data.createdAt?.toMillis() || Date.now(),
          text: data.text,
          imageUrl: data.imageUrl,
          category: data.category,
          appreciation: data.appreciation,
          gratitude: data.gratitude,
          reactions: data.reactions || [],
        });
      });
      
      setPosts(postsData);
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading posts:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createPost = async (data: SparkleFormData) => {
    if (!user) return { success: false, message: 'You must be logged in to create a post' };
    
    try {
      const newPost = {
        userId: user.id,
        userName: user.name,
        createdAt: Timestamp.now(),
        text: data.text,
        imageUrl: data.imageUrl || null,
        category: data.category,
        appreciation: data.appreciation || null,
        gratitude: data.gratitude || null,
        reactions: [],
      };
      
      await addDoc(collection(db, POSTS_COLLECTION), newPost);
      
      // Generate AI message
      setLatestAIMessage(getRandomAIMessage());
      
      return { success: true };
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, message: 'Failed to create post' };
    }
  };

  const addReaction = async (postId: string, emoji: string) => {
    if (!user) return false;
    
    try {
      const reaction: Reaction = {
        id: uuidv4(),
        userId: user.id,
        emoji,
      };
      
      const postRef = doc(db, POSTS_COLLECTION, postId);
      await updateDoc(postRef, {
        reactions: arrayUnion(reaction)
      });
      
      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
  };

  const removeReaction = async (postId: string, reactionId: string) => {
    if (!user) return false;
    
    try {
      // Find the reaction to remove
      const post = posts.find(p => p.id === postId);
      if (!post) return false;
      
      const reactionToRemove = post.reactions.find(r => r.id === reactionId);
      if (!reactionToRemove) return false;
      
      const postRef = doc(db, POSTS_COLLECTION, postId);
      await updateDoc(postRef, {
        reactions: arrayRemove(reactionToRemove)
      });
      
      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      return false;
    }
  };

  const clearAIMessage = () => {
    setLatestAIMessage(null);
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        isLoading,
        createPost,
        addReaction,
        removeReaction,
        latestAIMessage,
        clearAIMessage,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};