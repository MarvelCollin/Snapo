import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seo } from './scripts/seo-plugin.ts'

const mediapipe = JSON.parse(readFileSync(new URL('./node_modules/@mediapipe/tasks-vision/package.json', import.meta.url), 'utf-8')).version as string

const base = process.env.BASE_PATH ?? '/'
const siteUrl = process.env.SITE_URL ?? 'https://marvelcollin.github.io/Snapo/'

export default defineConfig({
  base,
  plugins: [react(), seo({ siteUrl, base })],
  define: {
    'import.meta.env.VITE_MEDIAPIPE_VERSION': JSON.stringify(mediapipe),
  },
})
