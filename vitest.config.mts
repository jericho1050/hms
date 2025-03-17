import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    globals: true,
    setupFiles: [
      './tests/setup-supabase-mock.ts', // Add this first so Supabase is mocked before any other setup
      './tests/setup.tsx'
    ],
    environment: 'jsdom',
    alias: {
      '@': resolve(__dirname, './')
    }
  },
})