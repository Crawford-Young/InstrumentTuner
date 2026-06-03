import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/test/**', 'src/app/**'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
