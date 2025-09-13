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
import { API_CONFIG, buildApiUrl } from './config';

// 認証状態の型定義
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  schoolId?: string;
  role?: 'user' | 'admin';
}

// 3要素認証用のログイン（一般ユーザー）
export const signInWithSchoolId = async (email: string, password: string, schoolId: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  
  // 入力値の検証
  if (!email || !password || !schoolId) {
    throw new Error('Email, password, and school ID are required.');
  }
  
  if (!email.includes('@')) {
    throw new Error('Invalid email format.');
  }
  
  try {
    // まずFirebase認証でメール・パスワードを確認
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
    // APIで学校IDを確認
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: userCredential.user.uid,
          schoolId,
          adminOnly: false,
        }),
      });

      if (!response.ok) {
        await signOut(auth);
        let errorMessage = 'ユーザー認証に失敗しました';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // JSONパースエラーの場合はHTMLレスポンスの可能性
          const text = await response.text();
          if (text.includes('<!DOCTYPE')) {
            errorMessage = 'API接続エラー: サーバーに接続できません';
          } else {
            errorMessage = `API エラー (${response.status}): ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      await signOut(auth);
      throw error;
    }
    
    return userCredential;
  } catch (firebaseError: any) {
    // Firebase認証エラーの詳細な処理
    if (firebaseError.code) {
      switch (firebaseError.code) {
        case 'auth/invalid-credential':
          throw new Error('メールアドレスまたはパスワードが正しくありません。');
        case 'auth/user-not-found':
          throw new Error('このメールアドレスは登録されていません。');
        case 'auth/wrong-password':
          throw new Error('パスワードが間違っています。');
        case 'auth/too-many-requests':
          throw new Error('ログイン試行回数が上限に達しました。しばらく時間を置いてから再試行してください。');
        case 'auth/user-disabled':
          throw new Error('このアカウントは無効になっています。');
        case 'auth/invalid-email':
          throw new Error('メールアドレスの形式が正しくありません。');
        default:
          throw new Error(`認証エラー: ${firebaseError.message || '不明なエラーが発生しました'}`);
      }
    }
    throw firebaseError;
  }
};

// Admin用のログイン（メール・パスワードのみ）
export const signInAdmin = async (email: string, password: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  
  // 入力値の検証
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }
  
  if (!email.includes('@')) {
    throw new Error('Invalid email format.');
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
    // APIでAdmin権限を確認
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: userCredential.user.uid,
          adminOnly: true,
        }),
      });

      if (!response.ok) {
        await signOut(auth);
        let errorMessage = '管理者認証に失敗しました';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // JSONパースエラーの場合はHTMLレスポンスの可能性
          const text = await response.text();
          if (text.includes('<!DOCTYPE')) {
            errorMessage = 'API接続エラー: サーバーに接続できません';
          } else {
            errorMessage = `API エラー (${response.status}): ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }
      
      // 管理者権限を確認できた場合、localStorageに保存
      localStorage.setItem(`user_role_${userCredential.user.uid}`, 'admin');
    } catch (error) {
      await signOut(auth);
      throw error;
    }
    
    return userCredential;
  } catch (firebaseError: any) {
    // Firebase認証エラーの詳細な処理
    if (firebaseError.code) {
      switch (firebaseError.code) {
        case 'auth/invalid-credential':
          throw new Error('メールアドレスまたはパスワードが正しくありません。');
        case 'auth/user-not-found':
          throw new Error('このメールアドレスは登録されていません。');
        case 'auth/wrong-password':
          throw new Error('パスワードが間違っています。');
        case 'auth/too-many-requests':
          throw new Error('ログイン試行回数が上限に達しました。しばらく時間を置いてから再試行してください。');
        case 'auth/user-disabled':
          throw new Error('このアカウントは無効になっています。');
        case 'auth/invalid-email':
          throw new Error('メールアドレスの形式が正しくありません。');
        default:
          throw new Error(`認証エラー: ${firebaseError.message || '不明なエラーが発生しました'}`);
      }
    }
    throw firebaseError;
  }
};

