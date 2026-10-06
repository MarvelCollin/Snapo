import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const mediapipe = JSON.parse(readFileSync(new URL('./node_modules/@mediapipe/tasks-vision/package.json', import.meta.url), 'utf-8')).version as string

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_MEDIAPIPE_VERSION': JSON.stringify(mediapipe),
  },
})
