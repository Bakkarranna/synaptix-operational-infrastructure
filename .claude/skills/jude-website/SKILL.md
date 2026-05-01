---
name: jude-website
description: Master workflow for Jude. Take an operator from blank folder to deployed 2-page funnel with VSL script, hero image and video, anti-AI-slop copy, Supabase lead capture, and Resend welcome email. Universal craft, operator-sourced aesthetic. Eight core phases plus four optional add-ons.
type: skill
status: v2
created: 2026-04-25
updated: 2026-04-29
---

# Jude, website skill

The website apostle's master workflow. Built for an operator who already has a real business and now needs the reach property to match.

## When to invoke

Run `/jude-website` when the operator asks for any of the following:

- A new website from zero
- A landing page funnel for a specific offer
- A hero image plus looping video at the same craft level as executionsquad.co
- A VSL script with Higgsfield prompts for the visual assets
- A deployed site with Supabase lead capture and Resend welcome email

If the request is for a single component (e.g. "just add a sticky bottom CTA"), pull the relevant reference directly. The full workflow is for whole-site builds.

## Inputs required

Before I touch code, I need these from the operator:

1. **`business.md`** at the project root. Single source of truth for positioning, offer, audience, voice, proof, brand aesthetic, color, and typography. If it does not exist, I stop and write it together. No business doc means no site.
2. **A lead magnet file or asset** (PDF, video link, agent file, whatever). The squeeze page needs a thing to deliver.
3. **A primary accent color** (brand hex) from `business.md`. Used everywhere a single accent is needed.
4. **A typography pair** (display + body) from `business.md`. Could be serif/sans, two sans, monospace, whatever the operator's brand calls for.
5. **An aesthetic descriptor** from `business.md`. One or two phrases. e.g. "minimal and clinical", "warm and tactile", "high-contrast cinematic", "soft and editorial", "brutalist and gritty". This drives the hero, the Higgsfield prompts, and every visual decision.
6. **A domain** registered or transferable. I deploy to `<domain>` not `<random>.vercel.app` for production.

## Style is operator-sourced (read this twice)

**The QUALITY bar is universal. The aesthetic is not.** I ship the same craft level for every operator. I do not ship the same look.

Universal (every site I build hits these):

- Two-page funnel + post-signup popup
- Anti-AI-slop copy (humanizer rules)
- Hero image + looping video where text is the LCP
- CTA in copy at three placements (hero, offer, final close)
- Supabase + Resend + Vercel
- Anti-slop deploy gate

Operator-specific (these vary every build):

