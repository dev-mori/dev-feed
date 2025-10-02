# Dev Feed

毎日1回、技術情報を収集し PWA 対応の Web UI に表示する、ゼロサーバー構成の個人用フィードです。

## 仕組み
- **収集**: GitHub Actions スケジュールで `scripts/fetch-and-summarize.mjs` を実行
- **保存**: `public/data/summary-YYYYMMDD.json` として保存。3日より前は自動削除
- **配信**: Push をトリガに Vite でビルドし GitHub Pages へデプロイ
- **閲覧**: PWA としてスマホのホーム画面に追加可

## セットアップ
1. 必要なら `config/sources.json` の RSS や GitHub リポジトリ一覧を編集
2. GitHub Pages を有効化（Actions の `Build & Deploy Pages` が初回成功すると自動で URL が割り当て）

## ローカル開発
```bash
npm ci
npm run dev
```

## 手動取得テスト
```bash
npm run fetch
```

## 構成
- `scripts/fetch-and-summarize.mjs` 収集/ローテーション
- `public/data/` データ JSON（3日分）
- `public/sw.js` PWA Service Worker
- `public/manifest.webmanifest` PWA Manifest
- `src/` React フロント（カード UI）

## 注意
- SNS(X/Twitter)は無償APIが無いため、デフォルトは無効。`config/sources.json` の `twitter_users` で Nitter RSS を試行（可用性は非保証）
- GitHub API は `GITHUB_TOKEN` が自動注入される環境ではレートリミットが緩和されます
