export interface ArtworkImage {
  readonly src: string
  readonly thumbnail?: string
  readonly alt: string
  readonly width: number
  readonly height: number
}

export interface ArtCollection {
  readonly id: string
  readonly title: string
  readonly images: readonly [ArtworkImage, ...ArtworkImage[]]
  readonly prompt: string
}

const collectionCatalog: readonly ArtCollection[] = [
  {
    id: 'travel-memories',
    title: 'Travel memories',
    images: [
      {
        src: 'art/travel-memories/island-afternoon.png',
        thumbnail: 'art/travel-memories/island-afternoon-thumb.jpg',
        alt: 'Travel poster with a palm-lined beach, a small sailboat, and a turquoise sea, above nine playful doodles of island memories.',
        width: 768,
        height: 1152,
      },
      {
        src: 'art/travel-memories/morning-cyclists.png',
        thumbnail: 'art/travel-memories/morning-cyclists-thumb.jpg',
        alt: 'Travel poster with cyclists riding past green rice fields at sunrise, above nine colored-pencil doodles of the scene on warm paper.',
        width: 768,
        height: 1152,
      },
      {
        src: 'art/travel-memories/alpine-lake.png',
        thumbnail: 'art/travel-memories/alpine-lake-thumb.jpg',
        alt: 'Travel poster with a wooden rowboat on a clear turquoise alpine lake beneath rocky mountains, above nine hand-drawn doodles of the landscape.',
        width: 768,
        height: 1152,
      },
    ],
    prompt: `**Objective**

Create one poster from the uploaded photo. Do not create a collage or combine photos.

**Format and Layout**

- Divide the poster into two equal sections: 50% top and 50% bottom.

**Top Half — Photography**

Preserve the original photo's subject, composition, pose, realistic textures, natural lighting, and overall color atmosphere. Apply only subtle, premium color grading to give it the feel of an art magazine editorial or exhibition photograph. Background extension is allowed to fit the layout, but do not stretch, distort, or alter the subject.

**Bottom Half — Illustration**

Extract the **9 most distinctive travel memories or visual elements** directly from the photo and reinterpret them as hand-drawn doodle icons. Choose from the main subject, objects, landscape, architecture, transportation, animals, plants, food, weather, actions, emotions, routes, or memorable scene details.

Distill the scene into charming, recognizable memories rather than recreating it literally or realistically.

**Style and Color**

- Naive, slightly imperfect doodles with thin black outlines.
- Colored-pencil or crayon-style fills with light grain.
- Visible warm off-white paper texture.

**Composition and Negative Space**

- Arrange the icons in a **loose 3×3 organic grid**.
- Use slight offsets, generous whitespace, and a relaxed scrapbook-like composition.

**Text**

- Optional casual handwritten English labels beneath icons.
- Keep each label to one or two words.

**Mood**

Relaxed, charming, airy, playful, and thoughtfully curated, like a travel journal, visual memory checklist, illustrated keepsake, or collectible poster. Leave plenty of breathing room.

**Avoid**

- Complex graphic-design layouts, large text blocks, or rigid digital grids.
- Realistic illustration, multiple people portraits, overcrowding, or excessive detail.`,
  },
  {
    id: 'quiet-miniatures',
    title: 'Quiet miniatures',
    images: [
      {
        src: 'art/quiet-miniatures/lonely-island.png',
        thumbnail: 'art/quiet-miniatures/lonely-island-thumb.jpg',
        alt: 'A poster pairing a photograph of a rugged green island in a blue sea with an isometric island diorama on a square ocean base, titled Lonely Island.',
        width: 768,
        height: 1152,
      },
      {
        src: 'art/quiet-miniatures/lone-tree.png',
        thumbnail: 'art/quiet-miniatures/lone-tree-thumb.jpg',
        alt: 'A poster pairing a photograph of a lone tree in a sunlit field with an isometric miniature of the tree on a grassy platform, titled The Lone Tree.',
        width: 768,
        height: 1152,
      },
      {
        src: 'art/quiet-miniatures/tibidabo.png',
        thumbnail: 'art/quiet-miniatures/tibidabo-thumb.jpg',
        alt: 'A poster pairing a photograph of the Tibidabo church at sunset with a detailed architectural miniature of the church and its terrace on warm paper.',
        width: 768,
        height: 960,
      },
    ],
    prompt: `**Objective**

Create one poster from the uploaded image. Do not create a collage or combine images.

**Format and Layout**

- Divide the poster into two equal sections: 50% top and 50% bottom.

**Top Half — Photography**

Preserve the original subject, composition, structure, pose, textures, lighting, and color atmosphere. Apply only subtle, high-end grading for an **art magazine editorial** or **museum exhibition photograph**. Background extension is allowed, but do not stretch, distort, or alter the subject.

**Bottom Half — Illustration**

Transform the recognizable subject, silhouette, posture, spatial relationships, and narrative essence into a **minimal isometric illustration** resembling an architectural model, scaled diorama, or paper sculpture. Keep it instantly recognizable through clean geometry, clear silhouettes, layered depth, and miniature-world relationships.

**Style and Color**

- Use only colors derived from the original photograph.
- Keep the palette muted and harmonized while preserving the original warm/cool relationships.
- Use related hues, subtle value shifts, precision ink lines, flat color planes, delicate shadows, and fine paper grain.

**Composition and Negative Space**

- Present a small isometric model on a base, platform, or paper cutout with abundant whitespace.
- Create scale through contrast, soft shadows, and optional subtle edge cropping.
- Use few supporting elements and no second focal point.

**Text**

- Use about **10% of the lower section** for a short English title and one or two minimal captions directly beneath the illustration.
- Use a restrained, thin, modern sans-serif typeface.

**Mood**

Calm, quiet, elegant, restrained, poetic, collectible, and museum-quality, like an architectural miniature or contemporary design-magazine feature.

**Avoid**

- Cartoon styling, highly saturated or arbitrary palettes, and unrelated signature colors.
- Plastic-looking 3D rendering, excessive realism, or overly complex scenes.
- E-commerce or template aesthetics, decorative clutter, or competing focal points.`,
  },
  {
    id: 'stories-beyond-the-frame',
    title: 'Stories beyond the frame',
    images: [
      {
        src: 'art/stories-beyond-the-frame/windmill-pause.png',
        thumbnail:
          'art/stories-beyond-the-frame/windmill-pause-thumb.jpg',
        alt: 'Mixed-media artwork combining Dutch windmills at sunset with an ink-drawn traveler and dog resting beside a backpack and sketchbook.',
        width: 768,
        height: 1024,
      },
      {
        src: 'art/stories-beyond-the-frame/venice-kindness.png',
        thumbnail:
          'art/stories-beyond-the-frame/venice-kindness-thumb.jpg',
        alt: 'Mixed-media artwork combining a Venice canal photograph with an ink-drawn girl and cat feeding gulls below a passing gondola.',
        width: 768,
        height: 1152,
      },
      {
        src: 'art/stories-beyond-the-frame/mountain-view.png',
        thumbnail:
          'art/stories-beyond-the-frame/mountain-view-thumb.jpg',
        alt: 'Mixed-media artwork combining snowy mountains and aerial gondolas with an ink-drawn traveler and corgi sharing a warm drink.',
        width: 768,
        height: 1024,
      },
    ],
    prompt: `**Objective**

Turn the uploaded **4:3 landscape photograph** into a **3:4 portrait composition** that blends real photography and hand-drawn cartoon illustration into one photo-specific story.

**Format and Layout**

- Keep the original photograph intact across the entire upper section.
- Extend the lower section onto white textured paper with subtle grain and generous negative space.

**Top Half — Photography**

Preserve the original composition, colors, lighting, perspective, and realistic texture. Do not crop, stretch, distort, or degrade the image.

**Bottom Half — Illustration**

Create a **unique story inspired entirely by this specific photo**, using its environment, season, mood, shapes, objects, and details.

Use one central narrative and one visual twist. Show who is doing what, what is happening now, one surprise or discovery, and a hint of what came before or may happen next. Make real objects and scenery interact with characters, express emotion through action rather than poses, and give every character a clear role.

**Style and Color**

- Original hand-drawn ink sketch aesthetic with thin, relaxed black lines.
- Simple facial features, expressive body language, and light crosshatching only where needed.
- Preserve the white paper and use minimal color accents.

**Composition and Negative Space**

- Connect both halves through actions, props, environmental extensions, depth, and interactions crossing the boundary.
- Use accurate gaze, gestures, overlap, object interaction, perspective, and a clear story hierarchy with generous negative space.

**Text**

Add one grammatical English phrase of **4-10 words**. Keep it gentle, evocative, slightly poetic, and nonliteral. Set it in a small handwritten style across 2-3 lines in the negative space.

**Mood**

Clean, airy, light, elegant, imaginative, warm, playful, and emotionally engaging.

**Avoid**

- Generic or repeated story templates, passive posing, or unrelated ideas.
- Sticker-collage aesthetics, thick outlines, messy coloring, or 3D cartoon styling.
- Excessive effects, over-decoration, titles, watermarks, or app/platform UI.`,
  },
  {
    id: 'drawn-from-memory',
    title: 'Drawn from memory',
    images: [
      {
        src: 'art/drawn-from-memory/island-sunset.png',
        thumbnail: 'art/drawn-from-memory/island-sunset-thumb.jpg',
        alt: 'Split-screen poster pairing a sunset photograph of a colorful cliffside island village with a warm crayon drawing of the same coastal scene.',
        width: 768,
        height: 1152,
      },
      {
        src: 'art/drawn-from-memory/mountain-light.png',
        thumbnail: 'art/drawn-from-memory/mountain-light-thumb.jpg',
        alt: 'Split-screen poster pairing a photograph of a misty green mountain valley at sunrise with a warm pastel drawing of the landscape.',
        width: 768,
        height: 1152,
      },
      {
        src: 'art/drawn-from-memory/canal-afternoon.png',
        thumbnail: 'art/drawn-from-memory/canal-afternoon-thumb.jpg',
        alt: 'Split-screen poster pairing a sunlit canal photograph with a warm crayon drawing of the water, boats, trees, and historic buildings.',
        width: 768,
        height: 1024,
      },
    ],
    prompt: `**Objective**

Create a **3:4 vertical split-screen poster** that contrasts photographic reality with hand-drawn memory.

**Format and Layout**

- Divide the composition **exactly 50/50** between the top and bottom halves.

**Top Half — Photography**

Faithfully preserve the original subject's identity, composition, pose, relationships, textures, lighting, and color atmosphere. Apply only subtle, sophisticated color grading to achieve the look of a high-end art magazine or gallery exhibition photograph. The background may be extended to fit the vertical format, but do not stretch, distort, or alter the main subjects.

**Bottom Half — Illustration**

Reimagine the key subjects, poses, relationships, environmental cues, and emotional atmosphere as a warm, healing **crayon/pastel illustration**. Distill the scene into recognizable shapes and gestures; simplify, summarize, and gently exaggerate where useful.

**Style and Color**

- Loose, natural hand-drawn lines with visible pastel or crayon grain.
- Soft **warm ivory paper** with subtle texture.
- Colors and marks should feel warm, gentle, and handmade.

**Composition and Negative Space**

- Let illustrated subjects occupy only about **30% of the lower half**.
- Leave generous breathing room around them.

**Text**

Optionally add **2-3 short English phrases** in a vintage typewriter font. Place them quietly in the negative space or near the subjects.

**Mood**

Warm, gentle, cute, comforting, clean, uncluttered, and playful without feeling childish. Create a poetic contrast between **reality and memory** that feels natural, emotional, and visually cohesive.

**Avoid**

- Mechanically reproducing every detail or cluttering the lower half.
- Decorative accents that overpower the composition. If used, limit them to tiny hearts, stars, or flowers.`,
  },
  {
    id: 'everyday-gestures',
    title: 'Everyday gestures',
    images: [
      {
        src: 'art/everyday-gestures/sunlit-cat.png',
        thumbnail: 'art/everyday-gestures/sunlit-cat-thumb.jpg',
        alt: 'Editorial split-screen poster pairing a photograph of an orange-and-white cat in a patch of sunlight with a loose marker drawing of the cat.',
        width: 768,
        height: 1024,
      },
      {
        src: 'art/everyday-gestures/field-walk.png',
        thumbnail: 'art/everyday-gestures/field-walk-thumb.jpg',
        alt: 'Editorial split-screen poster pairing a photograph of a person walking a black dog through tall grass with an expressive hand-drawn interpretation.',
        width: 768,
        height: 1024,
      },
      {
        src: 'art/everyday-gestures/autumn-bench.png',
        thumbnail: 'art/everyday-gestures/autumn-bench-thumb.jpg',
        alt: 'Editorial split-screen poster pairing a photograph of an older man on an autumn park bench with a sparse crayon drawing of the quiet scene.',
        width: 768,
        height: 1024,
      },
    ],
    prompt: `**Objective**

Create a premium editorial poster from the uploaded photo.

**Format and Layout**

- Use a **3:4 vertical format** divided equally: 50% top and 50% bottom.

**Top Half — Photography**

Preserve the original subjects, architecture, animals, landscape, spatial relationships, composition, photographic quality, lighting, and color atmosphere. Make no content changes beyond subtle color grading.

**Bottom Half — Illustration**

Reinterpret the most recognizable subjects, silhouettes, relationships, gestures, movement, and narrative connections as a **hand-drawn doodle lifestyle illustration**, **naïve illustration**, or **marker-sketch artwork**. Remove most background details and reorganize through cropping, repositioning, scale changes, and abstraction.

**Style and Color**

- Use relaxed, symbolic forms with shaky, broken, uneven, or imperfect lines.
- Use marker, crayon, or oil-pastel color with overlaps, imperfect edges, white gaps, and handmade inconsistencies.

**Composition and Negative Space**

- Use **intentional, generous negative space** and keep illustrated elements small.
- Place subjects off-center, near edges, partially cropped, suspended, or according to movement and balance. Let empty space create rhythm and pause.

**Text**

- Use **English text only**: a few words or one short phrase inspired by the subject, place, action, mood, or metaphor.
- Use light handwriting and integrate it with gestures, edges, silhouettes, directional lines, or negative space.
- Keep it quiet and secondary; asymmetric overlap or offsetting is allowed.

**Mood**

Relaxed, personal, expressive, quiet, and design-forward, with illustration and typography forming one editorial composition.

**Avoid**

- Literal scene copying, preserved background clutter, or every original object.
- Realistic proportions, precise perspective, detailed rendering, or polished digital perfection.
- Generic captions, dominant text, centered stacks, or template-like arrangements.`,
  },
  {
    id: 'small-personalities',
    title: 'Small personalities',
    images: [
      {
        src: 'art/small-personalities/duck-family.png',
        thumbnail: 'art/small-personalities/duck-family-thumb.jpg',
        alt: 'Split-screen poster pairing a photograph of a mother duck leading six ducklings with a playful minimalist line drawing of the duck family.',
        width: 768,
        height: 1152,
      },
      {
        src: 'art/small-personalities/pond-geese.png',
        thumbnail: 'art/small-personalities/pond-geese-thumb.jpg',
        alt: 'Split-screen poster pairing a photograph of white geese beside a pond with a clean, minimal line drawing of two geese.',
        width: 768,
        height: 1024,
      },
      {
        src: 'art/small-personalities/beach-piglet.png',
        thumbnail: 'art/small-personalities/beach-piglet-thumb.jpg',
        alt: 'Split-screen poster pairing a photograph of a piglet standing in shallow water with a charming minimalist doodle of the piglet.',
        width: 768,
        height: 1024,
      },
    ],
    prompt: `**Objective**

Create a premium editorial poster from the uploaded photo.

**Format and Layout**

- Use a 3:4 vertical format divided equally: 50% top and 50% bottom.

**Top Half — Photography**

Preserve the original photograph as faithfully as possible. Keep the main subjects, people, architecture, animals, landscapes, spatial relationships, and core composition intact. Maintain the authentic photographic quality, natural lighting, and original color atmosphere. Do not alter the content of the image beyond subtle, refined color grading if needed.

**Bottom Half — Illustration**

Extract only the subject's most recognizable silhouette, pose, gesture, expression, or character traits and transform them into an ultra-minimal, single-line doodle.

**Style and Color**

- Use a few clean, confident, flowing strokes, as if sketched in seconds.
- Keep the drawing loose, clean, charming, childlike, and design-forward.
- Use **1-3 flat colors**, primarily as line work, with at most one small accent color.
- Use warm cream, light beige, or soft buttery paper with subtle texture.

**Composition and Negative Space**

- Treat the lower illustration as a **4:3 composition**.
- Keep the subject small and near the center or slightly lower-center.
- Leave generous breathing room.
- Use only a few tiny doodles, such as stars, clouds, hearts, bones, dots, or short lines.

**Text**

Optionally add one small handwritten English label near the subject.

**Mood**

Playful, relaxed, witty, lightweight, and highly simplified. Each subject should feel like a small personality or pet icon.

**Avoid**

- Realistic hair texture, shading, volume, proportions, or fine features.
- Gradients, watercolor effects, crayon textures, or heavy fills.
- Detailed illustration, complex scenes, or oversized subjects.`,
  },
]

const homeCollectionOrder = [
  'quiet-miniatures',
  'drawn-from-memory',
  'everyday-gestures',
  'small-personalities',
  'travel-memories',
  'stories-beyond-the-frame',
] as const

export const collections: readonly ArtCollection[] = homeCollectionOrder.map(
  (id) => {
    const collection = collectionCatalog.find((item) => item.id === id)
    if (!collection) {
      throw new Error(`Missing collection metadata for "${id}".`)
    }
    return collection
  },
)
