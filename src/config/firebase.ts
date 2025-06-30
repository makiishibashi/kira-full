import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
// ★ 1. Storage関連の関数をインポート
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';


const firebaseConfig = {
  apiKey: "AIzaSyCxFsE_hMa-okJdmAtQsYq-_RemEEJz9y0",
  authDomain: "kirafull-d9233.firebaseapp.com",
  projectId: "kirafull-d9233",
  storageBucket: "kirafull-d9233.appspot.com", // ★ 補足: 一般的には .appspot.com ですが、元の設定でも動作します
  messagingSenderId: "1075360661332",
  appId: "1:1075360661332:web:da8dd55c2ef632971f92c1",
  measurementId: "G-TMX5EM0B5W"
};

const app = initializeApp(firebaseConfig);

// 各サービスのインスタンスを取得
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const functionsInstance = getFunctions(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
// ★ 2. Storageのインスタンスを取得
const storage = getStorage(app);


provider.setCustomParameters({
  prompt: 'select_account'
});


// Vite環境で開発モードの場合のみエミュレーターに接続
if (import.meta.env.DEV) {
  console.log('Vite開発モード: Firebase Emulatorsに接続します。');

  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
  connectFirestoreEmulator(db, 'localhost', 8080);
  
  // ★ 3. Storageエミュレーターに接続する行を追加
  //    (デフォルトポートは9199です)
  connectStorageEmulator(storage, 'localhost', 9199);
}

// ★ 4. storageインスタンスもエクスポートする
export { auth, provider, functionsInstance, db, analytics, storage };
