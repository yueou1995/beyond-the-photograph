import { useState } from 'react'
import type { ArtworkImage } from '../data/collections'

interface ArtworkProps {
  image: ArtworkImage
  thumbnail?: boolean
  eager?: boolean
}

export function Artwork({
  image,
  thumbnail = false,
  eager = false,
}: ArtworkProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const source = thumbnail ? (image.thumbnail ?? image.src) : image.src

  return (
    <span className={`artwork artwork--${status}`}>
      <img
        src={`${import.meta.env.BASE_URL}${source}`}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
      {status === 'loading' && (
        <span className="artwork-message" role="status">
          Loading artwork&hellip;
        </span>
      )}
      {status === 'error' && (
        <span className="artwork-message artwork-error" role="status">
          <span>Image unavailable</span>
          <span className="artwork-error-description">{image.alt}</span>
        </span>
      )}
    </span>
  )
}
