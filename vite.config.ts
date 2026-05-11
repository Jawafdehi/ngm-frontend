import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    define: {
      'import.meta.env.SENTRY_DSN': JSON.stringify(env.SENTRY_DSN || ''),
    },
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://portal.jawafdehi.org/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/r2-testing': {
          target: 'https://pub-4c5659ae2e0249e99311f6c50897f48a.r2.dev',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/r2-testing/, ''),
        },
      },
      fs: {
        // Allow serving files from parent directory
        allow: ['..'],
      },
    },
  }
})