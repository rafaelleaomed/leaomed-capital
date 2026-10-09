import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Keep Node/native dependencies intact instead of bundling PDF.js into the route.
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas'],
}

export default nextConfig
