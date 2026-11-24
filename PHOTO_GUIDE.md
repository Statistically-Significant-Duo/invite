# Artwork and photography direction

For **Pabitra & Asmita**. The invitation uses a consistent Pattachitra-inspired illustration style with **maroon `#6f1d1d`, red `#8c2d2d`, ivory `#fbf1dc`, gold `#c69232`, and warm rose `#c96b5b`**. Use the same palette, line weight, paper texture, and decorative density across new images.

## Current artwork

| Placement | Responsive files | Source artwork retained in `assets/` |
| --- | --- | --- |
| Hero | `hero-960.webp`, `hero-1376.webp` | `pattachitra_wedding_hero.jpg` |
| Monogram | `monogram-128.webp`, `monogram-256.webp` | `pa-monogram.png` |
| Couple | `couple-480.webp`, `couple-800.webp` | `couple-illustration.png` |
| Bride | `bride-320.webp`, `bride-640.webp` | `bride-illustration.png` |
| Groom | `groom-320.webp`, `groom-640.webp` | `groom-illustration.png` |
| Blessings card and gallery | `blessings-640.webp`, `blessings-1000.webp` | `Traditional Pattachitra Wedding Ring Ceremony.png` |
| Haldi card and gallery | `haldi-640.webp`, `haldi-1000.webp` | `Pattachitra Haldi Ceremony Celebration-2.png` |
| Wedding card and gallery | `wedding-640.webp`, `wedding-1200.webp` | `Odia Pattachitra Wedding Ceremony.png` |

The hero source is 1376 × 768. Its responsive versions retain that native resolution rather than enlarging it. Ceremony illustrations are landscape, while the portraits are vertical. No new images need to be generated to use this website.

## Six prompts for matching artwork

### 1. A spacious wedding hero

> An original Pattachitra-inspired illustration celebrating an Odia and Bengali wedding, with a graceful mandap, delicate marigold garlands, lotus motifs, and symmetrical peacocks at the outer edges. Hand-painted fine dark outlines, warm ivory paper, deep maroon, restrained vermilion, and antique gold. Keep the central third calm and visually simple for large website lettering. Wide landscape composition, 16:9, balanced and festive, flat painted perspective, intricate edge details without crowding the centre. No text, names, lettering, logos, or watermarks. A decorative imagined celebration, not a record of a confirmed venue.

### 2. The couple portrait

> Using the attached approved couple artwork as the reference, create a matching Pattachitra-inspired portrait of Pabitra and Asmita together. Preserve their recognisable faces, skin tones, garments, and jewellery from the reference. Gentle expressions, natural hands, elegant traditional attire in maroon and ivory, fine dark outlines, antique-gold ornaments, subtly textured ivory background. Show both heads fully with generous breathing room above them and enough space around the figures for an arched crop. Portrait 2:3. No lettering, logos, watermarks, or added ceremonial symbols.

### 3. Matching individual portraits

> Create one individual portrait matching the attached approved couple illustration, depicting [Pabitra / Asmita] alone in the same Pattachitra-inspired style. Preserve the referenced person's face, skin tone, hairstyle, clothing, and cultural details. Fine painted outlines, maroon and ivory attire, restrained antique gold, warm ivory paper, graceful relaxed pose. Full head and complete hands visible, centred vertical composition with ample empty margins for an arched frame. Portrait 2:3. No text, names, logos, lettering, or watermarks. Use the same framing and lighting treatment for both portrait variants.

### 4. Blessings and beginnings

> A Pattachitra-inspired illustration of an intimate family blessing and ring ceremony, with a bride and groom seated facing each other, elders offering warm blessings, and restrained floral details. Match the attached approved wedding artwork's faces, attire, fine dark outlines, paper texture, and maroon, ivory, antique-gold palette. Balanced landscape composition, 3:2, keep faces and hands comfortably inside the central safe area, leave space around the scene for responsive cropping. No invented readable ritual text, no lettering, logos, or watermarks. An illustrative scene inspired by tradition.

### 5. Golden Haldi joy

> A joyful Pattachitra-inspired Haldi scene in the same painted style as the attached wedding artwork. Preserve the referenced couple's features and use natural turmeric yellow and marigolds alongside maroon borders, warm ivory, and antique gold. Include a small brass bowl, family warmth, and gentle smiles, with clear fine outlines and a consistent flat painted perspective. Landscape 3:2, all important faces and gestures well inside the frame, uncluttered central composition. No text, invented religious symbols, lettering, logos, or watermarks. An illustrative celebration, not documentary photography.

### 6. The wedding promise

> An original Pattachitra-inspired wedding illustration depicting the referenced bride and groom together beneath a simply decorated mandap, with warm family presence and a sacred fire as shown in the approved reference. Preserve the approved attire and cultural details without inventing extra ritual objects. Fine dark painted outlines, subtly textured ivory paper, deep maroon, restrained red, antique gold, lotus and floral borders matching the reference artwork. Landscape 3:2, keep faces, hands, and the main ritual clearly visible within the central safe area. No text, names, lettering, logos, or watermarks. An imagined illustration celebrating the couple's traditions.

## Replacing or adding images

1. Keep your original PNG/JPEG artwork. Generate smaller WebP versions at the widths in the table, using approximately 80–85% quality, and compare painted lines and faces at normal viewing size.
2. Replace every responsive variant used by the image's `srcset`, not just its `src`. Update `width` and `height` in `index.html` if the image proportions change.
3. For gallery changes, update the enclosing button's `data-lightbox`, `data-caption`, and accessible label as well as the image's `src`, `srcset`, `sizes`, and `alt` description.
4. Check the hero on a narrow phone and a wide screen. Keep faces clear of text and preserve the top of each portrait's head. Use `object-position` to fine-tune the crop.
5. For authentic memories, use your actual photographs once available. Request one wide couple/venue shot with quiet space for text, vertical portraits, and close-ups of hands, textiles, flowers, and brass details. Choose a consistent warm-neutral edit and keep captions accurate.

To regenerate variants with the optional optimisation script, install Sharp in a separate tools folder and run:

```powershell
node scripts/optimize-images.mjs --sharp-module C:/absolute/path/to/node_modules/sharp
```

The site itself has no image-encoding dependency. Original stock garden, bouquet, and table photographs are retained as unused alternatives; their attribution remains in `assets/CREDITS.md`.
