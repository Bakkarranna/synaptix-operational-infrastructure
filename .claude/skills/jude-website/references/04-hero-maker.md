# 04 · Hero maker (image + video + upload path)

The simplest possible hero recipe. The operator paste-runs three Higgsfield prompts, downloads two files, drops them into `/public/`, wires one `<video>` tag. No R3F. No bundle budget gymnastics. No Three.js drift.

For the executionsquad.co-level R3F treatment, see `optional/3d-hero-scene.md`. The default is the maker.

## What the maker produces

Three prompts. Two files. One component.

| Prompt | Output | Goes here |
|---|---|---|
| Start image prompt | `hero-start.png` (1920x1080, photorealistic) | source frame for the video + poster fallback |
| End image prompt | `hero-end.png` (1920x1080, photorealistic) | second frame for the video |
| Video prompt | `hero.mp4` (4 to 8 sec, no audio, looping) | the hero |

The operator pastes the three prompts into Higgsfield, downloads the .mp4, exports the start image as a `.webp` poster, drops both into `/public/`. Done.

## Variables Jude fills in

Pull these from `business.md` before writing the prompts. **All five required.** Stop and ask if any are missing. No defaults.

- `[aesthetic]`: 3 to 5 keyword visual aesthetic. Examples (any one is valid, none is the default):
  - `Caravaggio dark, painterly, single-key chiaroscuro`
  - `clean Scandinavian minimal, soft daylight, matte`
  - `brutalist, hard light, high contrast, concrete textures`
  - `editorial soft, golden hour, shallow depth of field`
  - `90s-film analog, warm grain, slight halation`
  - `clinical, neutral lab, even fluorescent, sharp focus`
  - `cinematic anamorphic, deep blacks, volumetric haze`
- `[archetype]`: what the operator (or their subject) looks like at work. e.g. "solo founder at a laptop", "fitness coach mid-rep", "agency owner at whiteboard"
- `[setting]`: where the operator works. e.g. "Chilliwack home office at dawn", "minimalist lab with white walls", "warehouse loft with concrete floor"
- `[primary object]`: the operator's main work-tool object. e.g. "open terminal on a laptop", "kettlebell on rubber floor", "stack of contracts on a desk"
- `[accent color]`: brand accent hex from `business.md`

## Step 1 · Start image prompt (pick one framing)

Pick the framing that fits the offer (character / workspace / environment). The framing is structural; the aesthetic is brand.

### Option A · Character framing
Best when the operator IS the brand (solo founder, coach, consultant). Faces convert.

```
Portrait of a [archetype], [aesthetic], 35mm lens, photorealistic,
[accent color] subtle accent in the frame (vignette, reflection, or
highlight as the aesthetic allows), no logos, no text, no watermarks,
4k resolution, sharp focus on eyes
```

### Option B · Workspace framing
Best for craft-led brands (developer, writer, designer, maker).

```
Overhead shot of [primary object] on the surface that fits [setting],
[aesthetic], 35mm lens, photorealistic, [accent color] subtle accent
in the frame, no logos, no text, no watermarks, 4k resolution, ambient
depth of field
```

### Option C · Environment framing
Best when the SETTING is the proof (gym, studio, agency, retail, lab).

```
Wide environmental shot of [setting], [aesthetic], 35mm lens,
photorealistic, [accent color] subtle accent in the frame, no logos,
no text, no watermarks, 4k resolution
```

## Step 2 · End image prompt (mirrors the start, one shift)

The end frame is the same composition with ONE thing changed. That single change is what the video animates between. Keep the aesthetic, lens, accent, and subject identical.

Pick the shift that fits the framing:

| Framing | End-frame shift |
|---|---|
| Character (Option A) | Subtle head turn, OR eyes shift focus, OR breath rise of the chest |
| Workspace (Option B) | Light intensifies on the primary object, OR a hand enters frame, OR steam rises from a cup |
| Environment (Option C) | Light shifts (dawn to mid-morning), OR a single light comes on, OR the camera target depth changes |

### Pattern

```
[Same opening line as start image with one shift inserted],
[aesthetic], 35mm lens, photorealistic, [accent color] subtle accent
in the frame, no logos, no text, no watermarks, 4k resolution
```

### Example (Option A character framing, Caravaggio aesthetic)

Start frame:
```
Portrait of a solo founder at a laptop, Caravaggio dark, painterly,
single-key chiaroscuro, 35mm lens, photorealistic, #DB011C subtle
accent in the frame, no logos, no text, no watermarks, 4k resolution,
sharp focus on eyes
```

