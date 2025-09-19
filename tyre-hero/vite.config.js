import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        // Optimized asset chunking for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          // Performance optimizations
          performance: [
            './src/hooks/useOptimizedMouseTracking.js',
            './src/hooks/useInViewAnimation.js',
            './src/hooks/useMemoryOptimization.js'
          ],
          // UI components
          ui: [
            './src/components/ui/OptimizedImage.jsx',
            './src/components/performance/OptimizedParticleSystem.jsx'
          ]
        },
      },
      // External dependencies (if any)
      external: [],
    },
    // Enable source maps for production debugging
    sourcemap: true,
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    // Target modern browsers for better performance
    target: 'esnext',
    // CSS code splitting
    cssCodeSplit: true,
    // Asset inlining threshold
    assetsInlineLimit: 4096,
  },
  // Performance optimization options
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: [],
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: true,
  },
  // Base URL for deployment
  base: './',
  // Enable experimental features for better performance
  esbuild: {
    target: 'esnext',
    minify: true,
    keepNames: false,
  },
})
