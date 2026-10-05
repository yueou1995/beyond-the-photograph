import { expect, test, type Page, type Route } from '@playwright/test'
import { collections } from '../src/data/collections.ts'

function collectionById(id: string) {
  const collection = collections.find((item) => item.id === id)
  if (!collection) throw new Error(`Missing test collection: ${id}`)
  return collection
}

const collection = collectionById('travel-memories')
const quietCollection = collectionById('quiet-miniatures')

async function openCollection(page: Page, target = collection) {
  const opener = page.getByRole('button', {
    name: `${target.title}. Open collection`,
    exact: true,
  })
  await opener.scrollIntoViewIfNeeded()
  await opener.click()
  await expect(page.getByRole('dialog', { name: target.title })).toBeVisible()
}

async function swipe(page: Page, horizontal: number, vertical = 0) {
  const stage = page.locator('.viewer-stage')
  const pointer = {
    pointerType: 'touch',
    pointerId: 1,
    isPrimary: true,
    clientX: 220,
    clientY: 200,
  }
  await stage.dispatchEvent('pointerdown', pointer)
  await stage.dispatchEvent('pointerup', {
    ...pointer,
    clientX: pointer.clientX + horizontal,
    clientY: pointer.clientY + vertical,
  })
}

test.beforeEach(async ({ page }) => {
  await page.goto('./')
})

test('shows only the real collections and defers original images until opening', async ({
  page,
}) => {
  const originals: string[] = []
  page.on('request', (request) => {
    if (/\/art\/.*\.png$/.test(request.url())) originals.push(request.url())
  })
  await page.reload()
  await expect(page.locator('.collection-card')).toHaveCount(collections.length)
  for (const image of await page.locator('.collection-card img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() =>
      image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    ).toBeGreaterThan(0)
  }
  await expect(page.getByRole('region', { name: 'Collections', exact: true })).toBeVisible()
  await expect(page.locator('.collection-card')).toHaveText(
    collections.map(() => ''),
  )
  expect(originals).toEqual([])
  await openCollection(page)
  await expect(page.locator('.viewer-stage img')).toHaveJSProperty('naturalWidth', 768)
  expect(originals).toHaveLength(1)
})

test('shows aligned image-only covers at a consistent portrait ratio', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const [index, item] of collections.entries()) {
      const card = page.locator('.collection-card').nth(index)
      const cover = card.locator('.collection-cover')
      const image = cover.locator('img')
      await image.scrollIntoViewIfNeeded()
      await expect.poll(() =>
        image.evaluate((element: HTMLImageElement) => element.naturalWidth),
      ).toBeGreaterThan(0)
      const coverBounds = await cover.boundingBox()
      const imageBounds = await image.boundingBox()
      const cardBounds = await card.boundingBox()
      if (!coverBounds || !imageBounds || !cardBounds) {
        throw new Error(`Cover bounds are missing at ${width}px`)
      }
      expect(coverBounds.width).toBeCloseTo(cardBounds.width, 1)
      expect(coverBounds.height).toBeCloseTo(cardBounds.height, 1)
      expect(coverBounds.height / coverBounds.width).toBeCloseTo(3 / 2, 3)
      expect(imageBounds.x).toBeCloseTo(coverBounds.x, 1)
      expect(imageBounds.y).toBeCloseTo(coverBounds.y, 1)
      expect(imageBounds.width).toBeCloseTo(coverBounds.width, 1)
      expect(imageBounds.height).toBeCloseTo(coverBounds.height, 1)
      await expect(cover).toHaveCSS('padding', '0px')
      await expect(cover).toHaveCSS('border-width', '0px')
      await expect(cover).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect(cover).toHaveCSS('overflow', 'hidden')
      await expect(image).toHaveCSS('object-fit', 'cover')
      await expect(image).toHaveCSS('object-position', '50% 50%')
      await expect(card).toHaveText('')
      await expect(card.locator('svg')).toHaveCount(0)
      await expect(card).toHaveAccessibleName(`${item.title}. Open collection`)
    }
  }
})

