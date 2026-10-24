# Photos, device-in-context, directory item imagery (B1, B5, B10)

**B1 · Photography.** Real, licensed, graded to the kit (`kit.md` A8).
- *Place* → Wikimedia Commons (+ Flickr with a key): CC0 / PD / CC BY / CC BY-SA only, never NC or ND;
  place-authentic, name-collision guard; `templates/image-kit/scripts/image-harvest.py`; spec
  `templates/image-kit/docs/IMAGE-SYSTEM-SPEC.md`.
- *People / lifestyle* → Pexels first (free commercial use, credit anyway), Pixabay for objects and textures.
  **Market-true** (Malaysian sites show Malaysians in Malaysian settings). **Situation, not handshake**: the reader's
  real moment; never office-handshake, pointing-at-laptop or team-meeting stock.
- *Segment / audience cards* → tall portrait photos with the kit's bottom gradient + title + badge icon + arrow.
- Downloaded, graded, committed (no hotlinking; existing hotlinked URLs move to local files when touched).
  Credit row per photo.
- **Cloud sessions:** no `PEXELS_API_KEY` → queue the harvest to `desktop-queue/open/` (queries, sizes, file names,
  credits file; never the key) and ship the kit's spot drawings in the photo slots meanwhile. Example task:
  `desktop-queue/open/2026-10-23-212-moneymy-pexels-situation-photos.md`.

**B5 · Device-in-context.** A real photo of hands holding a phone or using a laptop, with the real product UI
composited onto the screen (perspective-correct). Licensed device photos (Pexels) or our own; credit both.

**B10 · Directory item imagery.** Each listing's own photo or logo (owner-supplied, its OG image where terms allow,
Commons for public bodies). No image → the designed fallback (kit-graded initials / monogram tile), never stock
passed off as the business. Advanced per-site systems (penang `data/photography.ts`, jandabaik
`image-manifest.json`) are audit-only: never overwritten.
