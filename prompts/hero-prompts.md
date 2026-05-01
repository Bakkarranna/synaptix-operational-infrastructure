# Hero prompts for Synaptix Studio

## Start image
Macro shot of a massive, levitating dark-glass monolith suspended in a vast black void, intersected by aggressive, violently glowing #FF5630 neural light streams, cinematic dark mode, high contrast, surreal 3D aesthetic, precise chiaroscuro lighting, 35mm lens, photorealistic, no logos, no text, no watermarks, 4k resolution, volumetric haze

## End image
Macro shot of a massive, levitating dark-glass monolith suspended in a vast black void, with the glowing #FF5630 neural light streams aggressively pulsing and expanding across the glass surface, cinematic dark mode, high contrast, surreal 3D aesthetic, precise chiaroscuro lighting, 35mm lens, photorealistic, no logos, no text, no watermarks, 4k resolution, volumetric haze

## Video
Source frames: hero-start.png to hero-end.png
Motion: 6-second slow, hypnotic undulation of the glass monolith as the #FF5630 light streams aggressively pulse and flare across its surface, no camera shake, ambient breathing motion only, cinematic dark mode light shift, depth-of-field blur on background remains constant. Loop seamlessly from end frame back to start frame.

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

The site auto-loads from those paths. No further wiring needed.
