# The generator prompt

One prompt. Attach a reference photo of the hairstyle, fill the four brackets,
generate. Direction and rejection criteria live in [DIRECTION.md](DIRECTION.md).

Works as-is with Nano Banana / Gemini image, GPT Image, Midjourney (v7 with
`--oref`), and Flux Kontext. Model-specific notes at the bottom.

---

## Master prompt — hairstyle portraits

> **REFERENCE USE — read first.** The attached photograph is the **hairstyle
> reference only**. Reproduce its hairstyle exactly: the braid or twist pattern,
> the parting geometry and part lines, the section size and count, the direction
> of every row, the length, the volume, the density, and how it falls or is
> gathered. Match it as a hairstylist would match it — this is the style a client
> is booking, so it must be recognisably the same style.
>
> Take **nothing else** from the reference. Ignore its model, face, skin tone,
> body, wardrobe, jewellery, background, lighting, colour grade, camera angle,
> crop, and image quality. If the reference is low-resolution, blurry,
> watermarked, or a phone snapshot, none of that carries over. Build a new
> photograph around the style using the direction below.
>
> **THE PHOTOGRAPH.** A photorealistic editorial beauty portrait of a
> [WOMAN / MAN] of West African (Nigerian) heritage, aged 20–45, with
> [DEEP / MEDIUM-DEEP / MEDIUM] skin. Head-and-shoulders, crown to mid-chest,
> subject centred, generous air above the hair so no part of the hairstyle is
> cropped. Camera angle: [ANGLE]. Composed, self-possessed expression, lips
> closed or the faintest smile — never a broad smile, never a pout. Eyes
> [to camera / off-camera, just past the lens].
>
> **LIGHT.** One large soft key from high and 40° off-axis, warm daylight around
> 4800K, with a cream bounce card opposite keeping the shadow side open and
> detailed. A subtle warm rim grazing the hair to separate its texture from the
> background. Soft-edged shadows. No hard strobe, no ring-light catchlights, no
> specular hotspots on the skin, no coloured gels.
>
> **BACKGROUND.** A seamless, perfectly even [warm cream #f8f5ef / warm linen
> #f1ece4 / deep espresso #2b211a] backdrop, falling off only marginally toward
> the frame edges. No vignette, no gradient sweep, no visible seam, no texture,
> no props, no furniture, no salon interior, no text or logo of any kind.
>
> **WARDROBE.** A plain fine-gauge ribbed knit top, crew neck or low turtleneck,
> in solid [WARDROBE COLOUR]. No pattern, no logo, no jewellery, no visible
> makeup beyond even skin. Hands out of frame.
>
> **REALISM — the priority of this image.** Real photographic skin: visible
> pores, natural fine lines, subtle sheen on the forehead, nose and cheekbones,
> faint natural skin-tone variation. Individual baby hairs and a few loose
> flyaways at the hairline. A believable hairline and scalp where the parting
> exposes it — real strand separation, never a painted-on edge. Natural fibre
> texture in the knit. Do not smooth, airbrush, beautify, or wax the skin. Do not
> render plastic or CGI-looking skin. This must look like a frame from a real
> camera, not a render or an illustration.
>
> **CAMERA.** Medium-format digital, 85–105mm portrait lens, f/4. The entire
> hairstyle in sharp focus edge to edge; only the shoulders and the top of the
> chest fall gently out of focus. Natural film-like colour, warm neutral grade,
> no heavy contrast curve, no HDR, no beauty filter. 4:5 portrait aspect ratio,
> high resolution.
>
> **DO NOT INCLUDE:** text, watermarks, logos, signage, borders, collages,
> multiple frames, mirrors, extra hands or fingers, extra or malformed ears,
> earrings, hats, headbands, scarves, sunglasses, visible salon interior, pure
> black `#000000`, pure white `#ffffff`, saturated yellow, blurred or distorted
> hair strands, duplicated braid rows, hair longer than the reference.

### The four brackets

| Bracket | Options |
|---|---|
| `[WOMAN / MAN]` | Per the casting rotation in DIRECTION.md §7 |
| `[SKIN]` | `deep` · `medium-deep` · `medium` — spread evenly across the set |
| `[ANGLE]` | see table below |
| `[WARDROBE COLOUR]` | `cream #EFE7DA` · `bone #E3DAC9` · `clay #B4735A` · `olive #6E7257` · `charcoal #3A3A38` · `espresso #2B211A` · `rust #9C5A32` |

### Choosing the angle

Pick the angle that shows where the style actually lives — not for variety.

| Style lives in | Use this angle |
|---|---|
| Pattern / parting on top | `a three-quarter turn, chin level, camera slightly above eye line so the parting pattern across the crown reads clearly` |
| Silhouette and volume | `straight-on frontal, shoulders square to camera, at eye level` |
| The back — cornrows, Shuku, threading, updos | `the full back of the head, subject facing away from camera, at eye level` |
| Length and fall | `frontal, shoulders square, hair falling forward over both shoulders, at eye level` |
| Sides — tapers, men's cuts | `full profile, at eye level` |

---

## Variant — treatments, washing, take-downs

Replace the **THE PHOTOGRAPH** block with:

> **THE PHOTOGRAPH.** A photorealistic editorial close-up of [ACTION], on the
> hair of a person of West African heritage. The subject's face is out of frame
> or cropped at the cheek — the hands and the hair are the subject. Warm, calm,
> unhurried, documentary in feel but beautifully lit. Real wet or product-laden
> hair with believable weight and sheen, real skin on the hands with visible
> knuckle texture and clean short nails.

Where `[ACTION]` is, for example: `two hands working a cream conditioner into a
sectioned scalp` · `water sheeting through a lifted section under a gentle
stream` · `a wide-tooth comb halfway through detangling a damp section` ·
`fingers unravelling a two-strand twist, the strand opening into loose natural
curl` · `steam rising from a warm towel wrapped around the head`.

Everything else — light, background, realism, camera, do-not-include — stays.

## Variant — manicure

Replace **THE PHOTOGRAPH** and **WARDROBE** with:

> **THE PHOTOGRAPH.** A photorealistic close-up of a pair of hands of a person of
> West African heritage with [SKIN] skin, resting relaxed on [a warm timber slat
> surface / a fold of cream linen], nails freshly done as shown in the reference.
> Fingers naturally posed and correctly proportioned — exactly five per hand.
> Real skin: knuckle creases, fine lines, natural nail bed, clean cuticles. No
> face, no props, no flowers, no glitter. Shallow depth of field with the nails
> in sharp focus.

Keep the same light, realism, camera and do-not-include blocks. The reference
governs nail shape, length and colour only.

---

## Model-specific notes

**Nano Banana / Gemini** — paste as-is with the reference attached; it respects
the "reference use" framing well. If it drifts toward the reference's
background, add: `The background must be replaced entirely; do not retain any
part of the reference photograph's setting.`

**GPT Image** — as-is. If skin comes back waxy, append: `Unretouched. Raw
photograph straight from camera, no beauty retouching applied.`

**Midjourney v7** — use the prompt as the text body, attach the reference with
`--oref <url> --ow 60` (omni-reference at moderate weight — high weight drags the
model's face across too), plus `--ar 4:5 --style raw --v 7`. Drop the DO NOT
INCLUDE block into `--no text, watermark, logo, jewelry, extra fingers, deformed
ears, blurry hair`.

**Flux Kontext** — strongest at this job. Feed the reference as the context
image and lead with: `Keep the hairstyle exactly as shown. Replace the person,
wardrobe, background and lighting with the following:` then the prompt body.

---

## Before you accept an image

Run §5 of DIRECTION.md. Fastest four checks, in order:

1. Zoom the hairline. Painted-on edge → regenerate.
2. Zoom the skin. No pores → regenerate.
3. Count fingers and ears.
4. Put it next to the reference. Is a client booking *this* style? If the section
   size or the pattern drifted, regenerate — the style is the product.
