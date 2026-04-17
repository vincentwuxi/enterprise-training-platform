import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { getCourseAliases } from './vite.aliases.generated.js'

const __dirname_resolved = path.dirname(new URL(import.meta.url).pathname);
const courseAliases = getCourseAliases(__dirname_resolved);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'katex'],
    alias: {
      '@': path.resolve(__dirname_resolved, './src'),
      ...courseAliases,
      // Ensure external course dirs can resolve shared dependencies
      'katex': path.resolve(__dirname_resolved, 'node_modules/katex'),
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
