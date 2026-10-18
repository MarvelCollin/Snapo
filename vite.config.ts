import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { seo, type SeoRoute } from './scripts/seo-plugin.ts'

const mediapipe = JSON.parse(readFileSync(new URL('./node_modules/@mediapipe/tasks-vision/package.json', import.meta.url), 'utf-8')).version as string

const base = process.env.BASE_PATH ?? '/'
const siteUrl = process.env.SITE_URL ?? 'https://marvelcollin.github.io/Snapo/'

const routes: SeoRoute[] = [
  {
    path: '/',
    title: 'Snapo | Free Online Photo Booth with Cute Templates',
    description: 'Snapo is a free photo booth in your browser. Pick a cute template, shoot a photo strip with your webcam, add filters, frames and stickers, then save it as PNG, GIF or video. No sign up.',
    priority: 1,
    changefreq: 'weekly',
  },
  {
    path: '/booth/layout',
    title: 'Pick a Photo Strip Design | Snapo Photo Booth',
    description: 'Choose from cute photo booth templates like Kitty Club, Snapo Times, idol photocards, film strips and more, or a plain strip, grid or postcard layout to decorate yourself.',
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/gallery',
    title: 'Your Photo Strip Gallery | Snapo Photo Booth',
    description: 'Every photo strip you save in Snapo stays here on your device. Download, share or print them again any time.',
    priority: 0.5,
    changefreq: 'monthly',
  },
]

export default defineConfig({
  base,
  plugins: [react(), seo({ siteUrl, base, routes })],
  define: {
    'import.meta.env.VITE_MEDIAPIPE_VERSION': JSON.stringify(mediapipe),
  },
})