End frame (same, head turn shift):
```
Portrait of a solo founder at a laptop with a slight head turn toward
the light source, Caravaggio dark, painterly, single-key chiaroscuro,
35mm lens, photorealistic, #DB011C subtle accent in the frame, no
logos, no text, no watermarks, 4k resolution, sharp focus on eyes
```

## Step 3 · Video prompt (start + end + motion)

Higgsfield video-gen takes two source frames and a motion description. The video animates between them.

### Pattern

```
Source frames: [hero-start.png] to [hero-end.png]
Motion: [4 to 8 second] [motion verb] from start frame to end frame,
no camera shake, ambient breathing motion only, [aesthetic-matched
light shift], depth-of-field blur on background remains constant.
Loop seamlessly from end frame back to start frame.
```

### Example (matching the Caravaggio character above)

```
Source frames: hero-start.png to hero-end.png
Motion: 6-second slow head turn from start frame to end frame, no
camera shake, ambient breathing motion only, single-key light holds
direction, depth-of-field blur on background remains constant. Loop
seamlessly from end frame back to start frame.
```

## Universal prompt rules

- **Always include "no logos, no text, no watermarks".** Higgsfield sometimes hallucinates fake brand text.
- **Always specify the lens.** "35mm lens" reads as photographic. Without it the model defaults to amateur compositions.
- **Always specify the color grade direction.** "dark muted color grade with subtle [accent color] vignette" gives the operator's brand a thread through every image.
- **Always specify "no readable text" if text appears in frame.** Otherwise Higgsfield fills with gibberish.
- **Cap motion duration.** 4 to 8 seconds. Longer loops cost more credits and rarely improve.
- **Always loop seamlessly.** Add "Loop seamlessly from end frame back to start frame" to the video prompt.

## Step 4 · Upload path (the part that always trips people up)

After the operator generates and downloads on Higgsfield, the files MUST go to these exact paths. Wrong path means the hero shows nothing.

```
project-root/
└── public/
    ├── hero-poster.webp        # converted from hero-start.png, see below
    └── hero.mp4                # the Higgsfield video download
```

### Convert the start image to .webp poster

The poster is the image the browser shows BEFORE the video loads. Use `.webp` for the smallest payload. Convert with one of:

**macOS (built-in):**
```bash
cwebp -q 80 hero-start.png -o public/hero-poster.webp
```

If `cwebp` is missing: `brew install webp`

**Cross-platform via ffmpeg:**
```bash
ffmpeg -i hero-start.png -c:v libwebp -quality 80 public/hero-poster.webp
```

**Online (no install):** drop `hero-start.png` into squoosh.app, set encoder to WebP, quality 80, download, rename to `hero-poster.webp`.

Target file size: under 200KB. If over, drop quality to 70.

### Drop the .mp4

The Higgsfield download is already an .mp4. Just rename and move:

```bash
mv ~/Downloads/higgsfield-output-XXXX.mp4 public/hero.mp4
```

Target file size: under 3MB. If over, re-encode:

```bash
ffmpeg -i public/hero.mp4 -c:v libx264 -crf 26 -preset slow -an public/hero-compressed.mp4
mv public/hero-compressed.mp4 public/hero.mp4
```

`-an` strips audio (heroes never have sound). `-crf 26` is the size/quality knee.

### Verify both files exist

```bash
ls -lh public/hero.mp4 public/hero-poster.webp
```

Both files MUST be present. Without the poster, the hero is blank for ~500ms. Without the .mp4, the hero is a static image (acceptable fallback, but ship both).

## Step 5 · Wire the `<video>` tag (one component)

```tsx
// src/components/hero-video.tsx
export function HeroVideo() {
  return (
    <video
      src="/hero.mp4"
      poster="/hero-poster.webp"
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      className="h-full w-full object-cover"
      aria-hidden="true"
    />
  );
}
```

Five attributes are non-negotiable:

- `autoPlay` · plays without user gesture (works because of `muted`)
- `muted` · required for autoplay on Safari, Chrome, mobile
- `loop` · the loop seamlessly prompt from Step 3 only matters if this is set
- `playsInline` · stops iOS from forcing fullscreen
- `preload="metadata"` · grabs dimensions only, not the whole file. The poster handles the visible state.

`aria-hidden="true"` because the hero video is decorative. The H1 carries the meaning.

## Wire it into the page

```tsx
// src/app/page.tsx
import { HeroVideo } from "@/components/hero-video";

export default function Page() {
  return (
    <main>
      <section className="px-6 pt-24 pb-16">
        <h1 className="text-center text-[48px] md:text-[104px]">
          {/* Hero H1. Text IS the LCP. */}
        </h1>
      </section>

      <section className="relative w-full">
        <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
          <HeroVideo />
        </div>
      </section>

      {/* Rest of page */}
    </main>
  );
}
```

