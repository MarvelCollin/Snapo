# Snapo

A cute photobooth that runs in the browser. Pick a strip layout, shoot with a live filter, decorate with frames and stickers, then save or share. Everything runs on your device. Nothing is uploaded.

## Features

- **Layouts:** 27 strips, grids, postcards, singles and shapes, plus your own uploaded frames
- **Shoot:** live filters, countdown, pose ideas, bonus shots with a "pick your best" step, and live photo clips
- **Look:** 50 filters, a soft skin slider, and studio backdrops (color, pattern or blur) powered by on-device segmentation
- **Decorate:** 61 frame themes including batik, Lebaran, Imlek and 17 Agustus, 207 stickers, 38 word stickers, text and doodle pens (marker, neon, outline, rainbow, sparkle)
- **Save:** PNG, JPG, flipbook GIF, live strip as video or GIF, share, print and a local gallery
- **Languages:** English and Bahasa Indonesia

### Your own frame

Design a frame in Canva or any editor, leave the photo spots transparent and export it as a PNG. In the booth, open Layout, go to **My frames** and upload it. Snapo finds the see-through spots and turns them into photo slots. A sheet with two matching strips side by side (like a 4R print cut in half) reuses the same photos in both strips.

## Run

```bash
npm install
npm run dev
```

The camera needs `localhost` or https.

## Project structure

```
src/
  main.tsx, App.tsx      entry and routes only
  pages/                 one file per route, default export
    booth/               the four booth steps and BoothShell, the booth route wrapper
  components/            named exports, one component per file
    app/                 app chrome such as the header
    ui/                  generic building blocks (Button, Dialog, Slider, ...)
    shared/              product pieces used on more than one screen
    shoot/ decorate/ save/   pieces that belong to one booth step
  hooks/                 React hooks, one per file
  store/                 zustand stores, one per domain
  lib/                   plain TypeScript logic with no React
  i18n/                  en.ts and id.ts hold every piece of UI copy
  styles/                one stylesheet per area, plus base.css and tokens.css
  data/                  generated data such as the sticker manifest
  types/                 type declarations for untyped packages
public/                  static files, kebab-case names
scripts/                 node scripts, kebab-case names
```

### Naming rules

| What | Rule | Example |
|------|------|---------|
| Component file | PascalCase, named after the one component it exports | `components/shoot/PickDialog.tsx` |
| Page file | PascalCase ending in `Page`, or `Step` inside the booth, default export | `pages/booth/ShootStep.tsx` |
| Hook file | camelCase starting with `use`, one hook per file | `hooks/useSegmenterStatus.ts` |
| Store file | camelCase domain name, exports `useDomain` | `store/customFrames.ts` exports `useCustomFrames` |
| Logic file | camelCase topic, no React imports | `lib/frameUpload.ts` |
| Stylesheet | lowercase area name | `styles/decorate.css` |
| Static asset or script | kebab-case | `public/models/selfie-segmenter.tflite` |
| CSS class | BEM style, `block__element--modifier` | `.pick__take.is-picked` |

UI copy never lives in components or data. Add the key to `src/i18n/en.ts` first, and TypeScript will then require the same key in `id.ts`. Proper names such as filter, frame and layout names stay in the data files and are not translated.

## Credits

- Sticker art from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji), MIT License. Refresh with `node scripts/fetch-stickers.mjs`.
- Backdrops use the [MediaPipe selfie segmenter](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter), Apache 2.0, which runs fully in the browser.
