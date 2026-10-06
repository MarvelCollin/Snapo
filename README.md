# Snapo

A cute photobooth that runs in the browser. Pick a ready made design, shoot with your webcam, crop and filter each photo, decorate if you like, then save it or scan a QR code to get the soft file on your phone. Photos stay on your device unless you choose to make a QR link.

- Live: https://marvelcollin.github.io/Snapo/
- Preview of the `dev` branch: https://marvelcollin.github.io/Snapo/dev/

## How a session goes

1. **Design:** start from one of 18 complete templates, or pick a plain layout to decorate yourself
2. **Shoot:** countdown, pose ideas, studio backdrops and live photo clips, with every setting on one screen
3. **Edit:** tap any photo on the strip to crop it or give it its own filter
4. **Decorate (optional):** frames, stickers, text, doodle pens and caption style
5. **Save:** PNG, JPG, GIF, live strip, share, print, local gallery, or a QR code for your phone

## Features

- **Templates:** 18 fully designed sheets that only need your photos, such as Snapo Times newspaper, Cover Story magazine, Kitty Club, Bunny Picnic, Bear Cafe, Idol Photocard, Comic Pop, Love Letter, Camcorder, Film Roll 400, Movie Night ticket, Snapo Mart receipt, Snapo Air boarding pass, Pocket Player, Birthday Bash, Class Of, Dirgahayu for 17 Agustus and Lebaran Day. Grouped into Cute, Editorial, Retro, Party and Indonesia
- **Layouts:** 27 plain strips, grids, postcards, singles and shapes, plus your own uploaded frames
- **Look:** 50 filters you can set per photo, a soft skin slider, and studio backdrops (color, pattern or blur) powered by on-device segmentation
- **Decorate:** 61 frame themes including batik, Lebaran, Imlek and 17 Agustus, 207 stickers, 38 word stickers, text and doodle pens (marker, neon, outline, rainbow, sparkle)
- **Save:** PNG, JPG, flipbook GIF, live strip as video or GIF, share, print, a local gallery and a QR download link
- **Languages:** English and Bahasa Indonesia

### QR download

On the Save step, **Make QR code** uploads a JPG of the finished strip to [tmpfiles.org](https://tmpfiles.org), a free file host, and shows a QR code for its link. Scanning it opens a page where the phone can download the soft file. The file is deleted after 60 minutes. Nothing is uploaded until that button is pressed.

### Your own frame

Design a frame in Canva or any editor, leave the photo spots transparent and export it as a PNG. In the booth, open Design, go to **My frames** and upload it. Snapo finds the see-through spots and turns them into photo slots. A sheet with two matching strips side by side (like a 4R print cut in half) reuses the same photos in both strips.

## Run

```bash
npm install
npm run dev
```

The camera needs `localhost` or https.

## Deploy

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to `main` or `dev`. Each run builds only the branch that was pushed and writes it into the `gh-pages` branch, `main` at the root and `dev` under `/dev/`, leaving the other one untouched. Every publish is a new commit, so a fast forwarded `main` is always picked up.

- Set **Settings > Pages > Source** to **Deploy from a branch**, branch `gh-pages`, folder `/`
- The build reads `BASE_PATH` (for example `/Snapo/dev/`) and the router uses it as its basename
- `public/404.html` sends deep links such as `/Snapo/booth/shoot` back to the app, and a small script in `index.html` restores the address
- `node_modules` is cached by lockfile hash, so a deploy without dependency changes skips `npm ci`
- `gh-pages` is pushed with a lease and retried, so a `main` and a `dev` deploy running together cannot overwrite each other
- Only the SIMD build of the segmenter is bundled. Browsers without wasm SIMD (Safari before 16.4) load the fallback from jsDelivr, pinned to the installed MediaPipe version

## Project structure

```
src/
  main.tsx, App.tsx      entry and routes only
  pages/                 one file per route, default export
    booth/               the five booth steps and BoothShell, the booth route wrapper
  components/            named exports, one component per file
    app/                 app chrome such as the header
    ui/                  generic building blocks (Button, Dialog, Popover, Slider, ...)
    shared/              product pieces used on more than one screen
    layout/ shoot/ edit/ decorate/ save/   pieces that belong to one booth step
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

Templates live in two files. `lib/layouts.ts` holds each template's sheet size and photo slots, and `lib/templates.ts` holds its frame, filter, caption and stickers. The printed artwork, like the newspaper masthead or the boarding pass fields, is drawn in `lib/templateArt.ts`.

### Naming rules

| What | Rule | Example |
|------|------|---------|
| Component file | PascalCase, named after the one component it exports | `components/edit/CropEditor.tsx` |
| Page file | PascalCase ending in `Page`, or `Step` inside the booth, default export | `pages/booth/ShootStep.tsx` |
| Hook file | camelCase starting with `use`, one hook per file | `hooks/useSegmenterStatus.ts` |
| Store file | camelCase domain name, exports `useDomain` | `store/customFrames.ts` exports `useCustomFrames` |
| Logic file | camelCase topic, no React imports | `lib/frameUpload.ts` |
| Stylesheet | lowercase area name | `styles/decorate.css` |
| Static asset or script | kebab-case | `public/models/selfie-segmenter.tflite` |
| CSS class | BEM style, `block__element--modifier` | `.edit__spot.is-active` |

UI copy never lives in components or data. Add the key to `src/i18n/en.ts` first, and TypeScript will then require the same key in `id.ts`. Proper names such as filter, frame and layout names stay in the data files and are not translated.

## Credits

- Sticker art from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji), MIT License. Refresh with `node scripts/fetch-stickers.mjs`.
- Backdrops use the [MediaPipe selfie segmenter](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter), Apache 2.0, which runs fully in the browser.
- Fonts from [Fontsource](https://fontsource.org), SIL Open Font License.
- QR codes by [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), MIT License.
- The Kitty Club template is an original design and is not affiliated with any character brand.
