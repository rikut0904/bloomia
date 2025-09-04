import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

// 認証状態の型定義
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// ログイン
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  return await signInWithEmailAndPassword(auth, email, password);
};

// 新規登録
export const signUp = async (email: string, password: string, displayName?: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  
  return userCredential;
};

// ログアウト
export const logout = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  await signOut(auth);
};

// パスワードリセット
export const resetPassword = async (email: string): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  await sendPasswordResetEmail(auth, email);
};

// 認証状態の監視
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  if (!auth) {
    // Firebase Authが初期化されていない場合は、ユーザーなしでコールバックを呼び出し
    callback(null);
    return () => {}; // 空のunsubscribe関数を返す
  }
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
      callback(authUser);
    } else {
      callback(null);
    }
  });
};

// 現在のユーザー取得
export const getCurrentUser = (): User | null => {
  if (!auth) {
    return null;
  }
  return auth.currentUser;
};

// IDトークン取得
export const getIdToken = async (): Promise<string | null> => {
  const user = getCurrentUser();
  if (user) {
    return await user.getIdToken();
  }
  return null;
};