test('gently dims hovered covers without dimming popup artwork or changing layout', async ({
  page,
}) => {
  const card = page.locator('.collection-card').first()
  const image = card.locator('img')
  const heading = page.getByRole('heading', {
    level: 1,
    name: 'Beyond the Photograph.',
    exact: true,
  })
  await expect(image).toHaveJSProperty('naturalWidth', 512)
  await heading.hover()
  await expect(image).toHaveCSS('filter', 'none')
  await card.scrollIntoViewIfNeeded()
  const before = await card.boundingBox()
  const canHover = await page.evaluate(() => matchMedia('(hover: hover)').matches)
  await card.hover()
  await expect(image).toHaveCSS('filter', canHover ? 'brightness(0.9)' : 'none')
  expect(await card.boundingBox()).toEqual(before)

  await openCollection(page)
  await expect(page.locator('.viewer-stage img')).toHaveCSS('filter', 'none')
  await page.getByRole('button', { name: 'Back to gallery' }).click()
  await heading.hover()
  await expect(image).toHaveCSS('filter', 'none')
})

test('removes secondary homepage labels and navigation while retaining accessible collections', async ({
  page,
}) => {
  for (const label of [
    'Images imagined. Prompts shared.',
    'A little curiosity, collected',
    'A personal AI art gallery',
  ]) {
    await expect(page.getByText(label, { exact: true })).toHaveCount(0)
  }
  await expect(page.getByRole('heading', { name: 'The collections', exact: true })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Back to top', exact: true })).toHaveCount(0)
  await expect(page.getByText('Imagined Archive', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Made with imagination.', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Kept for the feeling.', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('contentinfo')).toContainText('Made by Yue')
  await expect(page).toHaveTitle('Beyond the Photograph — Yue')
  await expect(page.getByRole('heading', { level: 1, name: 'Beyond the Photograph.', exact: true })).toBeVisible()
  await expect(
    page.getByText('Photographs unfolding into drawings and little stories.', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(page.getByText('Made by Yue', { exact: true })).toBeVisible()

  const skipLink = page.getByRole('link', { name: 'Skip to collections', exact: true })
  await skipLink.focus()
  await skipLink.press('Enter')
  await expect(page.getByRole('region', { name: 'Collections', exact: true })).toBeFocused()
  for (const item of collections) {
    await expect(page.getByRole('button', { name: `${item.title}. Open collection`, exact: true })).toBeVisible()
  }
})

test('uses exactly the agreed column counts and wraps complete rows', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop resize matrix')
  await page.locator('.collection-grid').evaluate((grid) => {
    const first = grid.firstElementChild
    if (!first) throw new Error('The real cover is missing')
    for (let index = grid.childElementCount; index < 8; index += 1) {
      grid.append(first.cloneNode(true))
    }
  })

  for (const [width, columns] of [
    [320, 1],
    [390, 1],
    [767, 1],
    [768, 2],
    [820, 2],
    [1023, 2],
    [1024, 3],
    [1180, 3],
    [1279, 3],
    [1280, 3],
    [1366, 3],
    [1440, 3],
    [1920, 3],
  ]) {
    await page.setViewportSize({ width, height: 1000 })
    const layout = await page.locator('.collection-grid').evaluate((grid) => {
      const cards = Array.from(grid.children, (card) => card.getBoundingClientRect())
      return {
        tracks: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
        firstRow: cards.filter((card) => Math.abs(card.top - cards[0].top) < 1).length,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      }
    })
    expect(layout, `Viewport width ${width}px`).toEqual({
      tracks: columns,
      firstRow: columns,
      overflow: false,
    })
  }
})

test('opens the first image, navigates in upload order, and stops at both ends', async ({
  page,
}) => {
  await openCollection(page)
  const image = page.locator('.viewer-stage img')
  const previous = page.getByRole('button', { name: 'Previous image' })
  const next = page.getByRole('button', { name: 'Next image' })

  await expect(image).toHaveAttribute('src', /island-afternoon\.png$/)
  await expect(previous).toBeDisabled()
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator('.image-counter')).toContainText('Image 1 of 3')

  await next.click()
  await expect(image).toHaveAttribute('src', /morning-cyclists\.png$/)
  await expect(page.locator('.image-counter')).toContainText('Image 2 of 3')
  await page.keyboard.press('ArrowRight')
  await expect(image).toHaveAttribute('src', /alpine-lake\.png$/)
  await expect(next).toBeDisabled()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('.image-counter')).toContainText('Image 3 of 3')
  await previous.click()
  await expect(page.locator('.image-counter')).toContainText('Image 2 of 3')
})

test('uses a full-height left image pane and an independently scrolling right prompt', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await openCollection(page, quietCollection)
  for (let index = 1; index < quietCollection.images.length; index += 1) {
    await page.getByRole('button', { name: 'Next image' }).click()
  }
  const image = page.locator('.viewer-stage img')
  await expect(image).toHaveJSProperty('naturalHeight', 960)
  for (const viewport of [
    { width: 1024, height: 768 },
    { width: 1024, height: 1400 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport)
    const dialog = page.getByRole('dialog')
    const stage = await page.locator('.viewer-stage').boundingBox()
    const figure = await page.locator('.viewer-figure').boundingBox()
    const prompt = await page.locator('.prompt-section').boundingBox()
    const close = await page.getByRole('button', { name: 'Back to gallery' }).boundingBox()
    const previous = await page.getByRole('button', { name: 'Previous image' }).boundingBox()
    const next = await page.getByRole('button', { name: 'Next image' }).boundingBox()
    if (!stage || !figure || !prompt || !close || !previous || !next) {
      throw new Error('The split viewer is missing a panel or control')
    }
    const dialogHeight = await dialog.evaluate((element) => {
      const style = getComputedStyle(element)
      return element.getBoundingClientRect().height -
        parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth)
    })
    expect(figure.height).toBeCloseTo(dialogHeight, 1)
    expect(figure.height).toBeCloseTo(stage.height, 1)
    expect(prompt.height).toBeCloseTo(figure.height, 1)
    expect(prompt.y).toBeCloseTo(figure.y, 1)
    expect(prompt.x).toBeCloseTo(figure.x + figure.width, 1)
    expect(close.x).toBeGreaterThan(prompt.x)
    expect(previous.y + previous.height / 2).toBeCloseTo(stage.y + stage.height / 2, 1)
    expect(next.y + next.height / 2).toBeCloseTo(stage.y + stage.height / 2, 1)
    await expect(page.locator('.viewer-stage')).toHaveCSS('padding', '0px')
    await expect(image).toHaveCSS('object-fit', 'contain')
    const paintedHeight = await image.evaluate((element: HTMLImageElement) => {
      const bounds = element.getBoundingClientRect()
      return element.naturalHeight * Math.min(
        bounds.width / element.naturalWidth,
        bounds.height / element.naturalHeight,
      )
    })
    expect(paintedHeight).toBeCloseTo(figure.height, 1)
    await page.locator('.prompt-text > :last-child').scrollIntoViewIfNeeded()
    expect(await page.locator('.viewer-figure').boundingBox()).toEqual(figure)
    await expect(page.getByRole('button', { name: 'Back to gallery' })).toBeInViewport()
    await page.locator('.viewer-body').evaluate((body) => body.scrollTop = 0)
  }
})

