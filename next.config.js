/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // コメントアウトして開発モードを有効化
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // ネットワークエラー対策の設定
  serverExternalPackages: []
}

module.exports = nextConfig
