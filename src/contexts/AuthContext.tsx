import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  indexedDBLocalPersistence,
} from 'firebase/auth';
// Firebase Functionsのモジュールをインポートします
import { httpsCallable } from "firebase/functions";
import { app, auth, db, functionsInstance } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  createUserDocument,
  getUserDocument,
  generateUniqueInviteCode,
  updateUserDocument,
} from '../config/firestore';
import { User } from '../types';

// Firebase Functionsを初期化します
// 関数名は、`functions/src/index.ts`でエクスポートした名前と完全に一致させる必要があります

//const callConnectPartner = httpsCallable(functionsInstance, 'connectPartner');
//const callDisconnectPartner = httpsCallable(functionsInstance, 'disconnectPartner');


type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  generateInviteCode: () => Promise<string>;
  connectPartner: (inviteCode: string) => Promise<void>;
  disconnectPartner: () => Promise<void>;
  loginWithGoogle: () => Promise<boolean>;
  refreshUserData: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => { },
  generateInviteCode: async () => '',
  connectPartner: async () => { },
  disconnectPartner: async () => { },
  loginWithGoogle: async () => false,
  refreshUserData: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ログイン状態を監視し、ユーザーデータを取得します
  useEffect(() => {
    // onAuthStateChangedは、認証状態が変わるたびに呼び出される信頼できるソース
const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  console.log('Auth state changed:', firebaseUser?.uid);

  if (firebaseUser) {
    // ユーザーが確定した場合（ログイン済み、またはリダイレクト成功後）
    try {
      const userData = await getUserDocument(firebaseUser.uid);
      if (userData) {
        console.log('User data loaded:', userData);
        setUser(userData);
      } else {
        // Firestoreにドキュメントがない新規ユーザーの場合
        console.log('User document not found, creating new one...');
        const inviteCode = await generateUniqueInviteCode();
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email ?? `dummy-${firebaseUser.uid}@example.com`,
          name: firebaseUser.displayName || 'User',
          inviteCode,
        };
        await createUserDocument(newUser);
        console.log('New user created:', newUser);
        setUser(newUser);
      }
    } catch (error) {
      console.error('Error handling user data:', error);
      setUser(null);
    } finally {
      // ユーザー情報の処理が完了したので、ローディングを終了
      setIsLoading(false);
    }
  } else {
    // ユーザーがいない場合、リダイレクトからの復帰直後か、本当にログアウトしているのかを確認
    getRedirectResult(auth)
      .then((result) => {
        // resultがnullの場合、リダイレクト直後ではない。つまり本当にログアウトしている。
        if (!result) {
          console.log('User is truly logged out.');
          setUser(null);
          // この時点で初めて、ローディングを終了する
          setIsLoading(false);
        }
        // resultがある場合は、リダイレクトからの復帰。
        // この後、自動的にもう一度 onAuthStateChanged が firebaseUserありで呼ばれるので、
        // ここでは何もしない（isLoadingもtrueのまま）。
      })
      .catch((error) => {
        console.error("リダイレクト結果の取得エラー:", error);
        // エラーが発生した場合も、最終的な状態としてローディングを終了
        setUser(null);
        setIsLoading(false);
      });
  }
});

return () => unsubscribe();
  }, []);

  // リアルタイムリスナーを設置してユーザーデータの変更を監視します
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time listener for user:', user.id);
    const userDocRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const updatedUser = docSnapshot.data() as User;
        console.log('User data updated via listener:', updatedUser);
        setUser(updatedUser);
      }
    }, (error) => {
      console.error('Error in user data listener:', error);
    });

    return () => {
      console.log('Cleaning up user data listener');
      unsubscribe();
    };
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    console.log('Attempting login with signInWithPopup on all devices...');
    
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
  
    try {
      const result = await signInWithPopup(auth, provider);
      // ポップアップが成功すれば、onAuthStateChangedがユーザーを検知します
      console.log('Popup login successful for user:', result.user.displayName);
      return true;
    } catch (error) {
      // ポップアップがユーザーによって閉じられた場合や、何らかのエラーが起きた場合
      console.error('Popup login error:', error);
  
      // エラーコードで、ポップアップがブロックされたかなどを判定することも可能です
      // 例: if (error.code === 'auth/popup-blocked') { ... }
      
      return false;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('Attempting registration for:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const inviteCode = await generateUniqueInviteCode();
      const userData: User = {
        id: result.user.uid,
        email: result.user.email!,
        name: name,
        inviteCode,
      };
      await createUserDocument(userData);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout');
      await signOut(auth);
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const generateInviteCode = async () => {
    if (!user) throw new Error('ログインが必要です');
    try {
      console.log('Generating new invite code for user:', user.id);
      const newInviteCode = await generateUniqueInviteCode();
      await updateUserDocument(user.id, { inviteCode: newInviteCode });
      return newInviteCode;
    } catch (error) {
      console.error('Error generating invite code:', error);
      throw error;
    }
  };

  // Cloud Functionsを呼び出してパートナーと接続します
  const connectPartner = async (inviteCode: string): Promise<void> => {
    if (!user) throw new Error('ログインが必要です');
    try {
      const callConnectPartner = httpsCallable(functionsInstance, 'connectPartner');
      console.log(`Calling connectPartner Cloud Function with code: ${inviteCode}`);
      const result = await callConnectPartner({ inviteCode: inviteCode });
      console.log('Cloud Function `connectPartner` successful:', result);
      // 成功すればonSnapshotが自動でUIを更新します
    } catch (error: any) {
      console.error('Error calling connectPartner function:', error);
      throw new Error(error.message || '接続に失敗しました。');
    }
  };

  // Cloud Functionsを呼び出してパートナーとの接続を解除します
  const disconnectPartner = async (): Promise<void> => {
    if (!user || !user.partnerId) throw new Error('パートナー情報がありません');
    try {
      const callDisconnectPartner = httpsCallable(functionsInstance, 'disconnectPartner');
      console.log('Calling disconnectPartner Cloud Function...');
      const result = await callDisconnectPartner();
      console.log('Cloud Function `disconnectPartner` successful:', result);
      // 成功すればonSnapshotが自動でUIを更新します
    } catch (error: any) {
      console.error('Error calling disconnectPartner function:', error);
      throw new Error(error.message || '接続解除に失敗しました。');
    }
  };

  // ユーザーデータを手動で更新する関数（念のため残します）
  const refreshUserData = async () => {
    if (!user) return;
    try {
      console.log('Manually refreshing user data for:', user.id);
      const updatedUserData = await getUserDocument(user.id);
      if (updatedUserData) {
        console.log('Manual refresh successful:', updatedUserData);
        setUser(updatedUserData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        generateInviteCode,
        connectPartner,
        disconnectPartner,
        loginWithGoogle,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
