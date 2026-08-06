import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    include: ['{app,components,lib,test}/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
})
