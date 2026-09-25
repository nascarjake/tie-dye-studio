# Dye Day!

A mobile-first WebGL tie-dye game. Players choose one of six folds, place three rubber bands, paint with eight colors, three depths, and three brush sizes, then unfold and decorate their one-of-a-kind shirt. Finished shirts can be downloaded or hung on a shared clothesline.

The paint system is capped at 300 points per shirt. The renderer builds one 512×512 dye texture as the player paints, so the WebGL shader does constant work even on a fully painted tee.

## Run locally

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `VITE_GALLERY_URL` to use a deployed gallery Worker. When it is empty, the clothesline uses browser-local storage.

## Checks

```sh
npm test
npm run build
npm run test:browser
```

The unit suite covers fold data, the 300-point limit, palette encoding, stickers, gallery validation, and Worker request handling. The browser suite covers the intro, all colors, live color rendering, complete creation and save flows, download, the 300-point ceiling, and a 375×667 mobile viewport.

## Shared clothesline

The gallery API is a Cloudflare Worker backed by D1. Its configuration is in `worker/wrangler.jsonc` and schema in `worker/migrations/0001_shirts.sql`.

```sh
npm run gallery:types
npx wrangler d1 migrations apply tie-dye-studio-gallery --remote --config worker/wrangler.jsonc
npm run gallery:deploy
```

The Worker accepts only the `studio` collection, validates submitted PNG signatures and dimensions, bounds request size, rate limits submissions, and stores a maximum of 1,000 shirts.

## Deployment

GitHub Actions runs the tests and publishes `dist` to GitHub Pages on every push to `main`. Set the repository Actions variable `VITE_GALLERY_URL` to the Worker URL before the first deployment.

## Project map

- `src/main.js` — game flow, pointer and keyboard controls, snapshots, gallery UI
- `src/model.js` — folds, color palette, paint limit, shirt state, validation
- `src/renderer.js` — WebGL shirt, folds, band resists, cloth texture, dye texture
- `src/sticker-editor.js` — sticker placement and PNG rendering
- `src/gallery.js` — shared API and local fallback
- `worker/index.js` — clothesline API