test('aligns the divider with every image edge and gives spare width to the prompt', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  const second = quietCollection
  await openCollection(page, second)
  const dialog = page.getByRole('dialog')
  const originalBounds = await dialog.boundingBox()
  if (!originalBounds) throw new Error('The dialog has no bounds')
  const promptWidths: number[] = []

  for (const [index, artwork] of second.images.entries()) {
    const image = page.locator('.viewer-stage img')
    await expect(image).toHaveAttribute('src', `./${artwork.src}`)
    await expect(image).toHaveJSProperty('naturalHeight', artwork.height)
    const painted = await image.evaluate((element: HTMLImageElement) => {
      const box = element.getBoundingClientRect()
      const scale = Math.min(
        box.width / element.naturalWidth,
        box.height / element.naturalHeight,
      )
      const width = element.naturalWidth * scale
      return {
        left: box.x + (box.width - width) / 2,
        right: box.x + (box.width + width) / 2,
        width,
      }
    })
    const figure = await page.locator('.viewer-figure').boundingBox()
    const prompt = await page.locator('.prompt-section').boundingBox()
    if (!figure || !prompt) throw new Error('The viewer panels have no bounds')
    expect(painted.left).toBeCloseTo(figure.x, 1)
    expect(prompt.x).toBeCloseTo(painted.right, 1)
    expect(prompt.width).toBeCloseTo(originalBounds.width - 2 - painted.width, 1)
    expect(await dialog.boundingBox()).toEqual(originalBounds)
    promptWidths.push(prompt.width)
    if (index < second.images.length - 1) {
      await page.getByRole('button', { name: 'Next image' }).click()
    }
  }

  expect(promptWidths[0]).toBeGreaterThan(500)
  expect(promptWidths[0]).toBeGreaterThan(promptWidths[2])
})

