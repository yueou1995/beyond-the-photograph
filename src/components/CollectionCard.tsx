import type { ArtCollection } from '../data/collections'
import { Artwork } from './Artwork'

interface CollectionCardProps {
  collection: ArtCollection
  eager: boolean
  onOpen: (collection: ArtCollection) => void
}

export function CollectionCard({
  collection,
  eager,
  onOpen,
}: CollectionCardProps) {
  const cover = collection.images[0]

  return (
    <button
      type="button"
      className="collection-card"
      aria-haspopup="dialog"
      aria-label={`${collection.title}. Open collection`}
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true })
        onOpen(collection)
      }}
    >
      <span className="collection-cover">
        <Artwork image={cover} thumbnail eager={eager} />
      </span>
    </button>
  )
}
