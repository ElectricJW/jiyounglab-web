import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' keeps every asset path relative, so the build runs from any static host,
// a subfolder, or the single-file artifact build (scripts/build-artifact.mjs).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
  },
})
