# Beyond the Photograph

A quiet, single-page visual gallery built with React, TypeScript, and Vite. It includes six collections, each with three supplied posters and its own original prompt:

- **Travel memories**: photographs paired with hand-drawn travel doodles. The beach poster is the cover.
- **Quiet miniatures**: photographs paired with isometric dioramas, ordered Lonely Island, The Lone Tree, and Tibidabo. The island poster is the cover.
- **Stories beyond the frame**: photographs extended into hand-drawn, story-driven scenes, ordered windmills, Venice, and snowy gondolas. The windmill artwork is the cover.
- **Drawn from memory**: photographs paired with warm crayon and pastel interpretations, ordered island, mountain valley, and canal. The island artwork is the cover.
- **Everyday gestures**: photographs paired with expressive doodle and marker interpretations, ordered cat, field walk, and autumn bench. The cat artwork is the cover.
- **Small personalities**: animal photographs paired with ultra-minimal line doodles, ordered duck family, geese, and piglet. The duck-family artwork is the cover.

## Run locally

Use Node.js 22.12+ or a newer supported release.

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open the local URL printed by Vite. The VS Code **Gallery: dev** task starts the site at `http://127.0.0.1:5173/`. Preview through a web server rather than opening the source HTML directly.

## Add or edit a collection

Edit [src/data/collections.ts](./src/data/collections.ts). Each collection has:

- A unique, stable `id`.
- A display `title`.
- One `prompt` string. Markdown formatting is displayed safely, and **Copy** copies the exact original string, including formatting and line breaks.
- An ordered, nonempty `images` array. The first image is the homepage cover and the first image shown when the collection opens.

Every prompt uses the same concise nine-section hierarchy: **Objective**, **Format and Layout**, **Top Half — Photography**, **Bottom Half — Illustration**, **Style and Color**, **Composition and Negative Space**, **Text**, **Mood**, and **Avoid**.

Each image supplies `src`, descriptive `alt` text, its pixel `width` and `height`, and an optional smaller `thumbnail`. Place local files under [public/art/](./public/art/) and write paths relative to `public`, without a leading slash.

```ts
{
  id: 'another-collection',
  title: 'Another collection',
  prompt: `Your complete generation prompt goes here.`,
  images: [
    {
      src: 'art/another-collection/first.png',
      thumbnail: 'art/another-collection/first-thumb.jpg',
      alt: 'Describe the artwork and its important visual details.',
      width: 768,
      height: 1152,
    },
  ],
}
```

Reorder images to choose a different cover. Update `homeCollectionOrder` to change the gallery order without moving the prompt definitions. Titles and captions wrap, and empty galleries or unavailable images get explicit, readable states.

The original PNGs are preserved unchanged. JPEG thumbnails keep the homepage lighter; full-size originals are requested only when viewed. On macOS, create a thumbnail without changing the original:

```sh
sips -Z 768 -s format jpeg -s formatOptions 88 \
  public/art/another-collection/first.png \
  --out public/art/another-collection/first-thumb.jpg
```

Keep original artwork uncropped. Homepage covers use a consistent **2:3 portrait frame** with a centered crop so every row aligns, without a canvas, border, or surrounding image padding. The popup contains the complete image at its original aspect ratio.

## Design and interactions

- Warm ivory, muted charcoal, system sans-serif text, and Georgia headings. No remote fonts or third-party image requests.
- One tile per collection; no fabricated collections to fill empty grid positions.
- Homepage tiles show only the artwork, with collection names retained in accessible button and dialog labels. Pointer hover gently dims a cover by 10%, without changing its size or affecting popup images. Touch devices do not get a sticky hover effect.
- No visible tile titles, arrows, metadata labels, collections heading, secondary header labels, or footer navigation. The main introduction, **Made by Yue** footer credit, page spacing, and keyboard skip link remain.
- **1 column** below 768px; **2** at 768-1023px; and **3** from 1024px upward. The gallery never exceeds three columns, keeping desktop previews large.
- On screens at least 1024px wide, the ivory dialog has a full-height image pane on the left and an independently scrolling prompt pane on the right. Below 1024px it becomes full-screen, stacking the image above the prompt with natural vertical scrolling.
- Desktop dialog sizing accounts for the widest image ratio in each collection so every image can fit the full pane height without cropping, while the dialog size stays stable during navigation. The divider follows the current image's actual right edge; narrower images give the remaining width to the prompt instead of leaving empty image margins.
- Viewer images remain uncropped, with previous/next arrows overlaid at their sides. There are no visible image titles or counters; the image position is announced only to screen readers. The prompt section uses the short labels **Prompt** and **Copy**, without a footnote.
- Button, keyboard-arrow, and horizontal-swipe navigation stop at either end. No autoplay or wraparound.
- Unavailable directions are announced and styled as disabled but remain focusable, so reaching an endpoint does not drop keyboard focus. Tab and Shift+Tab cycle through the viewer controls consistently across browsers.
- Vertical touch scrolling and pinch zoom remain available.
- The **X-only close button** (accessibly named "Back to gallery"), Escape, or an intentional desktop backdrop click closes the viewer, restoring focus and the homepage scroll position. Collections do not add browser-history entries or separate routes.
- Long prompts remain selectable and readable. Clipboard failures explain how to copy manually instead of claiming success.
- Keyboard focus stays inside the dialog; the background is inert while open. Reduced-motion preferences are respected.

The working site name and introductory copy are in [src/App.tsx](./src/App.tsx); update the document title and description in [index.html](./index.html) when renaming it. Visual tokens and responsive rules live in [src/styles.css](./src/styles.css).

`react-markdown` handles prompt formatting without enabling raw HTML, scripts, or embedded remote media. There is no router, carousel package, backend, CMS, analytics, or account system.

## Verify

```sh
npx playwright install chromium webkit
npm run check
```

`check` runs the scaffold's Oxlint rules, TypeScript and a production build, Node rendering/content tests, and Playwright tests in desktop Chromium and mobile WebKit. Browser tests serve the actual build from `/gallery/` to verify subdirectory hosting. The test server uses local port 4175 and is stopped automatically.

Focused commands:

```sh
npm run test:render
npm run test:browser  # run npm run build first
```

Coverage includes exact grid breakpoints and real row wrapping, supplied-image order, single-image and empty states, navigation boundaries, focus/scroll restoration, backdrop handling, swipes and vertical scrolling, long prompts, exact clipboard contents, clipboard errors, image loading/failures, image containment, reduced motion, and runtime errors.

## Build and host

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

Publish the generated `dist/` directory to a static host. Relative asset paths support hosting at a domain root or under a subdirectory; serve subdirectory URLs with a trailing slash. Use HTTPS in production so the Clipboard API is available.

No deployment has been made and no hosting provider has been selected.
