FROM node:20

WORKDIR /app

# 依存関係だけをまずインストール
COPY ./frontend/package*.json ./
RUN npm install

# next に実行権限を与える（念のため）
RUN chmod +x node_modules/.bin/next

# 残りのアプリコードをコピー
COPY ./frontend .

CMD ["npm", "run", "dev"]
