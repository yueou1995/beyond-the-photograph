import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let vite
let App
let CollectionViewer
let collections

before(async () => {
  vite = await createServer({
    cacheDir: 'node_modules/.vite-render-tests',
    server: { middlewareMode: true, watch: null, hmr: false },
    appType: 'custom',
  })
  ;({ default: App } = await vite.ssrLoadModule('/src/App.tsx'))
  ;({ CollectionViewer } = await vite.ssrLoadModule(
    '/src/components/CollectionViewer.tsx',
  ))
  ;({ collections } = await vite.ssrLoadModule('/src/data/collections.ts'))
})

after(async () => {
  await vite?.close()
})

function collectionById(id) {
  const collection = collections.find((item) => item.id === id)
  assert.ok(collection, `Missing collection: ${id}`)
  return collection
}

test('collection metadata references real local images with correct dimensions', async () => {
  assert.ok(collections.length > 0)
  const ids = new Set()
  for (const collection of collections) {
    assert.ok(collection.id.trim())
    assert.ok(!ids.has(collection.id), `Duplicate collection ID: ${collection.id}`)
    ids.add(collection.id)
    assert.ok(collection.title.trim())
    assert.ok(collection.prompt.trim())
    assert.ok(collection.images.length > 0)
    for (const image of collection.images) {
      assert.ok(image.alt.trim())
      assert.ok(Number.isInteger(image.width) && image.width > 0)
      assert.ok(Number.isInteger(image.height) && image.height > 0)
      const bytes = await readFile(resolve('public', image.src))
      assert.ok(bytes.length > 0)
      if (image.src.endsWith('.png')) {
        assert.equal(bytes.readUInt32BE(16), image.width)
        assert.equal(bytes.readUInt32BE(20), image.height)
      }
      if (image.thumbnail) {
        assert.ok((await readFile(resolve('public', image.thumbnail))).length > 0)
      }
    }
  }
})

test('collections appear in the requested homepage order', () => {
  assert.deepEqual(
    collections.map((collection) => collection.id),
    [
      'quiet-miniatures',
      'drawn-from-memory',
      'everyday-gestures',
      'small-personalities',
      'travel-memories',
      'stories-beyond-the-frame',
    ],
  )
})

test('all collection prompts use the shared core section structure', () => {
  const expectedSections = [
    'Objective',
    'Format and Layout',
    'Top Half — Photography',
    'Bottom Half — Illustration',
    'Style and Color',
    'Composition and Negative Space',
    'Text',
    'Mood',
    'Avoid',
  ]

  for (const collection of collections) {
    assert.deepEqual(
      [...collection.prompt.matchAll(/^\*\*([^*\n]+)\*\*$/gm)].map(
        ([, section]) => section,
      ),
      expectedSections,
      `Inconsistent prompt sections for ${collection.id}`,
    )
    assert.ok(
      collection.prompt.split(/\s+/).length <= 325,
      `Prompt is too wordy: ${collection.id}`,
    )
    assert.doesNotMatch(
      collection.prompt,
      /^ {4}/m,
      `Prompt contains code-block indentation: ${collection.id}`,
    )
  }
})

test('the beach poster leads the travel collection with its shared prompt', () => {
  const first = collectionById('travel-memories')
  assert.deepEqual(
    first.images.map((image) => image.src.split('/').at(-1)),
    ['island-afternoon.png', 'morning-cyclists.png', 'alpine-lake.png'],
  )
  assert.match(first.prompt, /\*\*9 most distinctive travel memories or visual elements\*\*/)
  assert.match(first.prompt, /\*\*loose 3×3 organic grid\*\*/)
  assert.match(first.prompt, /one or two words/)
  assert.match(first.prompt, /plenty of breathing room/)
})

test('the lonely island poster leads the quiet-miniatures collection', () => {
  const second = collectionById('quiet-miniatures')
  assert.equal(second.title, 'Quiet miniatures')
  assert.deepEqual(
    second.images.map((image) => image.src.split('/').at(-1)),
    ['lonely-island.png', 'lone-tree.png', 'tibidabo.png'],
  )
  assert.deepEqual(
    second.images.map(({ width, height }) => [width, height]),
    [[768, 1152], [768, 1152], [768, 960]],
  )
  assert.match(second.prompt, /\*\*minimal isometric illustration\*\*/)
  assert.match(second.prompt, /\*\*10% of the lower section\*\*/)
  assert.match(second.prompt, /colors derived from the original photograph/)
  assert.match(second.prompt, /architectural model, scaled diorama, or paper sculpture/)
})

test('the stories-beyond-the-frame collection preserves its image order', () => {
  const third = collectionById('stories-beyond-the-frame')
  assert.equal(third.title, 'Stories beyond the frame')
  assert.deepEqual(
    third.images.map((image) => image.src.split('/').at(-1)),
    ['windmill-pause.png', 'venice-kindness.png', 'mountain-view.png'],
  )
  assert.deepEqual(
    third.images.map(({ width, height }) => [width, height]),
    [[768, 1024], [768, 1152], [768, 1024]],
  )
  assert.match(
    third.prompt,
    /\*\*unique story inspired entirely by this specific photo\*\*/,
  )
  assert.match(third.prompt, /\*\*4-10 words\*\*/)
  assert.match(third.prompt, /interactions crossing the boundary/)
})

