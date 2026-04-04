# Game Tracker

ゲームのポイント推移を記録・可視化する非公式ツールです。

## 📋 概要

- **対応ゲーム**: Apex Legends, Valorant, League of Legends, Street Fighter 6
- **機能**: ポイント記録、ランク判定、推移グラフ、履歴管理
- **開発者**: IR
- **バージョン**: 1.0.0

## ⚠️ 免責事項

**本アプリは個人開発の非公式ツールです。LoL, スト6, Apex, Valorantの各運営会社様とは一切関係ありません。**

- 各ゲームのランクシステムは公式情報を基に作成していますが、正確性を保証するものではありません
- データはすべてローカルに保存され、サーバーには送信されません
- 本アプリの使用により生じた損害について、開発者は一切の責任を負いません

## 🚀 友達への共有方法

**簡単に共有できます！**

1. **このURLを友達に教えるだけ**: `[デプロイ後のURL]`
2. **合言葉を伝える**: `IR614` （開発者のイニシャル＋数字）
3. **ブラウザで開く**: スマホ・PCどちらでもOK

**インストール不要** - ブラウザだけで使えるWebアプリです。

## 🛠️ デプロイ手順（GitHub + Vercel）

### 開発者向け手順

1. **GitHubにプッシュ**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin [GitHubリポジトリURL]
   git push -u origin main
   ```

2. **Vercelと連携**
   - [Vercel](https://vercel.com) にログイン
   - 「New Project」をクリック
   - GitHubリポジトリをインポート
   - 環境変数を設定:
     ```
     NEXT_PUBLIC_PASSWORD=IR614
     NEXT_PUBLIC_APP_NAME=Game Tracker
     NEXT_PUBLIC_APP_VERSION=1.0.0
     NEXT_PUBLIC_APP_AUTHOR=IR
     ```

3. **自動デプロイ完了**
   - 数分で公開URLが発行されます
   - プッシュ時には自動で更新されます

## 📱 使い方

1. **合言葉入力**: `IR614` を入力
2. **ゲーム選択**: Apex, VALORANT, LoL, SF6から選択
3. **ポイント記録**: 現在のRP/RR/LPを入力して保存
4. **確認**: ランク、推移グラフ、履歴を確認

## 🔧 技術仕様

- **フレームワーク**: Next.js 15.1.6
- **UI**: Tailwind CSS, Lucide React
- **グラフ**: Recharts
- **認証**: 簡易合言葉（24時間有効）
- **データ保存**: LocalStorage

## 📄 ライセンス

個人利用に限り無料で使用できます。商用利用は禁止です。
