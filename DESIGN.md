---
name: Synaptix Studio
colors:
  primary: "#FF5630"
  cta-highlight: "#F95C5C"
  brand-dark: "#1A1A1A"
  brand-accent: "#e0e0e0"
  background: "#F9FAFB"
  on-background: "#374151"
  surface-dark: "#000000"
  on-surface-dark: "#e0e0e0"
typography:
  display:
    fontFamily: Montserrat
    fontWeight: "700"
  body:
    fontFamily: Inter
    fontWeight: "400"
  monospace:
    fontFamily: '"VT323"'
rounded:
  sm: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
  card-glass:
    backgroundColor: "rgba(255, 255, 255, 0.2)"
    rounded: "{rounded.xl}"
---

## Brand & Style
Synaptix Studio represents the intersection of high-end business consulting and bleeding-edge AI technology. The aesthetic is clean, professional, yet inherently technical. It bridges the gap between a sleek corporate B2B presence and an advanced "hacker" or "developer" toolset.

The visual identity relies on high contrast. In light mode, it is clean and approachable (`#F9FAFB` with slate text). In dark mode, it transforms into an immersive, operational dashboard feel (`#000000` backgrounds with glowing elements), reflecting the "autonomous core" of business.

## Colors
The palette is centered around a vibrant, energetic primary color against stark neutral backgrounds.

- **Primary (#FF5630):** An aggressive, forward-moving orange/red used for primary calls-to-action and key highlights. It signals action, power, and transformation.
- **CTA Highlight (#F95C5C):** A softer variant of the primary color for hover states and secondary emphasis.
- **Brand Dark (#1A1A1A):** A rich, off-black used for secondary surfaces in dark mode, or heavy text in light mode.
- **Brand Accent (#E0E0E0):** Used for subtle borders, dividers, and secondary text in dark mode.

## Typography
The typographic pairing emphasizes readability and a modern, structural feel.

- **Headlines (Montserrat):** Used for all major section headers and callouts. Its geometric, slightly wide structure gives a sense of stability and premium quality.
- **Body (Inter):** A highly legible, neutral sans-serif that fades into the background, ensuring complex technical information is easy to consume.
- **Technical/Accent ("VT323"):** A retro, monospaced pixel font used sparingly for terminal consoles, code snippets, or raw data readouts, reinforcing the "engineering" aspect of the brand.

## Layout & Spacing
The layout relies on standard Tailwind spacing scales with generous padding to create breathing room around complex topics. Sections are clearly delineated, often using alternating background colors or glassmorphic cards to separate concerns.

## Elevation & Depth
Depth is created dynamically, especially in dark mode, using glowing shadows and glassmorphism rather than traditional drop shadows.

- **Glow Effects:** Critical interactive elements or "active" AI components feature animated colored box-shadows (e.g., `0 0 10px rgba(255, 86, 48, 0.8)`).
- **Glassmorphism:** Secondary components float on translucent backgrounds with backdrop blurs (e.g., `bg-white/20 backdrop-blur-md`), giving a sense of layers and advanced digital surfaces.

## Shapes
Shapes vary between standard crisp edges and highly organic, animated forms.

- **Standard UI:** Buttons, input fields, and standard cards utilize `rounded-md` or `rounded-xl` for a soft, modern feel.
- **Organic Elements:** Visualizations for AI processes use custom, heavily manipulated border-radii that animate over time (e.g., waveform and blob animations) to simulate a "living" artificial intelligence.

## Motion & Animation
Motion is a core part of the Synaptix Studio identity, breathing life into the "AI infrastructure" concept.

- **Micro-interactions:** Elements fade in and slide up gracefully as the user scrolls, maintaining a smooth, guided narrative.
- **Ambient AI Animations:** Background blobs, pulsing glows, and continuous waveform animations simulate data processing, neural networks, and "thinking" AI.
- **Continuous Scrolling:** Partner logos and service lists utilize infinite marquee scrolls to demonstrate scale and ongoing operational velocity.
