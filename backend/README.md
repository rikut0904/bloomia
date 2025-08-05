# Bloomia Backend - Auth0認証システム

このプロジェクトは、Auth0を使用した認証システムを実装したGoアプリケーションです。

## 機能

- Auth0によるOAuth2.0認証
- セッション管理
- ユーザープロフィール表示
- セキュアなAPIエンドポイント
- 美しいUI/UX

## セットアップ

### 1. 環境変数の設定

`.env`ファイルを作成し、以下の設定を行ってください：

```bash
# Auth0 Configuration
AUTH0_DOMAIN=bloomia.jp.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here
AUTH0_CALLBACK_URL=http://localhost:8080/callback
AUTH0_LOGOUT_URL=http://localhost:8080

# Server Configuration
PORT=8080
SESSION_SECRET=your_session_secret_here
```

### 2. Auth0の設定

1. [Auth0 Dashboard](https://manage.auth0.com/)にアクセス
2. 新しいアプリケーションを作成
3. 以下の設定を行う：
   - **Application Type**: Regular Web Application
   - **Allowed Callback URLs**: `http://localhost:8080/callback`
   - **Allowed Logout URLs**: `http://localhost:8080`
   - **Allowed Web Origins**: `http://localhost:8080`

### 3. 依存関係のインストール

```bash
go mod tidy
```

### 4. アプリケーションの実行

```bash
go run main.go
```

アプリケーションは `http://localhost:8080` で起動します。

## エンドポイント

- `GET /` - ホームページ
- `GET /login` - Auth0ログインページにリダイレクト
- `GET /callback` - Auth0コールバック処理
- `GET /user` - ユーザープロフィールページ（認証が必要）
- `GET /logout` - ログアウト
- `GET /api/profile` - ユーザープロフィールAPI（認証が必要）

## プロジェクト構造

```
backend/
├── main.go                 # メインアプリケーション
├── platform/
│   ├── authenticator/      # Auth0認証機能
│   ├── middleware/         # 認証ミドルウェア
│   └── router/            # ルーティング設定
├── web/
│   ├── static/            # 静的ファイル
│   └── template/          # HTMLテンプレート
└── .env                   # 環境変数
```

## 技術スタック

- **Go**: バックエンド言語
- **Gin**: Webフレームワーク
- **Auth0**: 認証サービス
- **OAuth2.0**: 認証プロトコル
- **HTML/CSS**: フロントエンド

## トラブルシューティング

### よくある問題

1. **環境変数が読み込まれない**
   - `.env`ファイルが正しい場所にあることを確認
   - 環境変数の値が正しいことを確認

2. **Auth0コールバックエラー**
   - Auth0ダッシュボードでコールバックURLが正しく設定されていることを確認
   - ドメインとクライアントIDが正しいことを確認

3. **セッションエラー**
   - `SESSION_SECRET`が設定されていることを確認
   - ブラウザのクッキーが有効になっていることを確認

## ライセンス

MIT License 