test('removes visible image labels and counters and provides an X-only close control', async ({
  page,
}) => {
  await openCollection(page)
  const dialog = page.getByRole('dialog')
  await expect(dialog).toHaveAccessibleName(collection.title)
  await expect(dialog.getByRole('heading', { name: collection.title, exact: true })).toHaveCount(0)
  await expect(dialog.getByText('Inside the collection', { exact: true })).toHaveCount(0)
  await expect(dialog.getByText('Back to gallery', { exact: true })).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: 'Back to gallery' })).toHaveText('')
  await expect(dialog.getByRole('button', { name: 'Back to gallery' }).locator('svg')).toHaveCount(1)
  await expect(dialog.locator('.image-counter')).toHaveClass(/sr-only/)
  await expect(dialog.locator('.image-counter')).toHaveCSS('clip', 'rect(0px, 0px, 0px, 0px)')
  await expect(dialog.locator('.viewer-figure')).toHaveText('Image 1 of 3')
  await expect(dialog.getByRole('heading', { name: 'Prompt', exact: true })).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Copy', exact: true })).toBeVisible()
  await expect(dialog.getByText('The original prompt, shared just as it was written.', { exact: true })).toHaveCount(0)
})

test('stacks the image above the prompt on narrow screens and keeps the close control available', async ({
  page,
}) => {
  await openCollection(page)
  const dialog = page.getByRole('dialog')
  for (const width of [320, 390, 768, 1023]) {
    await page.setViewportSize({ width, height: 844 })
    await dialog.evaluate((element) => element.scrollTop = 0)
    const image = await page.locator('.viewer-figure').boundingBox()
    const prompt = await page.locator('.prompt-section').boundingBox()
    if (!image || !prompt) throw new Error('The stacked viewer is missing a panel')
    expect(await page.locator('.viewer-stage').boundingBox()).toEqual(image)
    expect(await page.locator('.viewer-stage img').boundingBox()).toEqual(image)
    expect(prompt.y).toBeCloseTo(image.y + image.height, 1)
    expect(image.height).toBeLessThanOrEqual(844 * 0.75)
    await expect(page.locator('.viewer-body')).toHaveCSS('overflow-y', 'visible')
    await page.getByRole('button', { name: 'Copy', exact: true }).click({ trial: true })
    await page.locator('.prompt-text strong').last().scrollIntoViewIfNeeded()
    await expect(page.getByRole('button', { name: 'Back to gallery' })).toBeInViewport()
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  }
})