test('the island poster leads the drawn-from-memory collection', () => {
  const fourth = collectionById('drawn-from-memory')
  assert.equal(fourth.title, 'Drawn from memory')
  assert.deepEqual(
    fourth.images.map((image) => image.src.split('/').at(-1)),
    ['island-sunset.png', 'mountain-light.png', 'canal-afternoon.png'],
  )
  assert.deepEqual(
    fourth.images.map(({ width, height }) => [width, height]),
    [[768, 1152], [768, 1152], [768, 1024]],
  )
  assert.match(fourth.prompt, /\*\*exactly 50\/50\*\*/)
  assert.match(fourth.prompt, /\*\*crayon\/pastel illustration\*\*/)
  assert.match(fourth.prompt, /\*\*30% of the lower half\*\*/)
  assert.match(fourth.prompt, /\*\*2-3 short English phrases\*\*/)
})

test('the cat poster leads the everyday-gestures collection', () => {
  const fifth = collectionById('everyday-gestures')
  assert.equal(fifth.title, 'Everyday gestures')
  assert.deepEqual(
    fifth.images.map((image) => image.src.split('/').at(-1)),
    ['sunlit-cat.png', 'field-walk.png', 'autumn-bench.png'],
  )
  assert.deepEqual(
    fifth.images.map(({ width, height }) => [width, height]),
    [[768, 1024], [768, 1024], [768, 1024]],
  )
  assert.match(fifth.prompt, /50% top and 50% bottom/)
  assert.match(fifth.prompt, /\*\*English text only\*\*/)
  assert.match(fifth.prompt, /\*\*intentional, generous negative space\*\*/)
  assert.match(fifth.prompt, /\*\*hand-drawn doodle lifestyle illustration\*\*/)
})

test('the duck-family poster leads the small-personalities collection', () => {
  const sixth = collectionById('small-personalities')
  assert.equal(sixth.title, 'Small personalities')
  assert.deepEqual(
    sixth.images.map((image) => image.src.split('/').at(-1)),
    ['duck-family.png', 'pond-geese.png', 'beach-piglet.png'],
  )
  assert.deepEqual(
    sixth.images.map(({ width, height }) => [width, height]),
    [[768, 1152], [768, 1024], [768, 1024]],
  )
  assert.match(sixth.prompt, /50% top and 50% bottom/)
  assert.match(sixth.prompt, /ultra-minimal, single-line doodle/)
  assert.match(sixth.prompt, /\*\*1-3 flat colors\*\*/)
  assert.match(sixth.prompt, /\*\*4:3 composition\*\*/)
})

test('an empty gallery has a readable empty state and no fabricated cards', () => {
  const html = renderToStaticMarkup(createElement(App, { collections: [] }))
  assert.match(html, /No collections yet\./)
  assert.doesNotMatch(html, /0 collections/)
  assert.doesNotMatch(html, /class="collection-card"/)
})

test('a single-image collection disables both navigation directions', () => {
  const source = collectionById('travel-memories')
  const collection = {
    ...source,
    images: [source.images[0]],
  }
  const html = renderToStaticMarkup(
    createElement(CollectionViewer, { collection, onClose() {} }),
  )
  assert.match(html, /aria-label="Previous image" aria-disabled="true"/)
  assert.match(html, /aria-label="Next image" aria-disabled="true"/)
  assert.match(html, /Image 1 of 1/)
  assert.match(html, /Back to gallery/)
})

test('additional collections render one cover each without duplicating their images', () => {
  const source = collectionById('travel-memories')
  const items = [1, 2, 3, 4, 5].map((number) => ({
    ...source,
    id: `test-collection-${number}`,
    title: `Test collection ${number}`,
  }))
  const html = renderToStaticMarkup(
    createElement(App, { collections: items }),
  )
  assert.equal((html.match(/class="collection-card"/g) ?? []).length, 5)
  assert.equal((html.match(/<img /g) ?? []).length, 5)
  assert.doesNotMatch(html, /5 collections|15 images/)
})

test('prompt formatting cannot embed scripts or remote media', () => {
  const source = collectionById('travel-memories')
  const collection = {
    ...source,
    prompt:
      'A **bold** idea.\n\n<script>alert("unsafe")</script>\n\n![remote](https://example.invalid/tracker.png)',
  }
  const html = renderToStaticMarkup(
    createElement(CollectionViewer, { collection, onClose() {} }),
  )
  assert.match(html, /<strong>bold<\/strong>/)
  assert.doesNotMatch(html, /<script>/)
  assert.doesNotMatch(html, /example\.invalid/)
})
