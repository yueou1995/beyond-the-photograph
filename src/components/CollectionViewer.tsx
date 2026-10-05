import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import Markdown from 'react-markdown'
import type { ArtCollection } from '../data/collections'
import { Artwork } from './Artwork'
import { Icon } from './Icon'

interface CollectionViewerProps {
  collection: ArtCollection
  onClose: () => void
}

interface SwipeStart {
  pointerId: number
  x: number
  y: number
}

function isBackdrop(
  event: MouseEvent<HTMLDialogElement> | PointerEvent<HTMLDialogElement>,
) {
  if (event.target !== event.currentTarget) return false
  const bounds = event.currentTarget.getBoundingClientRect()
  return (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
}

export function CollectionViewer({
  collection,
  onClose,
}: CollectionViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const swipeStart = useRef<SwipeStart | null>(null)
  const backdropPress = useRef(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [copyStatus, setCopyStatus] = useState<
    'idle' | 'copying' | 'copied' | 'error'
  >('idle')
  const image = collection.images[imageIndex]
  const imageCount = collection.images.length
  const viewerStyle: CSSProperties & {
    '--max-image-aspect': number
    '--image-aspect': number
  } = {
    '--max-image-aspect': Math.max(
      ...collection.images.map(({ width, height }) => width / height),
    ),
    '--image-aspect': image.width / image.height,
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (returnFocusRef.current === null) {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
    }

    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const body = document.body
    const previousStyles = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    }

    Object.assign(body.style, {
      position: 'fixed',
      top: `-${scrollY}px`,
      width: '100%',
      overflow: 'hidden',
    })
    if (!dialog.open) dialog.showModal()
    closeButtonRef.current?.focus({ preventScroll: true })

    return () => {
      dialog.close()
      Object.assign(body.style, previousStyles)
      window.scrollTo(scrollX, scrollY)
      returnFocusRef.current?.focus({ preventScroll: true })
    }
  }, [])

  function navigate(direction: -1 | 1) {
    setImageIndex((current) =>
      Math.max(0, Math.min(imageCount - 1, current + direction)),
    )
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === 'Tab') {
      const controls = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>(
          'button:not(:disabled)',
        ),
      )
      const current = controls.findIndex(
        (control) => control === document.activeElement,
      )
      const next =
        current === -1
          ? event.shiftKey
            ? controls.length - 1
            : 0
          : (current + (event.shiftKey ? -1 : 1) + controls.length) %
            controls.length
      event.preventDefault()
      controls[next]?.focus()
      return
    }
    if (event.shiftKey) return
    if (
      event.target instanceof HTMLElement &&
      event.target.closest('input, textarea, select, [contenteditable="true"]')
    ) {
      return
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      navigate(event.key === 'ArrowLeft' ? -1 : 1)
    }
  }

  function handleSwipeStart(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    if (!event.isPrimary) {
      swipeStart.current = null
      return
    }
    swipeStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    }
  }

  function handleSwipeEnd(event: PointerEvent<HTMLDivElement>) {
    const start = swipeStart.current
    swipeStart.current = null
    if (!start || start.pointerId !== event.pointerId) return

    const horizontal = event.clientX - start.x
    const vertical = event.clientY - start.y
    if (
      Math.abs(horizontal) >= 48 &&
      Math.abs(horizontal) > Math.abs(vertical) * 1.5
    ) {
      navigate(horizontal < 0 ? 1 : -1)
    }
  }

  async function copyPrompt() {
    if (copyStatus === 'copying') return
    setCopyStatus('copying')
    if (!navigator.clipboard?.writeText) {
      setCopyStatus('error')
      return
    }
    try {
      await navigator.clipboard.writeText(collection.prompt)
      setCopyStatus('copied')
    } catch (error) {
      console.error('Could not copy the collection prompt.', error)
      setCopyStatus('error')
    }
  }

  return (
    <dialog
      className="collection-viewer"
      ref={dialogRef}
      style={viewerStyle}
      aria-label={collection.title}
      onKeyDown={handleKeyDown}
      onClose={(event) => {
        // A queued close event from StrictMode cleanup must not close a reopened dialog.
        if (!event.currentTarget.open) onClose()
      }}
      onPointerDown={(event) => {
        backdropPress.current = isBackdrop(event)
      }}
      onPointerCancel={() => {
        backdropPress.current = false
      }}
      onClick={(event) => {
        if (backdropPress.current && isBackdrop(event)) {
          dialogRef.current?.close()
        }
        backdropPress.current = false
      }}
    >
      <button
        className="close-button"
        ref={closeButtonRef}
        type="button"
        aria-label="Back to gallery"
        onClick={() => dialogRef.current?.close()}
      >
        <Icon name="close" />
      </button>

      <figure
        className="viewer-figure"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        <div
          className="viewer-stage"
          onPointerDown={handleSwipeStart}
          onPointerUp={handleSwipeEnd}
          onPointerCancel={() => {
            swipeStart.current = null
          }}
        >
          <Artwork key={image.src} image={image} eager />
        </div>
        <div
          className="viewer-navigation"
          role="group"
          aria-label="Image navigation"
        >
          <button
            className="icon-button"
            type="button"
            aria-label="Previous image"
            aria-disabled={imageIndex === 0}
            onClick={() => navigate(-1)}
          >
            <Icon name="arrow" className="arrow-left" />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Next image"
            aria-disabled={imageIndex === imageCount - 1}
            onClick={() => navigate(1)}
          >
            <Icon name="arrow" />
          </button>
        </div>
        <figcaption className="image-counter sr-only" aria-live="polite" aria-atomic="true">
          Image {imageIndex + 1} of {imageCount}
        </figcaption>
      </figure>

      <section className="prompt-section" aria-labelledby="prompt-title">
        <div className="viewer-body">
          <div className="prompt-heading">
            <h2 id="prompt-title">Prompt</h2>
            <button
              className="copy-button"
              type="button"
              aria-disabled={copyStatus === 'copying'}
              onClick={copyPrompt}
            >
              <Icon name={copyStatus === 'copied' ? 'check' : 'copy'} />
              <span>
                {copyStatus === 'copied'
                  ? 'Copied'
                  : copyStatus === 'copying'
                    ? 'Copying...'
                    : 'Copy'}
              </span>
            </button>
          </div>
          <p
            className={`copy-feedback${copyStatus === 'error' ? ' copy-feedback--error' : ''}`}
            role="status"
          >
            {copyStatus === 'error' &&
              'Unable to copy automatically. You can select the prompt below and copy it manually.'}
          </p>
          <div className="prompt-text">
            <Markdown
              allowedElements={[
                'p',
                'strong',
                'em',
                'ul',
                'ol',
                'li',
                'br',
                'code',
                'pre',
                'blockquote',
              ]}
              unwrapDisallowed
              skipHtml
            >
              {collection.prompt}
            </Markdown>
          </div>
        </div>
      </section>
    </dialog>
  )
}
