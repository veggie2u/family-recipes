# Branding & Visual Language

Decisions made during Phase 1 to establish the visual identity of Family Recipes.

---

## Name

**Family Recipes**

Chosen as the working app name. To be revisited if a more distinctive brand name is desired before launch.

---

## Mood & Direction

**Rustic & nostalgic** — aged paper, warm browns, vintage vibes.

The goal is to feel like a cherished handwritten recipe box: warm, personal, and timeless — not a sterile modern productivity app.

---

## Color Palette

Defined as CSS custom properties in `app/globals.css` and consumed via Tailwind's `hsl(var(--...))` tokens.

### Light mode
| Role | Value | Notes |
|---|---|---|
| `--background` | `40 45% 92%` | Warm aged parchment |
| `--foreground` | `20 35% 12%` | Deep espresso brown |
| `--card` | `38 38% 88%` | Slightly deeper parchment |
| `--primary` | `22 45% 32%` | Rich walnut brown |
| `--primary-foreground` | `40 50% 96%` | Warm cream |
| `--secondary` | `35 28% 80%` | Warm tan |
| `--muted` | `38 24% 84%` | Soft parchment |
| `--muted-foreground` | `25 18% 46%` | Medium warm brown |
| `--accent` | `18 60% 50%` | Terracotta rust |
| `--accent-foreground` | `40 50% 96%` | Warm cream |
| `--border` | `35 22% 76%` | Warm tan border |
| `--destructive` | `0 72% 51%` | Standard red |

### Dark mode
| Role | Value | Notes |
|---|---|---|
| `--background` | `20 40% 7%` | Deep espresso |
| `--foreground` | `40 40% 86%` | Warm parchment |
| `--card` | `20 35% 11%` | Slightly lighter espresso |
| `--primary` | `40 40% 86%` | Warm parchment (inverted) |
| `--primary-foreground` | `20 40% 10%` | Deep espresso |
| `--accent` | `18 58% 48%` | Terracotta rust (slightly muted) |
| `--muted-foreground` | `35 18% 58%` | Warm muted tan |
| `--border` | `20 20% 18%` | Dark warm border |

---

## Typography

### Display / Headings — Playfair Display
- Google Font: `Playfair_Display`
- CSS variable: `--font-playfair`
- Tailwind utility: `font-display` (configured in `tailwind.config.ts`)
- Used for: page titles, card headings, the brand wordmark
- Rationale: Elegant old-style serif that evokes handwritten recipe cards and vintage cookbooks

### Body — Geist Sans
- Already present in the starter kit
- Used for: all body copy, labels, descriptions, UI text

---

## Logo / Brand Mark

**Icon + wordmark** combination.

### Icon — Heart in a Pot
- A simple SVG pot/cauldron with two side handles and a heart inside the opening
- Represents home cooking and family love
- Implemented as `<PotHeartIcon>` in `components/brand-logo.tsx`
- Uses `currentColor` so it inherits any text color

### Wordmark
- "Family Recipes" in `font-display` (Playfair Display), `font-semibold`, `text-xl`
- Tight tracking (`tracking-tight`)

### Component
```tsx
import { BrandLogo } from "@/components/brand-logo";

// Full logo (icon + text)
<BrandLogo />

// Icon only
<BrandLogo hideText />

// Custom sizing
<BrandLogo iconClassName="w-5 h-5" textClassName="text-sm" />
```

---

## Theme Support

Both light and dark modes are supported via `next-themes` with `attribute="class"`. The `ThemeSwitcher` component is present in the nav on all pages.

Default: system preference.

---

## Border Radius

Set to `0.375rem` (slightly tighter than the default `0.5rem`) to give a more classic, less bubbly feel consistent with the rustic direction.