The wrapper's `aspectRatio: "16 / 9"` is non-negotiable. Without it, the page reflows when the video loads.

## What Jude hands the operator

Drop a single Markdown file at the project root or in `prompts/hero-prompts.md`:

```
# Hero prompts for [operator's brand name]

## Start image
[Option A, B, or C with operator variables filled in]

## End image
[Mirror of start with one shift]

## Video
[Source frames + motion + loop instruction]

## How to render

1. Open Higgsfield image-gen
2. Paste the START image prompt, pick "photorealistic", generate 4 variants
3. Pick the strongest, download as `hero-start.png`
4. Paste the END image prompt, generate 4 variants
5. Pick the variant that mirrors the start composition, download as `hero-end.png`
6. Switch to Higgsfield video-gen
7. Upload BOTH frames as source. Set `hero-start.png` first, `hero-end.png` second
8. Paste the video prompt, set duration (4 to 8 sec), generate
9. Download the .mp4

## Where the files go

10. Convert the start image to webp poster:
    `cwebp -q 80 hero-start.png -o public/hero-poster.webp`
11. Move the video:
    `mv hero.mp4 public/hero.mp4`
12. Verify both files exist:
    `ls -lh public/hero.mp4 public/hero-poster.webp`

The site auto-loads from those paths. No further wiring.
```

## Mobile and reduced-motion

The `<video>` autoplays on every modern device because of `muted` + `playsInline`. There is no separate mobile path.

For users with `prefers-reduced-motion: reduce`, the global CSS rule from `optional/section-reveals.md` already disables transitions. To also pause the video, add this:

```css
@media (prefers-reduced-motion: reduce) {
  video {
    animation-play-state: paused;
  }
}
```

Or skip motion entirely: replace `<HeroVideo />` with a static `<Image src="/hero-poster.webp" ... />` for those users. The poster carries the whole visual.

## Style consistency (every Higgsfield asset on the site)

Hold these constant across every render:

1. **Same lens.** Pick once (e.g. 35mm), use everywhere.
2. **Same `[aesthetic]` keywords.** Whatever `business.md` specifies. Caravaggio dark / Scandinavian minimal / brutalist / editorial / 90s analog / clinical / cinematic, paste the SAME keywords into every prompt.
3. **Same accent color.** Operator's brand hex appears as a subtle accent in every shot.
4. **Same negative-space rule.** If the aesthetic is dark, every shot is dark. If bright, every shot is bright.
5. **Same color grade direction.** Pull from the aesthetic. Do not vary.

## Common mistakes

**The hero loop drifts off-loop.** Higgsfield clips longer than 8 seconds drift into hallucination. Cut to 4 to 6 seconds and add "loop seamlessly from end frame back to start frame".

**The video shows a black flash on loop.** The end frame and start frame do not match. Re-render the end frame closer to the start composition. The end image is supposed to mirror the start with ONE shift, not be a different scene.

**Faces look uncanny.** Caravaggio half-lit composition usually fixes this. If still uncanny, try "painterly oil-paint texture" weight up or shift to Option B (workspace, no face).

**The hero is blank for half a second on first load.** The poster path is wrong, or the .webp file is missing. Check `public/hero-poster.webp` exists.

**The video does not play on iOS.** Forgot `muted` or `playsInline` on the `<video>` tag. Both are required.

**The video is huge (over 5MB).** Re-encode with the ffmpeg command in Step 4. Target under 3MB.

**Brand color does not appear.** Add `[accent color] subtle vignette in corners` to the prompt. If still missing, try `[accent color] reflection on glass surfaces` or `[accent color] pixel highlights`.

## Re-render budget

Expect to re-render 30 to 50 percent of the assets to get keepers. The hero image is the single most important shot on the site. Spend more renders to get it right. Budget Higgsfield credits accordingly.

## What the maker does NOT do

- **VSL talking-head footage.** The operator films themselves. See `03-vsl-script.md`.
- **VSL B-roll.** The operator captures real screen recordings, real desktop scrolls, real workflow. No AI-generated VSL content.
- **Logos or wordmarks.** Use a vector tool (Figma, Affinity, Illustrator). AI tools hallucinate logos.
- **Avatars or AI presenters.** Faces in the VSL must be human.
- **Voiceover.** The operator's voice. AI voiceover reads as fake.
- **The R3F 3D scene.** That is `optional/3d-hero-scene.md`. The maker is the default; R3F is the upgrade.
