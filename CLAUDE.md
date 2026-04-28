# CLAUDE.md

This file configures Claude's behavior across all tools — claude.ai, Claude Code, Cowork, and the desktop app. Claude reads this at the start of every session.

---

## Skill Usage Policy

**Skills exist to produce better results than answering inline. Always invoke the relevant skill via the Skill tool when a match exists. Do NOT answer ad-hoc when a structured skill workflow is available.**

- A false positive (invoking a skill that wasn't strictly needed) costs almost nothing.
- A false negative (answering inline when a skill would produce a better result) costs quality.
- When in doubt, invoke the skill.
- Never explain that you're "using a skill" — just invoke it and execute.

---

## Skill Routing

### Communication & Token Efficiency

| Trigger | Skill |
|---------|-------|
| "caveman mode", "talk like caveman", "less tokens", "be brief", `/caveman` | **caveman** |
| "write a commit", "commit message", "generate commit", `/caveman-commit` | **caveman** |
| "review this PR", "code review comments", "review the diff", `/caveman-review` | **caveman** |
| "caveman help", "what caveman commands", `/caveman-help` | **caveman** |
| "compress this file", "compress CLAUDE.md", "compress memory file", `/caveman:compress` | **caveman** |

### Decision Making & Strategy

| Trigger | Skill |
|---------|-------|
| "council this", "war room this", "pressure-test this", "stress-test this", "debate this", "I can't decide", "I'm torn between", "get multiple perspectives" | **llm-council** |
| "should I X or Y", "which option is better", "validate this decision", "is this the right move" | **llm-council** |

### Software Development

| Trigger | Skill |
|---------|-------|
| "brainstorm", "design this feature", "let's build X", starting any new feature | **superpowers** (brainstorming) |
| "write a plan", "implementation plan", "plan this out" | **superpowers** (writing-plans) |
| "execute this plan", "run the plan", implementing a written plan | **superpowers** (executing-plans / subagent-driven-development) |
| "debug this", "fix this bug", "test failure", "why is this broken", "something's wrong" | **superpowers** (systematic-debugging) |
| "write tests", "TDD", "test-driven", implementing any feature | **superpowers** (test-driven-development) |
| "code review", "review my code", "review my changes", "look at this diff" | **superpowers** (requesting-code-review) |
| "git worktree", starting isolated feature work | **superpowers** (using-git-worktrees) |
| "parallel agents", multiple independent failures | **superpowers** (dispatching-parallel-agents) |
| "finish this branch", "ready to merge", implementation complete | **superpowers** (finishing-a-development-branch) |
| about to say "complete", "fixed", "passing" — verify first | **superpowers** (verification-before-completion) |
| "write a skill", "create a skill" | **superpowers** (writing-skills) |

### Browser QA & Deployment (Claude Code / Cowork)

| Trigger | Skill |
|---------|-------|
| "open this site", "browse this page", "take a screenshot", "test this URL" | **gstack** |
| "QA this", "does this work", "find bugs", "check the deploy", "dogfood this" | **gstack** (/qa) |
| "report bugs only", "just list issues" | **gstack** (/qa-only) |
| "review the plan", "CEO review", "strategy review", "think bigger" | **gstack** (/plan-ceo-review) |
| "architecture review", "eng review", "does this design make sense" | **gstack** (/plan-eng-review) |
| "design review", "visual polish", "this looks off" | **gstack** (/design-review) |
| "DX review", "developer experience", "API design review" | **gstack** (/devex-review) |
| "run all reviews", "autoplan", "review everything automatically" | **gstack** (/autoplan) |
| "investigate", "why is this broken", "debug production" | **gstack** (/investigate) |
| "ship this", "deploy", "create a PR", "send it", "land this" | **gstack** (/ship) |
| "merge and deploy", "land and deploy" | **gstack** (/land-and-deploy) |
| "save my progress", "checkpoint", "save context" | **gstack** (/context-save) |
| "restore context", "where was I", "resume" | **gstack** (/context-restore) |
| "security audit", "OWASP", "is this secure" | **gstack** (/cso) |
| "make a PDF", "generate document" | **gstack** (/make-pdf) |
| "weekly retro", "what did we ship" | **gstack** (/retro) |
| "performance benchmark", "page speed" | **gstack** (/benchmark) |
| "office hours", "is this worth building", "product brainstorm" | **gstack** (/office-hours) |
| "careful mode", "be careful", "safety mode" | **gstack** (/careful) |
| "freeze files", "lock this directory" | **gstack** (/freeze) |

### UI/UX Design

| Trigger | Skill |
|---------|-------|
| "build UI", "create component", "design this page", "build a dashboard", "landing page", "mobile app UI" | **ui-ux-pro-max** |
| "review UX", "fix layout", "improve accessibility", "add animation", "choose colors", "typography" | **ui-ux-pro-max** |
| "logo design", "brand identity", "design system", "design tokens", "Tailwind config", "shadcn/ui" | **ui-ux-pro-max** |
| "banner design", "social media images", "icon design", "slides", "pitch deck visual" | **ui-ux-pro-max** |
| "animation decision", "UI polish", "micro-interaction", "hover state", "what Emil would do" | **emil-design-eng** |
| "create DESIGN.md", "design tokens format", "machine-readable design system" | **design-md** |
| "evaluate CLI for agents", "CLI DX score", "agent-first CLI" | **design-md** (agent-dx-cli-scale) |
| "terminal UI", "Ink renderer", "json-render" | **design-md** (ink) |

### Brand Design Systems

| Trigger | Skill |
|---------|-------|
| "match Stripe style", "look like Vercel", "Linear aesthetic", "Notion design" | **awesome-design-md** |
| "match [any brand] style", "UI inspired by [brand]", "design like [brand]" | **awesome-design-md** |
| "apply a design system", "use brand colors", "follow design reference" | **awesome-design-md** |

### Business Frameworks & Strategy

| Trigger | Skill |
|---------|-------|
| "blue ocean strategy", "value innovation", "ERRC grid" | **wondelai-skills** |
| "lean startup", "build-measure-learn", "MVP", "pivot" | **wondelai-skills** |
| "jobs to be done", "JTBD", "customer interview" | **wondelai-skills** |
| "design sprint", "5-day sprint", "prototype and test" | **wondelai-skills** |
| "storybrand", "brand script", "hero journey messaging" | **wondelai-skills** |
| "traction EOS", "rocks", "Level 10 meeting", "VTO" | **wondelai-skills** |
| "crossing the chasm", "beachhead market", "technology adoption" | **wondelai-skills** |
| "influence", "Cialdini", "social proof", "reciprocity", "scarcity" | **wondelai-skills** |
| "hooked model", "habit loop", "trigger-action-reward" | **wondelai-skills** |
| "made to stick", "SUCCES", "sticky idea" | **wondelai-skills** |
| "mom test", "customer discovery interview" | **wondelai-skills** |
| "predictable revenue", "cold calling 2.0", "SDR" | **wondelai-skills** |
| "obviously awesome", "positioning", "category design" | **wondelai-skills** |
| "clean code", "naming conventions", "code smells", "functions" | **wondelai-skills** |
| "clean architecture", "SOLID", "dependency rule", "use cases" | **wondelai-skills** |
| "domain-driven design", "DDD", "bounded context", "ubiquitous language" | **wondelai-skills** |
| "pragmatic programmer", "DRY", "tracer bullets", "broken windows" | **wondelai-skills** |
| "refactoring UI", "visual design improvement", "spacing and color" | **wondelai-skills** |
| "UX heuristics", "Nielsen", "usability audit", "dark patterns" | **wondelai-skills** |
| "web typography", "typeface pairing", "type scale" | **wondelai-skills** |
| "system design", "scalability", "database design", "architecture" | **wondelai-skills** |
| "DDIA", "designing data-intensive applications", "distributed systems" | **wondelai-skills** |
| "apply framework [any]", "use methodology [any]" | **wondelai-skills** |

### Marketing

| Trigger | Skill |
|---------|-------|
| "A/B test", "split test", "experiment design" | **marketing** (ab-test-setup) |
| "ad copy", "ad creative", "write an ad", "headlines for ads" | **marketing** (ad-creative) |
| "AI SEO", "GEO", "AI Overviews", "LLM optimization" | **marketing** (ai-seo) |
| "analytics", "GA4", "GTM", "tracking setup", "UTM" | **marketing** (analytics-tracking) |
| "app store optimization", "ASO", "Play Store listing" | **marketing** (aso-audit) |
| "churn", "cancel flow", "retention", "dunning" | **marketing** (churn-prevention) |
| "cold email", "outbound", "prospecting", "SDR email" | **marketing** (cold-email) |
| "community", "Discord", "ambassador program" | **marketing** (community-marketing) |
| "competitor page", "alternatives to", "vs page", "comparison page" | **marketing** (competitor-alternatives) |
| "competitor research", "competitor profile", "competitive intelligence" | **marketing** (competitor-profiling) |
| "content strategy", "blog strategy", "editorial calendar", "topic clusters" | **marketing** (content-strategy) |
| "edit copy", "review this copy", "improve this text" | **marketing** (copy-editing) |
| "write copy", "landing page copy", "homepage copy", "CTA copy" | **marketing** (copywriting) |
| "customer research", "ICP", "persona", "voice of customer", "jobs to be done" | **marketing** (customer-research) |
| "directory submission", "Product Hunt", "backlink building" | **marketing** (directory-submissions) |
| "email sequence", "drip campaign", "onboarding emails", "nurture sequence" | **marketing** (email-sequence) |
| "form CRO", "lead form", "reduce form friction" | **marketing** (form-cro) |
| "free tool", "calculator", "engineering as marketing" | **marketing** (free-tool-strategy) |
| "launch strategy", "go to market", "Product Hunt launch" | **marketing** (launch-strategy) |
| "lead magnet", "gated content", "ebook", "checklist download" | **marketing** (lead-magnets) |
| "marketing ideas", "growth ideas", "brainstorm marketing tactics" | **marketing** (marketing-ideas) |
| "marketing psychology", "persuasion", "mental models" | **marketing** (marketing-psychology) |
| "onboarding CRO", "activation", "aha moment", "first run experience" | **marketing** (onboarding-cro) |
| "page CRO", "conversion rate", "optimize landing page" | **marketing** (page-cro) |
| "paid ads", "PPC", "Google Ads", "Meta ads", "LinkedIn ads" | **marketing** (paid-ads) |
| "paywall", "upgrade screen", "upsell", "freemium conversion" | **marketing** (paywall-upgrade-cro) |
| "popup", "modal", "exit intent", "slide-in" | **marketing** (popup-cro) |
| "pricing strategy", "pricing tiers", "freemium pricing", "value metric" | **marketing** (pricing-strategy) |
| "product marketing", "positioning", "messaging framework" | **marketing** (product-marketing-context) |
| "programmatic SEO", "template pages", "pSEO" | **marketing** (programmatic-seo) |
| "referral program", "affiliate", "word of mouth" | **marketing** (referral-program) |
| "RevOps", "MQL", "SQL", "lead routing", "pipeline" | **marketing** (revops) |
| "sales enablement", "pitch deck", "one-pager", "demo script" | **marketing** (sales-enablement) |
| "schema markup", "structured data", "JSON-LD", "rich results" | **marketing** (schema-markup) |
| "SEO audit", "technical SEO", "rankings", "crawl issues" | **marketing** (seo-audit) |
| "signup flow", "registration CRO", "account creation UX" | **marketing** (signup-flow-cro) |
| "site architecture", "information architecture", "URL structure", "navigation" | **marketing** (site-architecture) |
| "social content", "LinkedIn post", "Twitter/X thread", "TikTok script" | **marketing** (social-content) |
| "video script", "AI video", "explainer video" | **marketing** (video) |

### Document & File Generation

| Trigger | Skill |
|---------|-------|
| "Word doc", "word document", ".docx", "report", "memo", "letter" | **docx** |
| "PDF", ".pdf", "make a PDF", "fill PDF form", "merge PDFs" | **pdf** |
| "presentation", "slides", "deck", ".pptx", "PowerPoint" | **pptx** |
| "spreadsheet", ".xlsx", "Excel", "CSV cleanup", "add columns" | **xlsx** |
| user uploads a file whose content is not in context | **file-reading** |
| "read this PDF", "extract from PDF", uploaded PDF not in context | **pdf-reading** |

### Web Components & Frontend Code

| Trigger | Skill |
|---------|-------|
| "build a web component", "React component", "HTML/CSS layout", "website" | **frontend-design** |
| "style this", "make it look good", "improve the UI", "beautify" | **frontend-design** |

### Skill Management

| Trigger | Skill |
|---------|-------|
| "install this skill", "install skill from GitHub", pastes GitHub URL + skill context | **skill-builder** |
| "create a skill", "make a skill", "build a skill", "package a skill" | **skill-builder** |
| "improve this skill", "edit this skill", "update a skill" | **skill-builder** |

---

## Behavior Standards

### Code Quality
- Follow the principle of least surprise — code should do exactly what it appears to do
- Prefer explicit over implicit; name things for what they are, not what they contain
- Write tests for any non-trivial logic; use TDD when building new features
- Never fake completeness — if something isn't done, say so

### Communication
- Lead with the answer, not the reasoning
- Name files, functions, line numbers, and commands — not "the system" or "the process"
- Short paragraphs. No filler. No em dashes.
- No AI vocabulary: delve, crucial, robust, comprehensive, nuanced, multifaceted, pivotal

### Decision Making
- Present options with tradeoffs, not just recommendations
- State assumptions explicitly
- Escalate when blocked rather than silently picking the wrong path

### File Operations
- Never use `git add -A` — stage intentional files only
- Never commit broken tests or mid-edit state
- Always verify destructive operations before executing

---

## Project Context

<!-- Fill this in per-project -->
<!-- 
Project: [name]
Stack: [technologies]
Team size: [n]
Deploy target: [platform]
Key constraints: [any important rules or limitations]
-->

---

## Quick Reference — All Skills

| Skill | Core Purpose |
|-------|-------------|
| **caveman** | Token compression, terse commits, terse code review |
| **llm-council** | Multi-advisor decision making with peer review |
| **superpowers** | Full dev workflow: plan → build → debug → test → review → ship |
| **gstack** | Browser QA, plan reviews, ship pipeline, context management |
| **ui-ux-pro-max** | UI/UX design, brand identity, design tokens, logo, banners |
| **emil-design-eng** | UI polish, animation decisions, invisible quality details |
| **awesome-design-md** | 53 brand-inspired DESIGN.md files (Stripe, Vercel, Linear…) |
| **design-md** | Google Labs DESIGN.md format, CLI scoring, Ink renderer, TDD |
| **wondelai-skills** | 42 business/UX/engineering frameworks from classic books |
| **marketing** | 40+ SaaS marketing skills: CRO, SEO, copy, email, ads |
| **skill-builder** | Install or create Claude skills from GitHub repos |
| **docx** | Word document creation and editing |
| **pdf** | PDF creation, reading, manipulation |
| **pptx** | PowerPoint/presentation creation and editing |
| **xlsx** | Spreadsheet creation and editing |
| **frontend-design** | Production-grade web components and UI code |
| **file-reading** | Router for reading uploaded files of any type |
| **pdf-reading** | Deep PDF content extraction and inspection |

---

## Project Context — Synaptix Studio Redesign

Project: Synaptix Studio — Full Website Redesign (clean slate)
Stack: React 18 + Vite + TypeScript + Tailwind CSS + Convex (backend) + GSAP + Three.js/R3F
Team: Founder (Abubakar) + 2 agentic engineers
Deploy: Vercel → synaptixstudio.com
Dev server: `npm run dev -- --port 5174`
Root: D:\Downloads\synaptix-studio-website-app\

### Brand Tokens (LOCKED)
- Primary: #FF5630 | Dark BG: #000 | Light BG: #F9FAFB
- H1: VT323 (pixel) | H2–H4: Montserrat 600–800 | Body: Inter 400–700
- Cards: glassmorphism rgba(255,255,255,0.20) + backdrop-blur(16px) + border-radius:24px
- Buttons: pill (border-radius:9999px), bg #FF5630
- Glow: 0 0 10px rgba(255,86,48,0.6), 0 0 20px rgba(255,86,48,0.4)
- Background: 9.6px grid + particles canvas + corner radial gradients #FF5630 @ 10–15%
- Keep: logo mark, lockup, color palette, grid bg, glass cards

### Business Context
- Positioning: Premium AI-forward software & web studio (NOT an agency)
- Tagline: "We build digital that hits different."
- Primary services: Premium animated/3D websites, web apps, mobile apps, SaaS, landing pages
- Secondary: AI agent systems, AI marketing
- Pricing: $3k–$50k per project
- Targets: US, UK, UAE, AU — funded founders, scale-up CEOs, marketing directors
- Stage: Pre-launch; portfolio strategy = build real pages for businesses, pitch, land clients
- Team: Founder + 2 agentic engineers shipping 10x speed via AI tools
- Credibility: Has sold AI automation successfully under Synaptix Studio brand

### Design Law
- The website IS the portfolio proof — it must be the best specimen of what we build
- Lead with outcome, never technology
- Hook in 3 seconds, convert in 60
- Dark mode primary; 3D + animation mandatory in hero
- No "agency" — always "studio" or "company"
