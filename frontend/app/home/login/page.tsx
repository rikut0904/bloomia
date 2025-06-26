import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="app-main">
      <h1>ログイン</h1>
      <form className="login-form">
        <input type="email" placeholder="メールアドレス" required />
        <input type="password" placeholder="パスワード" required />
      <Link href="/home/" className="app-link">ログイン</Link>
      </form>
      <Link href="/" className="app-link">ホームに戻る</Link>
    </main>
  );
}