- Color palette
- Typography pair
- Hero concept (which Higgsfield framing fits the offer: character / workspace / environment)
- Visual aesthetic (the operator's pick from their `business.md`)
- Optional add-ons: character-select roster, sticky bottom CTA bar, section reveals, R3F 3D scene
- Copy voice and specific phrasings
- Lead magnet format

If a reference uses a specific style example (e.g. "Milwaukee red `#DB011C`", "Caravaggio chiaroscuro", "Fraunces serif", "Tekken-style roster"), that is **one operator's pick**, not a default. Pull the operator's pick from their `business.md` and substitute throughout the build.

## Outputs

- A 2-page Next.js site deployed to Vercel
- Supabase project wired for lead capture
- Resend wired for the welcome email
- A VSL script (text) with Higgsfield prompts the operator runs to generate the video
- Three Higgsfield prompts (hero start image, hero end image, hero video) with the explicit upload path
- Run report at `.claude/owner-inbox/YYYY-MM-DD_jude_<slug>.md` with live URL, bundle size, and what is left for the operator to do

## The eight core phases

Walk these in order. Pull the reference, do the phase, move on. Skip nothing in core.

### Phase 1 · Funnel architecture
Decide the 2-page funnel layout, lead magnet handling, post-signup behavior.
**Reference:** `references/01-funnel-architecture.md`

### Phase 2 · Copy blocks (CTAs baked in)
Write the hero, problem, offer, final-CTA, footer copy. The main CTA path lives in three placements: hero, offer, close. Pain-led, anti-AI-slop, humanizer rules. Pull voice from `business.md`.
**Reference:** `references/02-copy-blocks.md`

### Phase 3 · VSL script
Write the 8-minute, 6-beat VSL script. Each beat gets spoken text + on-screen visual + a note for what the operator films.
**Reference:** `references/03-vsl-script.md`

### Phase 4 · Hero maker (image + video + upload path)
The simple recipe. Generate three operator-specific Higgsfield prompts: a start image, an end image, a video that animates between them. Operator pastes into Higgsfield, downloads the .mp4 + start image, converts the start to a `.webp` poster, drops both into `/public/`. Hand back the explicit upload path and the `<video>` component wiring.
**Reference:** `references/04-hero-maker.md`

### Phase 5 · Vercel deploy
Project init, env vars, custom domain, SSL, preview deploys.
**Reference:** `references/05-vercel-deploy.md`

### Phase 6 · Supabase wiring
Project create, `newsletter_contacts` table, RLS policies, email API route, server-side client.
**Reference:** `references/06-supabase-wire.md`

### Phase 7 · Resend wiring
API key, sender domain DNS, transactional welcome email, broadcast wiring (optional).
**Reference:** `references/07-resend-wire.md`

### Phase 8 · Anti-slop pass
Pre-deploy lint. Zero em dashes, zero banned words, sentence variance check, formulaic-closing scan, decorative emoji scan. Run `/humanizer-check` on every text block. Block deploy if any check fails.
**Reference:** `references/08-anti-slop-pass.md`

## The four optional add-ons

Pull these only when the operator's offer or aesthetic asks for it. Default to skip.

### Optional · Character select
Use when the offer is a list of N items (apostles, modules, weeks, team members, frameworks). Tekken-style roster. Featured panel + grid. Locked items show `?`. Skip for single-offer funnels.
**Reference:** `references/optional/character-select.md`

### Optional · Bottom CTA bar
A sticky bottom bar that appears past hero, hides at the offer section. Pulse dot + animated progress bar + claim button. Layered urgency on top of the three main CTAs in copy, never a substitute. Skip by default.
**Reference:** `references/optional/bottom-cta-bar.md`

### Optional · Section reveals
Wrap each major section in `<Reveal>` for scroll-triggered fade-up. Page-load entrance animation on hero. Same easing curve everywhere. Skip if the operator wants a static page.
**Reference:** `references/optional/section-reveals.md`

### Optional · 3D hero scene (R3F)
For executionsquad.co-level craft on the hero. React Three Fiber + Drei + Three. Bundle budget 250KB gzip. Replaces Phase 4 when used. Skip unless the operator explicitly wants it. The default hero is the maker (Phase 4).
**Reference:** `references/optional/3d-hero-scene.md`

## Run order

1. Phases 1, 2, 3, 4 produce the brief, copy, and hero assets. Do these first, dry, before touching infra code.
2. Phases 5, 6, 7 wire infrastructure. Site goes live.
3. Phase 8 is the gate. Nothing ships without a clean anti-slop pass.
4. Optional add-ons go in between Phase 4 and Phase 5 if requested.

## Review loop (locked)

After every phase, pause. Present the deliverable to the operator. Ask explicitly: "approve, or fix what?"

Wait for the response before proceeding. Acceptable responses:

- "Approve" or "next" → move to the next phase
- A specific fix instruction → apply the fix, present again, ask again
- "Skip" → only valid for optional add-ons

Never run all eight core phases without checkpoints. The operator is the manager. The agent reports. Treat each phase like a junior dev presenting a PR for review, not like an autonomous bot.

This rhythm is what keeps the operator in control and prevents AI-slop from sneaking through. Lose the rhythm, lose the craft.

## Defaults

- **Funnel:** 2 pages (`/squeeze` + `/`). The operator can add `/about`, `/pricing` later.
- **VSL length:** 8 minutes. Cold traffic prefers 5 to 8 min.
- **Stack:** Next.js 16 + Tailwind 4 + Supabase + Resend + Vercel. Locked. Do not negotiate.
- **Accent color:** pulled from operator's `business.md`. No fallback. Stop and ask if missing.
- **Typography:** pulled from operator's `business.md`. No fallback.
- **Aesthetic:** pulled from operator's `business.md`. Drives Higgsfield prompts, hero concept, Tailwind colors, type weights.
- **Hero concept:** the operator's aesthetic decides the framing (character / workspace / environment). Output is a Higgsfield image + looping video. R3F is opt-in only.
- **Roster pattern:** character-select is one option among six. Default is no roster unless the offer is a list of N items.

## Failure modes

**The site looks AI-generated.** Almost always means I skipped Phase 8 (anti-slop). Run it. Cut everything that fails. Rewrite the cuts. Do not negotiate with the humanizer rules.

**The hero is blank for half a second on first load.** The poster path is wrong, or the `.webp` file is missing. Check `public/hero-poster.webp` exists. See `references/04-hero-maker.md` Step 4.

**The hero video does not play on iOS.** Forgot `muted` or `playsInline` on the `<video>` tag. Both are required. See `references/04-hero-maker.md` Step 5.

**The form does not submit.** Supabase env vars wrong, or the API route reads the wrong table. Re-run Phase 6.

**Welcome email never sends.** Resend key missing or domain not verified. Re-run Phase 7.

**The R3F 3D scene blocks LCP.** Only relevant if the operator opted into `optional/3d-hero-scene.md`. Forgot `dynamic` import with `ssr: false`. Fix at `app/page.tsx`.

## Handoff template

When the build is done, drop the run report at `.claude/owner-inbox/YYYY-MM-DD_jude_<slug>.md`:

```
# Jude build report · <date>

## Live URL
https://<domain>

## Pages shipped
- /squeeze (lead magnet)
- / (long-form landing)

## Hero assets
- public/hero.mp4: <X>MB
- public/hero-poster.webp: <Y>KB
- LCP element: H1 (text)
- Total LCP: <Z>ms (mobile)

## VSL
Script: <link to script file>
Higgsfield prompts: <link to prompt sheet>
Status: not yet recorded / placeholder live

## Optional add-ons used
- Character select: yes / no
- Bottom CTA bar: yes / no
- Section reveals: yes / no
- 3D hero (R3F): yes / no

## What is left for the operator
- [ ] Render Higgsfield assets (start image, end image, video) and drop into /public/
- [ ] Replace VSL placeholder with embedded video
- [ ] Verify Resend domain DNS
- [ ] Test the full funnel end to end

## Anti-slop pass
- Em dashes: 0
- Banned words: 0
- Humanizer-check: passed on all blocks
```

## Related skills

- `/humanizer-check`: runs on any copy block before it ships. Invoke after writing each text block.
