import fs from 'node:fs'
import path from 'node:path'
import Image from 'next/image'
import { CategoryArt } from './CategoryArt'

/**
 * CategoryHeroVisual: the category page hero visual (VISUAL-KIT.md, Part B "Category / country hubs").
 * When the queued photo exists at public/images/categories/<slug>.jpg it shows the photo, graded with the kit's
 * bottom gradient; until then it shows the category's ink-line spot on the timetable panel.
 */

function photoFor(slug: string): string | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  const rel = `/images/categories/${slug}.jpg`
  try {
    return fs.existsSync(path.join(process.cwd(), 'public', rel)) ? rel : null
  } catch {
    return null
  }
}

export function CategoryHeroVisual({ slug, name }: { slug: string; name: string }) {
  const photo = photoFor(slug)
  if (photo) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-gray-200">
        <Image src={photo} alt={`${name} training`} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-ink/70 to-transparent" />
      </div>
    )
  }
  return (
    <div
      data-visual="spot"
      role="img"
      aria-label={`Drawing for ${name} training`}
      className="ft-timetable flex w-full items-end overflow-hidden rounded-2xl border border-gray-200 bg-brand-blue-light/60 px-6 pt-6 sm:px-10"
    >
      <CategoryArt slug={slug} />
    </div>
  )
}