test('opens quiet miniatures with its own images, prompt, and fresh viewer state', async ({
  page,
}) => {
  const second = quietCollection
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copiedPrompt = text
        },
      },
    })
  })
  await openCollection(page)
  await page.getByRole('button', { name: 'Next image' }).click()
  await page.getByRole('button', { name: 'Copy', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Back to gallery' }).click()

  await openCollection(page, second)
  await expect(page.locator('.image-counter')).toContainText('Image 1 of 3')
  await expect(page.getByRole('button', { name: 'Previous image' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Copy', exact: true })).toBeVisible()
  await expect(page.locator('.prompt-text')).toContainText('minimal isometric illustration')
  await expect(page.locator('.prompt-text')).not.toContainText('loose 3×3 organic grid')

  for (const [index, artwork] of second.images.entries()) {
    const image = page.locator('.viewer-stage img')
    await expect(image).toHaveAttribute('src', `./${artwork.src}`)
    await expect(image).toHaveAttribute('alt', artwork.alt)
    await expect(image).toHaveJSProperty('naturalWidth', artwork.width)
    await expect(image).toHaveJSProperty('naturalHeight', artwork.height)
    await expect(image).toHaveCSS('object-fit', 'contain')
    await expect(page.locator('.image-counter')).toContainText(`Image ${index + 1} of 3`)
    if (index < second.images.length - 1) await swipe(page, -100)
  }
  await expect(page.getByRole('button', { name: 'Next image' })).toBeDisabled()
  await page.getByRole('button', { name: 'Copy', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-copied-prompt', second.prompt)
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Back to gallery' }).click()
  await expect(page.getByRole('button', { name: /Quiet miniatures.*Open collection/ })).toBeFocused()

  await openCollection(page)
  await expect(page.locator('.image-counter')).toContainText('Image 1 of 3')
  await expect(page.locator('.viewer-stage img')).toHaveAttribute('src', /island-afternoon\.png$/)
  await expect(page.locator('.prompt-text')).toContainText('loose 3×3 organic grid')
})

test('closes, restores focus and scroll, and reopens at the first image', async ({
  page,
}) => {
  const opener = page.getByRole('button', { name: /Travel memories.*Open collection/ })
  await opener.scrollIntoViewIfNeeded()
  await opener.focus()
  const scrollY = await page.evaluate(() => window.scrollY)
  const url = page.url()
  await opener.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('body')).toHaveCSS('position', 'fixed')
  await page.getByRole('button', { name: 'Back to gallery' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(opener).toBeFocused()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollY)
  expect(page.url()).toBe(url)

  await opener.press('Enter')
  await expect(page.locator('.image-counter')).toContainText('Image 1 of 3')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(opener).toBeFocused()
  await expect(page.locator('body')).toHaveCSS('position', 'static')
})

test('pointer activation also restores focus to the originating cover', async ({
  page,
}) => {
  await openCollection(page)
  await page.getByRole('button', { name: 'Back to gallery' }).click()
  await expect(
    page.getByRole('button', { name: /Travel memories.*Open collection/ }),
  ).toBeFocused()
})

test('keyboard navigation keeps working after a clicked control reaches an endpoint', async ({
  page,
}) => {
  await openCollection(page)
  const next = page.getByRole('button', { name: 'Next image' })
  const previous = page.getByRole('button', { name: 'Previous image' })
  await next.click()
  await next.click()
  await expect(next).toBeDisabled()
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator('.image-counter')).toContainText('Image 2 of 3')
  await previous.click()
  await expect(previous).toBeDisabled()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('.image-counter')).toContainText('Image 2 of 3')
})

test('keeps keyboard focus inside the dialog and makes the background inert', async ({
  page,
}) => {
  await openCollection(page)
  await expect(page.getByRole('button', { name: 'Back to gallery' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Previous image' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(page.getByRole('button', { name: 'Back to gallery' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(page.getByRole('button', { name: 'Copy', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Back to gallery' })).toBeFocused()
  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press('Tab')
    expect(
      await page.evaluate(() => Boolean(document.activeElement?.closest('dialog'))),
    ).toBe(true)
  }
  await page.locator('.collection-card').first().evaluate((element: HTMLButtonElement) => element.focus())
  expect(
    await page.evaluate(() => Boolean(document.activeElement?.closest('dialog'))),
  ).toBe(true)
})

test('dismisses intentional backdrop clicks but not clicks or drags from inside', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Phones use a full-screen dialog')
  await openCollection(page)
  await page.locator('.viewer-stage').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  const bounds = await page.getByRole('dialog').boundingBox()
  if (!bounds) throw new Error('Dialog has no bounds')
  await page.mouse.move(bounds.x + 30, bounds.y + 30)
  await page.mouse.down()
  await page.mouse.move(5, 5)
  await page.mouse.up()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.mouse.click(5, 5)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('recognizes horizontal swipes without treating vertical, cancelled, or multi-touch gestures as navigation', async ({
  page,
}) => {
  await openCollection(page)
  await swipe(page, -100)
  await expect(page.locator('.image-counter')).toContainText('Image 2 of 3')
  await swipe(page, 100)
  await expect(page.locator('.image-counter')).toContainText('Image 1 of 3')
  await swipe(page, -20)
  await swipe(page, -80, 160)
  await expect(page.locator('.image-counter')).toContainText('Image 1 of 3')

  const stage = page.locator('.viewer-stage')
  const pointer = { pointerType: 'touch', pointerId: 1, isPrimary: true, clientX: 220, clientY: 200 }
  await stage.dispatchEvent('pointerdown', pointer)
  await stage.dispatchEvent('pointercancel', pointer)
  await stage.dispatchEvent('pointerup', { ...pointer, clientX: 50 })
  await expect(page.locator('.image-counter')).toContainText('Image 1 of 3')
  await stage.dispatchEvent('pointerdown', pointer)
  await stage.dispatchEvent('pointerdown', { ...pointer, pointerId: 2, isPrimary: false })
  await stage.dispatchEvent('pointerup', { ...pointer, clientX: 50 })
  await expect(page.locator('.image-counter')).toContainText('Image 1 of 3')
  await expect(stage).toHaveCSS('touch-action', 'pan-y pinch-zoom')
})

test('supports real touch swipes, side-arrow taps, and native vertical scrolling', async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'CDP touch input is Chromium-only')
  await page.setViewportSize({ width: 390, height: 844 })
  const session = await context.newCDPSession(page)
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true })
  await openCollection(page)
  const bounds = await page.locator('.viewer-stage img').boundingBox()
  if (!bounds) throw new Error('The image has no bounds')
  const startX = bounds.x + bounds.width * 0.75
  const endX = bounds.x + bounds.width * 0.25
  const centerX = bounds.x + bounds.width / 2
  const y = bounds.y + bounds.height / 2
  expect(
    await page.evaluate(
      ({ x, y }) => Boolean(document.elementFromPoint(x, y)?.closest('.viewer-stage')),
      { x: startX, y },
    ),
  ).toBe(true)
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: startX, y }],
  })
  for (let step = 1; step <= 5; step += 1) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: startX + (endX - startX) * step / 5, y }],
    })
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect(page.locator('.image-counter')).toContainText('Image 2 of 3')

  const next = await page.getByRole('button', { name: 'Next image' }).boundingBox()
  if (!next) throw new Error('The next arrow has no bounds')
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: next.x + next.width / 2, y: next.y + next.height / 2 }],
  })
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect(page.locator('.image-counter')).toContainText('Image 3 of 3')

  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: centerX, y }],
  })
  for (const offset of [30, 60, 90, 120]) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: centerX, y: y - offset }],
    })
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect.poll(() => page.getByRole('dialog').evaluate((dialog) => dialog.scrollTop)).toBeGreaterThan(0)
  await expect(page.locator('.image-counter')).toContainText('Image 3 of 3')
  await session.detach()
})

