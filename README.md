# Dev Feed

毎日1回、技術情報を収集し、Claude API で要約して PWA 対応の Web UI に表示する、ゼロサーバー構成の個人用フィードです。

## 仕組み
- **収集/要約**: GitHub Actions スケジュールで `scripts/fetch-and-summarize.mjs` を実行
- **保存**: `public/data/summary-YYYYMMDD.json` として保存。3日より前は自動削除
- **配信**: Push をトリガに Vite でビルドし GitHub Pages へデプロイ
- **閲覧**: PWA としてスマホのホーム画面に追加可

## セットアップ
1. リポジトリ作成後、`Settings > Secrets and variables > Actions > New repository secret` に以下を登録
   - `ANTHROPIC_API_KEY`: Claude API キー
2. 必要なら `config/sources.json` の RSS や GitHub リポジトリ一覧を編集
3. GitHub Pages を有効化（Actions の `Build & Deploy Pages` が初回成功すると自動で URL が割り当て）

## ローカル開発
```bash
npm ci
npm run dev
```

## 手動取得テスト
```bash
ANTHROPIC_API_KEY=... npm run fetch
```

## 構成
- `scripts/fetch-and-summarize.mjs` 収集/要約/ローテーション
- `public/data/` 要約 JSON（3日分）
- `public/sw.js` PWA Service Worker
- `public/manifest.webmanifest` PWA Manifest
- `src/` React フロント（カード UI）

## 注意
- SNS(X/Twitter)は無償APIが無いため、デフォルトは無効。`config/sources.json` の `twitter_users` で Nitter RSS を試行（可用性は非保証）
- GitHub API は `GITHUB_TOKEN` が自動注入される環境ではレートリミットが緩和されます
