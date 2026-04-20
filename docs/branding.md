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

### Image assets

Two logo files live in `public/`:

| File | Dimensions | Used in |
|---|---|---|
| `public/logo.png` | 387×411px (portrait) | Hero section on the welcome page |
| `public/icon-transparent.png` | 358×326px (landscape, transparent bg) | Nav bar and footer (`BrandLogo` component) |

The transparent-background icon is preferred anywhere it appears alongside UI chrome (nav, footer) since it blends with any background color in both light and dark mode. The full logo is used as a large decorative element in the hero.

### Wordmark
- "Family Recipes" in `font-display` (Playfair Display), `font-semibold`, `text-xl`, `leading-none`
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

## Theme Support

Both light and dark modes are supported via `next-themes` with `attribute="class"`. The `ThemeSwitcher` component is present in the nav on all pages.

Default: system preference.

---

## Border Radius

Set to `0.375rem` (slightly tighter than the default `0.5rem`) to give a more classic, less bubbly feel consistent with the rustic direction.
