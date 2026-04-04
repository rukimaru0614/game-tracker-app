/** @type {import('next').NextConfig} */
const nextConfig = {
  // 開発サーバーの外部接続設定を固定
  // output: 'export', // コメントアウトして開発モードを有効化
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // ネットワークエラー対策の設定
  serverExternalPackages: []
}

module.exports = nextConfig
