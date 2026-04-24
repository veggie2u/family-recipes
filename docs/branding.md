# Branding & Visual Language

> **Updated direction:** This document reflects the *Elevated Heritage* brand system (`altBranding.md`). All existing CSS custom property names and Tailwind tokens are preserved — only their values and the descriptive rationale have changed.

---

## Name

**Family Recipes**

Chosen as the working app name. To be revisited if a more distinctive brand name is desired before launch.

---

## Mood & Direction

**Elevated Heritage** — The Digital Curated Heirloom.

The goal is to replicate the tactile satisfaction of flipping through a high-end, linen-bound cookbook. The interface should feel *composed* rather than *programmed* — inviting the user to linger, reminisce, and contribute to their family's living history. We lean into **Editorial Warmth** and **Intentional Asymmetry**: staggered layouts, dramatic typographic scales, and tonal depth instead of rigid grids and mechanical lines.

---

## Color Palette

Defined as CSS custom properties in `app/globals.css` and consumed via Tailwind's `hsl(var(--...))` tokens.

The palette is rooted in the earth and the kitchen: **Terracotta**, **Sage**, and **Muted Cream**. These are atmospheric anchors, not just colors.

- **Terracotta** (`#91472b` → `16 54% 37%`): Key actions and soulful accents. Maps to `--primary` and `--accent`.
- **Sage** (`#51634c` → `107 13% 34%`): Grounded, herbal calm for navigation and filtering. Maps to `--secondary`.
- **Muted Cream** (`#fdf9ef` → `43 78% 96%`): The "paper" of the digital book. Maps to `--background` and `--card`.

### The "No-Line" Rule
Explicit 1px solid borders for sectioning content should be avoided. Define boundaries through **background color shifts** (tonal layering) rather than lines. If a border is strictly required for accessibility, use `--border` at reduced opacity (≈15%).

### Surface Hierarchy (Tonal Layering)
Treat the UI as stacked sheets of fine deckle-edge paper. Use successive `--background` / `--card` / `--muted` tiers to convey depth through color value, not drop shadows. Standard Material-style box shadows are discouraged — prefer `--card` on `--background` for a natural lift.

### Glassmorphism
For floating elements (nav, modals, quick-view panels): use semi-transparent `--background` (≈80% opacity) with `backdrop-blur` (12–20px) to integrate them with the environment.

### Light mode
| Role | Value | Notes |
|---|---|---|
| `--background` | `43 78% 96%` | Muted Cream — the "paper" of the book |
| `--foreground` | `60 12% 10%` | Warm near-black (`#1c1c16`) |
| `--card` | `43 60% 92%` | Slightly deeper cream for card surfaces |
| `--primary` | `16 54% 37%` | Terracotta (`#91472b`) |
| `--primary-foreground` | `43 78% 96%` | Muted Cream on Terracotta |
| `--secondary` | `107 13% 34%` | Sage (`#51634c`) |
| `--secondary-foreground` | `43 78% 96%` | Cream on Sage |
| `--muted` | `43 40% 88%` | Soft cream tint for muted surfaces |
| `--muted-foreground` | `60 8% 40%` | Warm mid-tone for secondary text |
| `--accent` | `16 54% 37%` | Terracotta — same as primary for soulful highlights |
| `--accent-foreground` | `43 78% 96%` | Cream on Terracotta |
| `--border` | `43 30% 82%` | Soft cream border (use sparingly — prefer tonal layering) |
| `--destructive` | `0 72% 51%` | Standard red |

### Dark mode
| Role | Value | Notes |
|---|---|---|
| `--background` | `60 10% 7%` | Deep warm dark (near `#1c1c16`) |
| `--foreground` | `43 50% 88%` | Warm cream for body text |
| `--card` | `60 8% 11%` | Slightly lighter dark surface |
| `--primary` | `16 48% 55%` | Terracotta lightened for dark bg |
| `--primary-foreground` | `60 10% 7%` | Dark surface on light Terracotta |
| `--accent` | `16 48% 55%` | Terracotta (dark mode) |
| `--muted-foreground` | `107 8% 55%` | Warm sage-tinted muted text |
| `--border` | `60 6% 18%` | Dark warm border |

---

## Typography

### Display / Headings — Newsreader
- Google Font: `Newsreader` *(replaces Playfair Display)*
- CSS variable: `--font-playfair` *(name preserved to avoid code changes — update the `next/font` import in `layout.tsx` to `Newsreader`)*
- Tailwind utility: `font-display` (configured in `tailwind.config.ts` — no change needed)
- Used for: page titles, card headings, the brand wordmark, any text carrying emotional weight (quotes, family names)
- Rationale: The serif's slight irregularities provide the "nostalgic" warmth and editorial authority of a printed title page. Always lean into high-contrast typographic scales — a large `font-display` title next to quiet `text-xs` metadata creates the editorial rhythm that feels high-end.