test('copies the exact original prompt, including Markdown and line breaks', async ({
  page,
}) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.copiedPrompt = text
        },
      },
    })
  })
  await openCollection(page)
  await page.getByRole('button', { name: 'Copy', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-copied-prompt', collection.prompt)
  await expect(page.locator('.copy-feedback')).toBeEmpty()
})

test('copies successfully through the real browser clipboard API', async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Chromium supports automated clipboard permissions')
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await openCollection(page)
  await page.getByRole('button', { name: 'Copy', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(collection.prompt)
})

test('a pending copy keeps focus and remains part of the dialog keyboard cycle', async ({
  page,
}) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () =>
          new Promise<void>((resolve) => {
            document.addEventListener('finish-test-copy', () => resolve(), { once: true })
          }),
      },
    })
  })
  await openCollection(page)
  const copyButton = page.getByRole('button', { name: 'Copy', exact: true })
  await copyButton.focus()
  await copyButton.press('Enter')
  const copying = page.getByRole('button', { name: 'Copying...', exact: true })
  await expect(copying).toBeDisabled()
  await expect(copying).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Back to gallery' })).toBeFocused()
  await page.evaluate(() => document.dispatchEvent(new Event('finish-test-copy')))
  await expect(page.getByRole('button', { name: 'Copied', exact: true })).toBeVisible()
})

