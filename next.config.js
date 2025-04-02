/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize image handling
  images: {
    unoptimized: true, // For static exports
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: ['your-domain.com'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 60,
  },
  // Optimize build
  swcMinify: true,
  // Optimize for production
  reactStrictMode: true,
  
  // Configure optimization
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    critters: false, // Disable critters to prevent the error
    optimizePackageImports: ['lucide-react'],
    serverActions: true,
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Disable canvas module for PDF.js
    config.resolve.alias.canvas = false;
    
    // Handle worker files and deprecation warnings
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      sharp: false,
      fsevents: false,
      punycode: false
    };

    // Fix SWC warnings by excluding platform-specific modules
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@next/swc-darwin-arm64': false,
        '@next/swc-darwin-x64': false,
        '@next/swc-linux-arm64-gnu': false,
        '@next/swc-linux-arm64-musl': false,
        '@next/swc-win32-arm64-msvc': false,
        '@next/swc-win32-ia32-msvc': false,
        'fsevents': false,
        'punycode': false
      };
    }

    // Add resolver for punycode
    config.resolve.alias = {
      ...config.resolve.alias,
      punycode: 'punycode/',
    };

    // Optimize snapshot paths
    config.snapshot = {
      ...config.snapshot,
      managedPaths: [
        /^(.+?[\\/]node_modules[\\/](?!(@next[\\/]|fsevents|punycode)))/
      ],
    };

    // Add bundle analyzer in development
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      )
    }

    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate'
          }
        ]
      }
    ]
  },
  // Optimize compilation
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
    // Enable SWC optimizations
    styledComponents: true,
  },
  // Cache optimization
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  compress: true,
}

module.exports = nextConfig
