import { useState } from 'react'
import { CollectionCard } from './components/CollectionCard'
import { CollectionViewer } from './components/CollectionViewer'
import { Icon } from './components/Icon'
import {
  collections as galleryCollections,
  type ArtCollection,
} from './data/collections'

interface AppProps {
  collections?: readonly ArtCollection[]
}

export default function App({ collections = galleryCollections }: AppProps) {
  const [selectedCollection, setSelectedCollection] =
    useState<ArtCollection | null>(null)

  return (
    <div className="gallery-page" id="top">
      <a className="skip-link" href="#collections">
        Skip to collections
      </a>

      <main className="page-width">
        <section className="introduction" aria-labelledby="gallery-title">
          <div>
            <h1 id="gallery-title">
              Beyond the
              <br />
              <em>Photograph.</em>
            </h1>
            <p className="introduction-text">
              Photographs unfolding into drawings and little stories.
            </p>
          </div>
        </section>

        <section
          className="collections-section"
          id="collections"
          aria-label="Collections"
          tabIndex={-1}
        >
          {collections.length > 0 ? (
            <ul className="collection-grid" aria-label="Art collections">
              {collections.map((collection, index) => (
                <li key={collection.id}>
                  <CollectionCard
                    collection={collection}
                    eager={index < 3}
                    onOpen={setSelectedCollection}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <Icon name="archive" />
              <h3>No collections yet.</h3>
              <p>A little room for something new. Check back soon.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer page-width">
        <p>Made by Yue</p>
      </footer>

      {selectedCollection && (
        <CollectionViewer
          key={selectedCollection.id}
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
        />
      )}
    </div>
  )
}
