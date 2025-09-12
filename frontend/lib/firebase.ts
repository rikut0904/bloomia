import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:demo",
};

// Firebase Authentication初期化
let app: any = null;
let auth: any = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // 開発環境でAuth エミュレーターを使用（オプション）
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Auth エミュレーター（実際のFirebaseを使用する場合はコメントアウト）
    // if (!auth.emulatorConfig) {
    //   connectAuthEmulator(auth, 'http://localhost:9099');
    // }
  }
} catch (error) {
  console.warn('Firebase Authentication initialization failed:', error);
}

export { auth };
export default app;