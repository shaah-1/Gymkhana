import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  // In GitHub Actions (or when deployed to GitHub Pages), default to /Gymkhana/
  const defaultBase = process.env.GITHUB_ACTIONS === 'true' ? '/Gymkhana/' : '/'
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || defaultBase,
  }
})