for (const mode of ['denied', 'unavailable'] as const) {
  test(`reports clipboard ${mode} instead of claiming success`, async ({ page }) => {
    await page.evaluate((failureMode) => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value:
          failureMode === 'unavailable'
            ? undefined
            : {
                writeText: async () => {
                  throw new DOMException('Clipboard permission denied', 'NotAllowedError')
                },
              },
      })
    }, mode)
    await openCollection(page)
    await page.getByRole('button', { name: 'Copy', exact: true }).click()
    await expect(page.locator('.copy-feedback')).toContainText('Unable to copy automatically.')
    await expect(page.locator('.copy-feedback')).toContainText('copy it manually')
    await expect(page.getByRole('button', { name: 'Copied', exact: true })).toHaveCount(0)
  })
}

test('keeps a long prompt readable and the close control available while scrolling', async ({
  page,
}) => {
  await openCollection(page)
  const finalLine = page.locator('.prompt-text li').last()
  await expect(finalLine).toContainText('Realistic illustration')
  await finalLine.scrollIntoViewIfNeeded()
  await expect(finalLine).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Back to gallery' })).toBeInViewport()
  expect(
    await page.locator('.viewer-body').evaluate((body) => body.scrollWidth <= body.clientWidth),
  ).toBe(true)
})

test('shows image loading feedback, then displays the complete original', async ({
  page,
}) => {
  const pending = Promise.withResolvers<Route>()
  await page.route('**/island-afternoon.png', (route) => pending.resolve(route))
  await openCollection(page)
  const route = await pending.promise
  await expect(page.locator('.viewer-stage').getByRole('status')).toHaveText('Loading artwork…')
  await route.continue()
  await expect(page.locator('.viewer-stage .artwork--loaded')).toBeVisible()
  await expect(page.locator('.viewer-stage').getByRole('status')).toHaveCount(0)
})

