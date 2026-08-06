# Mobile & responsive conventions

The stylesheet used to be a single 7,956-line `src/styles.css` with 11 media
query blocks scattered through it in three separate appended regions. This
document describes what replaced it and the rules to follow when adding styles.

## Structure

`src/styles/index.css` is the entry point and the cascade order. Import order is
deliberate — modules run general to specific, and `responsive.css` is last.

| File | Contents |
| --- | --- |
| `base.css` | Design tokens, breakpoint scale, reset, element defaults, mobile fundamentals |
| `landing.css` / `landing-v2.css` | Marketing pages |
| `auth.css` | Login, signup, workspace intro |
| `onboarding.css` | Onboarding wizard |
| `shell.css` | Sidebar, nav, account chip, page frame |
| `desk.css` | Opportunity Desk |
| `company.css` / `company-decision.css` | Company research and decision pages |
| `workspace.css` | Watchlists, journal, planner, portfolio, admin |
| `responsive.css` | **Every** breakpoint override in the codebase |

## The one rule

**All responsive overrides go in `responsive.css`.** Module files are
desktop-first and contain no media queries. This is the whole point of the
restructure: previously `.mobile-sidebar-trigger` was defined in three different
media blocks and `.landing-v2-hero-inner` in four, so changing mobile behaviour
meant finding every copy.

## Breakpoint scale

Normalised from the original ad-hoc set (420 / 640 / 720 / 920 / 940 / 1100 /
1180) down to five steps:

| Width | Name | What changes |
| --- | --- | --- |
| `1180px` | narrow desktop | Dense two-column layouts relax to one |
| `960px` | tablet / small laptop | Sidebar becomes a drawer, asides stop being sticky |
| `720px` | large phone | Toolbars and action rows go vertical |
| `640px` | phone | Tables become cards, everything single-column |
| `420px` | small phone | Padding and label columns tighten |

Blocks are ordered **largest to smallest** so narrower breakpoints always win.
The original file interleaved a `max-width: 1180px` block *after* a
`max-width: 640px` block, which meant wide-screen rules were beating phone rules
on phones. Keep the ordering.

The values are mirrored as `--bp-*` custom properties in `base.css` for
documentation only — CSS cannot use custom properties in media query conditions,
so the literals in `responsive.css` are the source of truth. Change both.

## Data tables

The four tables (`.dashboard-row`, `.opportunity-row`, `.planner-row`,
`.portfolio-row`) are CSS grids, not `<table>`s, and they need 740–1020px of
column minimums. They degrade in two stages:

- **≤960px** — `.planner-table` / `.portfolio-table` keep tabular form and scroll
  horizontally; `.dashboard-table` is too wide for that and goes straight to cards.
- **≤640px** — all of them become stacked cards.

The card layout is driven by `data-label` attributes on each cell, rendered via
`[data-label]::before`. **If you add a column to one of these tables, add a
`data-label` to the cell** — without it the value appears in the mobile card with
no heading. The header row is `display: none` at that size.

## Mobile fundamentals in `base.css`

- `min-height: 100dvh` follows `100vh` so full-height sections track the visible
  viewport as mobile browser chrome hides and reveals.
- Safe-area insets (`--safe-top` etc.) resolve to `0px` off-notch. The fixed
  sidebar and its trigger use them; anything else `position: fixed` should too.
- `--tap-target: 44px` is the Apple HIG minimum. Interactive elements are held to
  it at ≤960px.
- Form fields are `max(16px, 1rem)` at ≤960px. **Do not lower this** — iOS Safari
  zooms the viewport when a focused field is under 16px and does not zoom back.

The old bottom-of-file "mobile hardening pass" set `overflow-x: hidden` on
`html, body, #root`, which hid horizontal overflow rather than preventing it. It
was removed. Overflow is now prevented at the source with `min-width: 0` on the
layout roots and `overflow-wrap: anywhere` on unbounded text. If you find the
page scrolling sideways, fix the offending element — do not re-add the clamp,
because it also breaks `position: sticky` in some browsers.

## Verifying a change

`npm run build` catches syntax errors only. For layout, screenshot with headless
Chromium at 320 / 360 / 390 / 430 / 640 / 720 / 960 / 1180 / 1440:

```sh
chromium --headless --disable-gpu --hide-scrollbars \
  --window-size=390,2400 --virtual-time-budget=6000 \
  --screenshot=out.png http://localhost:5173/
```

320px (iPhone SE) is the narrowest supported width. Desktop rendering at 1180px
and above should not change when you touch mobile styles — if it does, a rule
escaped `responsive.css`.