### Body — Manrope
- Google Font: `Manrope` *(replaces Geist Sans)*
- Clean, modern sans-serif that ensures complex cooking steps remain legible on any device
- Used for: all body copy, labels, descriptions, UI text, buttons

---

## Logo / Brand Mark

**Icon + wordmark** combination.

### Image assets

Two logo files live in `public/`:

| File | Dimensions | Used in |
|---|---|---|
| `public/logo.png` | 387×411px (portrait) | Hero section on the welcome page |
| `public/icon-transparent.png` | 358×326px (landscape, transparent bg) | Nav bar and footer (`BrandLogo` component) |

The transparent-background icon is preferred anywhere it appears alongside UI chrome (nav, footer) since it blends with any background color in both light and dark mode. The full logo is used as a large decorative element in the hero.

### Wordmark
- "Family Recipes" in `font-display` (Newsreader), `font-semibold`, `text-xl`, `leading-none`
- Tight tracking (`tracking-tight`)
- `leading-none` is intentional — it collapses the line-height bounding box so `items-center` in flex aligns on the actual visual cap-height of the letterforms rather than the padded text box

### Sizing

| Context | Height | Width |
|---|---|---|
| Nav bar | `h-12` (48px) | `w-auto` (≈53px at 358:326 ratio) |
| Footer | `h-5` (20px) | `w-auto` (≈22px) |
| Welcome page hero | `h-48` (192px) | `w-auto` (≈181px at 387:411 ratio) |

### Component
```tsx
import { BrandLogo } from "@/components/brand-logo";

// Full logo (icon + wordmark) — uses icon-transparent.png
<BrandLogo />

// Icon only
<BrandLogo hideText />

// Custom icon size (e.g. footer)
<BrandLogo iconClassName="h-5 w-auto" textClassName="text-sm font-medium" />
```

---

## Components: Key Principles

### Buttons
- **Primary:** Rounded `lg` (1rem). Background: `--primary` (Terracotta), optionally a subtle gradient to `--primary` at 90% lightness. Text: `--primary-foreground`.
- **Secondary:** Ghost style — no background fill, `--secondary` text color, `label-md` weight.
- **Hover:** Shift background to a slightly lighter/darker Terracotta tint.

### Cards
- Use `--card` background on `--background`. Corner radius: `xl` (1.5rem) for a curated, non-boxy feel.
- Separate items with vertical whitespace (24–32px gaps). **Do not use divider lines between list items** — use `--muted` hover backgrounds instead.
- Prefer the "Scrapbook" asymmetric card style where imagery overlaps the container edge slightly.

### Tags / Chips
- Background: `--secondary` tint; text: `--secondary-foreground`. Full pill radius (`rounded-full`).

### Input Fields
- Soft `md` rounded corners. Background: `--muted` (invite typing into a clean, paper-like space).
- Use the "Ghost Border" if needed: `--border` at ≤15% opacity.

---

## Shadows & Elevation

Traditional drop shadows are too "digital." Prefer **Tonal Layering** (color value shifts between `--background` / `--card` / `--muted`). If a true shadow is needed for a floating element (FAB, modal): `0px 12px 32px rgba(84, 67, 61, 0.08)` — tinted with a warm on-surface variant to mimic natural kitchen light.

---

## Theme Support

Both light and dark modes are supported via `next-themes` with `attribute="class"`. The `ThemeSwitcher` component is present in the nav on all pages.

Default: system preference.

---

## Border Radius

Cards: `1.5rem` (`rounded-xl`) for curated, non-boxy feel.
Buttons: `1rem` (`rounded-lg`).
Inputs / smaller elements: `0.375rem` (`rounded-md`).

---

## Do's and Don'ts

### Do
- Embrace negative space — if a layout feels empty, add more space, not more lines.
- Use `font-display` (Newsreader) for any text that carries emotional weight: quotes, titles, family names.
- Use tonal layering (`--card` on `--background`) to define sections instead of borders.
- Use `backdrop-blur` + semi-transparent `--background` for floating UI panels.

### Don't
- Use pure black (`#000000`) for text — use `--foreground` (`#1c1c16`) to maintain the warm-wood softness.
- Use explicit 1px divider lines between sections — shift background tones instead.
- Align everything to a rigid center — left-aligned headlines with supporting body copy feel more editorial.
- Use aggressive Material-style drop shadows — they break the elevated, cozy aesthetic.
