# Campaign: "Seen In The Chair"

Photographic direction for every service and booking image on chidhama.com.

Companion file: [PROMPT.md](PROMPT.md) — the copy-paste generator prompt.

---

## 1. The idea

Every service image is one person, photographed the way a client would be
photographed **five minutes after leaving the chair** — still in the salon's
light, hair at its best, nothing else competing.

Not a lookbook. Not a mood board. A *result*.

This matters because these images sit inside a booking flow. The user is not
browsing for inspiration; they are deciding what they will look like on
Saturday. Every choice below serves one job: **make the outcome legible.**

---

## 2. Why the current set is being replaced

The existing images are Pinterest sourced (`i.pinimg.com`, `hadviser.com`,
`coilsandglory.com` in `src/app/salon/services.json`). Problems:

- Hotlinked to third-party CDNs — no rights, and they can vanish.
- 70 services, 70 unrelated visual worlds: phone snaps next to studio work,
  cool grey next to yellow tungsten, watermarks, crops through the crown.
- Backgrounds fight the page. The site ground is Wall `#f8f5ef` (warm cream);
  most of the sourced images are cool grey or busy interiors, so every card
  reads as a sticker pasted onto the page.

The first AI batch (`generated-images/`, `services-image-prompts.csv`) fixed
consistency but kept a **cool grey-white studio backdrop**. That is the one
thing to change: it is a neutral e-commerce look, and this salon is not neutral.
It is cream walls, timber slats, black fixtures, amber light.

---

## 3. The look

### Ground

Warm, seamless, paper-like. Sampled from the salon walls, not from a
photo-studio cyclorama.

| Ground | Hex | Use |
|---|---|---|
| Wall | `#f8f5ef` | Default. 80% of the set. |
| Linen | `#f1ece4` | Slightly deeper, for very light/blonde or grey hair. |
| Espresso | `#2b211a` | Rare. Locs, bridal, and the darkest services only — max 1 in 8. |

The backdrop must be **one continuous tone, softly falling off to marginally
darker at the frame edges** — never a hard vignette, never a gradient sweep,
never a visible seam or corner.

### Light

One large soft key, high and 35–45° off-axis, warm (≈4800K), with a cream bounce
opposite so the shadow side stays open. A subtle warm rim on the hair, just
enough to separate texture from ground — the amber LED of the salon, quoted, not
recreated.

Read the light off the reference: shadows soft-edged, no specular hotspots on
skin, no ring-light catchlight donuts, no hard studio strobe cut.

### Subject

Nigerian / West African women and men, ages 20–45, **broad range of skin tones,
face shapes and body types deliberately varied across the set.** Real skin: pores,
fine lines, a little shine on the forehead and nose, individual baby hairs and
flyaways at the hairline. Hands out of frame unless the service is nails.

Expression: composed and self-possessed. A closed or barely-there smile. Never a
laugh, never a pout, never a stock-photo grin.

### Wardrobe

Fine-gauge ribbed knit, crew or low turtleneck, one solid colour, no pattern, no
logo, no jewellery, no visible makeup beyond skin-even. Wardrobe exists to end
the image below the jaw and hand the whole frame to the hair.

Rotate through these, and only these, so the set reads as one campaign:

`Cream #EFE7DA` · `Bone #E3DAC9` · `Clay #B4735A` · `Olive #6E7257` ·
`Charcoal #3A3A38` · `Espresso #2B211A` · `Rust #9C5A32`

Never mustard `#fbb91c` on wardrobe. Mustard belongs to the Book button and
nothing else on the page may compete with it.

### Framing

Head and shoulders, **crown to mid-chest**, subject centred. Air above the hair —
never crop the top of a style, especially updos, Shuku and Bantu knots. Lens
character of an 85–105mm portrait lens on medium format: gentle compression,
shallow-but-honest depth of field with the **entire hairstyle in focus** and only
the shoulders falling off.

Angle is chosen by what the style needs to show, not by variety for its own sake:

| The style lives in… | Shoot |
|---|---|
| the parting / pattern on top | ¾ turn, chin level, slight downward camera |
| the silhouette | straight-on front |
| the back (cornrows, Shuku, threading) | full back of head, or ¾ rear |
| length and fall | front, shoulders squared, hair falling forward |

---

## 4. Non-portrait services

22 of the 70 services are not hairstyles. They still need to belong to the set:
same ground, same light, same warmth.

**Treatments, Hair Care & Washing (13)** — the *action*, close and warm: gloved
or bare hands working product into a scalp, steam off a towel, water sheeting
through a section, a wide-tooth comb mid-detangle. Client's face out of frame or
partially cropped. Never a bottle standing alone on a shelf.

**Take-down (8)** — the honest, satisfying middle of the work: fingers unravelling
a twist, half the head loosened and picked out, texture opening up. This is the
category clients dread; photograph it as *care*, not as chore.

**Manicure (9)** — hands only, on a warm timber slat or a cream linen fold, in the
same light. Nails sharp, cuticles clean, skin real. No props, no flowers, no
glitter backdrops.

**Bridal (1)** — the one place to spend: Espresso ground, deeper rim light, a
single strand of pearl or gold permitted.

---

## 5. Hard rules

Fail any of these and the image is rejected regardless of how good it looks.

1. **The hairstyle is the reference. Everything else is this direction.** The
   generator must copy pattern, parting geometry, section size, length and volume
   from the supplied photo, and copy nothing else from it.
2. Plastic skin, airbrushed pores, or waxy highlights — reject. This set lives or
   dies on skin texture.
3. No text, watermark, logo, signage, or UI in frame.
4. No extra hands, fingers, ears, or earrings. Count them.
5. Hairline must be believable: individual strands, edges that aren't painted on,
   a scalp that shows where a real parting would show it.
6. No pure `#000` and no pure `#fff` anywhere in the frame.
7. No visible salon interior. The interior gets its own photography; service
   cards stay on seamless ground.
8. Realistic length. If the reference shows shoulder-length twists, the output
   shows shoulder-length twists — not waist-length.

---

## 6. Output specs

| | |
|---|---|
| Master aspect | **4:5 portrait** |
| Master size | 2048 × 2560 minimum |
| Delivery | `.webp`, quality 82, plus a 400px and 800px variant |
| Colour | sRGB |
| Naming | `services/<nn>-<slug>.webp`, e.g. `services/07-micro-twists.webp` |

**Safe-zone warning.** The current card renders at `h-96` with `object-cover`
([services/page.js:46](../../../src/app/services/page.js#L46)) — roughly a 6:5
*landscape* box at desktop width. A 4:5 master is centre-cropped hard, top and
bottom. So: compose with the crown in the upper third, shoulders at the bottom
edge, and even margin left and right, so the centre 60% of the frame still
contains a complete, readable silhouette.

Better fix, worth doing alongside this campaign: change the card image box to
`aspect-[4/5]` and let it breathe.

---

## 7. Casting rotation

70 images of one face is a catalogue of one woman's year. Vary deliberately —
but vary *subject*, never *style*. Assign before generating, so the grid is
balanced rather than accidentally uniform:

- Roughly 60/40 women to men overall; men concentrated in Barrel Twist,
  Stylish Cornrows For Men, trims, and take-downs.
- Skin tones spread evenly across deep, medium-deep and medium.
- No two adjacent cards in the same category share a wardrobe colour.
- No two adjacent cards share a camera angle.

Track assignments in the campaign CSV so a regenerated image keeps its casting.

---

## 8. Workflow

1. Collect one clean reference per service — the truest photo of that style,
   from the salon's own work where it exists.
2. Paste the master prompt from [PROMPT.md](PROMPT.md), fill the four brackets,
   attach the reference.
3. Generate 4 variants. Judge against §5, not against the reference's mood.
4. Retouch nothing. If it needs retouching, regenerate.
5. Convert to `.webp`, drop in `public/services/`, and point `imageUrl` in
   `src/app/salon/services.json` at the local path — killing the last
   Pinterest hotlink.