test('reports unavailable images without breaking navigation or closing', async ({
  page,
}) => {
  await page.route('**/island-afternoon.png', (route) => route.abort())
  await openCollection(page)
  await expect(page.locator('.viewer-stage').getByRole('status')).toContainText('Image unavailable')
  await page.getByRole('button', { name: 'Next image' }).click()
  await expect(page.locator('.viewer-stage img')).toHaveJSProperty('naturalWidth', 768)
  await expect(page.locator('.viewer-stage .artwork--loaded')).toBeVisible()
  await page.getByRole('button', { name: 'Back to gallery' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('a failed cover remains an accessible, working collection button', async ({
  page,
}) => {
  await page.route('**/island-afternoon-thumb.jpg', (route) => route.abort())
  await page.reload()
  const failedCard = page.getByRole('button', {
    name: 'Travel memories. Open collection',
    exact: true,
  })
  await failedCard.scrollIntoViewIfNeeded()
  await expect(failedCard.getByRole('status')).toContainText('Image unavailable')
  await openCollection(page)
  await expect(page.locator('.viewer-stage img')).toHaveJSProperty('naturalWidth', 768)
})

for (const [shape, width, height] of [
  ['portrait', 600, 900],
  ['landscape', 900, 600],
  ['square', 600, 600],
] as const) {
  test(`crops the ${shape} cover consistently and contains the complete viewer image`, async ({ page }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#e6dfd2"/><rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="none" stroke="#292723" stroke-width="4"/></svg>`
    await page.route('**/island-afternoon*', (route) =>
      route.fulfill({ contentType: 'image/svg+xml', body: svg }),
    )
    await page.reload()
    await openCollection(page)
    const cover = page
      .getByRole('button', {
        name: 'Travel memories. Open collection',
        exact: true,
      })
      .locator('.collection-cover')
    const coverImage = cover.locator('img')
    await expect(coverImage).toHaveJSProperty('naturalWidth', width)
    await expect(coverImage).toHaveJSProperty('naturalHeight', height)
    await expect(coverImage).toHaveCSS('object-fit', 'cover')
    const coverBounds = await cover.boundingBox()
    if (!coverBounds) throw new Error('The collection cover has no bounds')
    expect(coverBounds.height / coverBounds.width).toBeCloseTo(3 / 2, 3)

    const viewerImage = page.locator('.viewer-stage img')
    await expect(viewerImage).toHaveJSProperty('naturalWidth', width)
    await expect(viewerImage).toHaveJSProperty('naturalHeight', height)
    await expect(viewerImage).toHaveCSS('object-fit', 'contain')
    const fitsViewer = await viewerImage.evaluate((element) => {
      if (!(element instanceof HTMLImageElement)) {
        throw new Error('The viewer artwork is not an image')
      }
      const bounds = element.getBoundingClientRect()
      const scale = Math.min(
        bounds.width / element.naturalWidth,
        bounds.height / element.naturalHeight,
      )
      return (
        element.naturalWidth * scale <= bounds.width + 1 &&
        element.naturalHeight * scale <= bounds.height + 1
      )
    })
    expect(fitsViewer).toBe(true)
  })
}

test('the viewer fits narrow screens and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openCollection(page)
  for (const width of [320, 390, 767, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 })
    const dimensions = await page.getByRole('dialog').evaluate((dialog) => {
      const bounds = dialog.getBoundingClientRect()
      return {
        fitsWidth: bounds.width <= window.innerWidth,
        fitsHeight: bounds.height <= window.innerHeight,
        fitsContents: dialog.scrollWidth <= dialog.clientWidth,
      }
    })
    expect(dimensions).toEqual({ fitsWidth: true, fitsHeight: true, fitsContents: true })
    await expect(page.getByRole('button', { name: 'Back to gallery' })).toBeInViewport()
  }
  await expect(page.locator('.viewer-stage img')).toHaveCSS('transition-duration', '0s')
})

test('the production site works from a subdirectory without runtime errors', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.reload()
  expect(new URL(page.url()).pathname).toBe('/gallery/')
  await openCollection(page)
  for (let index = 0; index < collection.images.length; index += 1) {
    await expect(page.locator('.viewer-stage img')).toHaveJSProperty('naturalWidth', 768)
    if (index < collection.images.length - 1) {
      await page.getByRole('button', { name: 'Next image' }).click()
    }
  }
  await page.keyboard.press('Escape')
  expect(errors).toEqual([])
})
