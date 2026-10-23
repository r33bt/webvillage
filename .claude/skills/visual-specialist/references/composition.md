# Part C: page composition (the Stable set, generalised) and the plan step

The `plan` mode writes, per page type, the sections and the asset class each gets, into `docs/VISUAL-KIT.md`.

| Section | Pattern | Assets |
|---|---|---|
| Hero | split: eyebrow + display H1 + one line + 2 CTAs or search + a reassurance line / right: UI art (or person / place) | ui-art, ornament |
| Proof strip | "Trusted by …" greyscale logo row + rating pill, only if real; else data-source provenance | proof |
| Feature trio | 3 cards, each a UI fragment on top, title, one line | fragment |
| Stat band | contrast band, 3 big numerals from live data + label | proof / chart |
| Feature rows | alternating split cards (visual ↔ copy), one flipped to the contrast band | ui-art, photo |
| Segments / situations | 3 tall cards: photo (or spot drawing until photos land) + badge icon + arrow | photo, spot |
| How it works | numbered steps beside a diagram or tour card | diagram, motion |
| Trust / security | 3 cards with spot illustrations breaking the top edge | spot |
| CTA band | contrast band + cropped logomark + 2 reassurance checks | ornament |
| Resources | 2–3 designed covers | cover |

Mobile (375/390): stack visual-first; logos → 2-col grid; **keep every visual** (hiding art on mobile is a defect).
A visual that only reads at desktop size (tiny text inside an SVG) gets a compact mobile variant, not `display:none`
on its own.
