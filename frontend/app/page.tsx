import "../styles/webSite.css";
import Link from "next/link";

export default function MarketingPage() {
  return (
    <main className="website-main">
      <header className="website-header">
        <h1>Bloomia - 学びが花開く場所</h1>
        <p>未来の教育を Bloomia で。</p>
        <Link href="/home/login" className="cta-button">ログインはこちら</Link>
      </header>
      <section className="features">
        <div>
          <h2>統合型LMS</h2>
          <p>教材、課題、成績管理を全てひとつで。</p>
        </div>
        <div>
          <h2>コミュニケーション活性化</h2>
          <p>生徒・教師がつながるSNS機能。</p>
        </div>
        <div>
          <h2>ゲーミフィケーション</h2>
          <p>学びをもっと楽しく、継続しやすく。</p>
        </div>
      </section>
      <footer className="website-footer">
        <p>&copy; 2025 Bloomia Inc. All rights reserved.</p>
      </footer>
    </main>
  );
}