// 従来のログイン関数（後方互換性のため残す）
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (firebaseError: any) {
    // Firebase認証エラーの詳細な処理
    if (firebaseError.code) {
      switch (firebaseError.code) {
        case 'auth/invalid-credential':
          throw new Error('メールアドレスまたはパスワードが正しくありません。');
        case 'auth/user-not-found':
          throw new Error('このメールアドレスは登録されていません。');
        case 'auth/wrong-password':
          throw new Error('パスワードが間違っています。');
        case 'auth/too-many-requests':
          throw new Error('ログイン試行回数が上限に達しました。しばらく時間を置いてから再試行してください。');
        case 'auth/user-disabled':
          throw new Error('このアカウントは無効になっています。');
        case 'auth/invalid-email':
          throw new Error('メールアドレスの形式が正しくありません。');
        default:
          throw new Error(`認証エラー: ${firebaseError.message || '不明なエラーが発生しました'}`);
      }
    }
    throw firebaseError;
  }
};

// 一般ユーザー新規登録（学校IDを含む）
export const signUp = async (email: string, password: string, schoolId: string, displayName?: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  if (userCredential.user) {
    // プロフィール更新
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // APIでユーザー情報を保存
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USERS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          displayName: displayName || '',
          schoolId,
          role: 'user',
          firebaseUid: userCredential.user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('ユーザー情報の保存に失敗しました');
      }
    } catch (dbError) {
      // APIへの保存に失敗した場合、Firebaseユーザーを削除
      await userCredential.user.delete();
      throw new Error('ユーザー情報の保存に失敗しました');
    }
  }
  
  return userCredential;
};

// Admin新規登録
export const signUpAdmin = async (email: string, password: string, displayName?: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  if (userCredential.user) {
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // APIでAdmin情報を保存
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN.USERS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          displayName: displayName || '',
          role: 'admin',
          firebaseUid: userCredential.user.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('管理者情報の保存に失敗しました');
      }
    } catch (dbError) {
      // APIへの保存に失敗した場合、Firebaseユーザーを削除
      await userCredential.user.delete();
      throw new Error('管理者情報の保存に失敗しました');
    }
  }
  
  return userCredential;
};

// ログアウト
export const logout = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  
  // ログアウト前に現在のユーザーの権限情報を保持
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      // APIから最新のユーザー情報を取得して権限を確認
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${currentUser.uid}`));
      if (response.ok) {
        const { user: userData } = await response.json();
        if (userData?.role === 'admin') {
          // 管理者権限をlocalStorageに保存
          localStorage.setItem(`user_role_${currentUser.uid}`, 'admin');
        }
      }
    } catch (error) {
      // APIエラーは無視してログアウトを継続
      console.warn('Failed to save user role before logout:', error);
    }
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
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      try {
        // APIからユーザー情報を取得
        const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN.USERS}/${user.uid}`));
        
        if (response.ok) {
          const { user: userData } = await response.json();
          // admin権限を明示的に保持
          const authUser: AuthUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || userData?.display_name,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            schoolId: userData?.school_id,
            role: userData?.role === 'admin' ? 'admin' : userData?.role || 'user',
          };
          callback(authUser);
        } else {
          // APIからユーザー情報を取得できない場合は、localStorageから権限情報を復元を試行
          const savedRole = localStorage.getItem(`user_role_${user.uid}`);
          const authUser: AuthUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            role: savedRole === 'admin' ? 'admin' : 'user',
          };
          callback(authUser);
        }
      } catch (error) {
        // APIエラーの場合は、localStorageから権限情報を復元を試行
        const savedRole = localStorage.getItem(`user_role_${user.uid}`);
        const authUser: AuthUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          role: savedRole === 'admin' ? 'admin' : 'user',
        };
        callback(authUser);
      }
    } else {
      callback(null);
    }
  });
};

// 現在のユーザー取得
export const getCurrentUser = (): User | null => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
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