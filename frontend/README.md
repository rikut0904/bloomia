# Bloomia - 学びが花開く場所

Bloomiaは、未来の教育を目指す統合型学習管理システム（LMS）です。教材管理、課題提出、成績管理、コミュニケーション機能を統合し、学びをもっと楽しく、継続しやすくします。

## 🚀 機能

- **統合型LMS**: 教材、課題、成績管理を全てひとつで
- **コミュニケーション活性化**: 生徒・教師がつながるSNS機能
- **ゲーミフィケーション**: 学びをもっと楽しく、継続しやすく
- **ダークモード対応**: 目に優しいダークテーマ
- **レスポンシブデザイン**: あらゆるデバイスに対応
- **バックエンド認証**: Goバックエンドによるセキュアな認証

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15.4.5
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4
- **認証**: Goバックエンド（Auth0）
- **React**: 19.1.0

## 📦 セットアップ

### 前提条件

- Node.js 18.0.0以上
- npm または yarn
- Goバックエンドが起動していること

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/your-username/bloomia.git
cd bloomia/frontend
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp env.example .env.local
```

`.env.local`ファイルを編集して、バックエンドAPIの設定を追加：

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

4. バックエンドサーバーを起動
```bash
# 別のターミナルで
cd ../backend
go run main.go
```

5. フロントエンド開発サーバーを起動
```bash
npm run dev
```

6. ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 🏗️ プロジェクト構造

```
frontend/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理者ページ
│   ├── home/              # ユーザーホームページ
│   └── layout.tsx         # ルートレイアウト
├── components/            # 再利用可能なコンポーネント
├── lib/                  # ユーティリティ関数（認証サービス）
├── styles/               # グローバルスタイル
└── public/               # 静的ファイル
```

## 🔐 認証システム

認証はすべてGoバックエンドで処理されます：

- **ログイン**: `/login` → Auth0認証ページにリダイレクト
- **コールバック**: `/callback` → 認証後の処理
- **ユーザー情報**: `/api/profile` → ユーザープロフィール取得
- **ログアウト**: `/logout` → セッション終了

### 認証フロー

1. ユーザーがログインボタンをクリック
2. フロントエンドがバックエンドの`/login`にリダイレクト
3. バックエンドがAuth0認証ページにリダイレクト
4. ユーザーがAuth0で認証
5. Auth0がバックエンドの`/callback`にリダイレクト
6. バックエンドがセッションを作成
7. ユーザーがホームページにリダイレクト

## 🎨 デザインシステム

### カラーパレット
- **プライマリ**: #ff7f50 (Coral)
- **背景**: #fefcf8 (Light Cream)
- **テキスト**: #1e1e1e (Dark Gray)

### ダークモード
- **背景**: #1a1a1a (Dark Gray)
- **テキスト**: #f5f5f5 (Light Gray)
- **プライマリ**: #ffb085 (Light Coral)

## 🔧 開発

### 利用可能なスクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLintでコードをチェック

### コード規約

- TypeScriptを使用
- ESLintとPrettierでコードフォーマット
- コンポーネントは関数型コンポーネント
- カスタムフックでロジックを分離

## 📱 レスポンシブデザイン

- モバイルファーストアプローチ
- ブレークポイント: sm (640px), md (768px), lg (1024px), xl (1280px)
- タッチフレンドリーなUI

## 🚀 デプロイ

### Vercel（推奨）

1. Vercelにプロジェクトを接続
2. 環境変数を設定
3. 自動デプロイが有効

### その他のプラットフォーム

- Netlify
- AWS Amplify
- その他の静的ホスティングサービス

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 📞 サポート

質問や問題がある場合は、[Issues](../../issues) を作成してください。

---

**Bloomia** - 学びが花開く場所 🌸
