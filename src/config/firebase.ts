import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// .env.localファイルから環境変数を読み込む
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "kira-full.vercel.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// 各サービスのインスタンスを取得
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const functionsInstance = getFunctions(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

provider.setCustomParameters({
  prompt: 'select_account'
});

// Vite開発モードの場合のみエミュレーターに接続
if (import.meta.env.DEV) {
  console.log('Vite開発モード: Firebase Emulatorsに接続します。');

  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export { auth, provider, functionsInstance, db, analytics, storage };
// Vercelへの再デプロイをトリガーするためのコメント 2025/07/03
