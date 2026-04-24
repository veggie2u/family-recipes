# Design System Documentation: Elevated Heritage

## 1. Overview & Creative North Star
**Creative North Star: The Digital Curated Heirloom**

This design system is not a utility; it is a vessel for memory. To move beyond the sterile, "templated" feel of modern SaaS, we lean into **Editorial Warmth**. The goal is to replicate the tactile satisfaction of flipping through a high-end, linen-bound cookbook. 

We break the digital grid through **Intentional Asymmetry**. Instead of perfectly centered content, we use staggered layouts, overlapping imagery, and dramatic typographic scales. The interface should feel "composed" rather than "programmed," inviting the user to linger, reminisce, and contribute to their family’s living history.

---

## 2. Colors: Tonal Heritage
The palette is rooted in the earth and the kitchen—terracotta, sage, and cream. These aren't just colors; they are atmospheric anchors.

*   **Primary (`#91472b`):** Our "Terracotta." Use this for key actions and soulful accents.
*   **Secondary (`#51634c`):** Our "Sage." This provides a grounded, herbal calm to navigation and filtering.
*   **Surface (`#fdf9ef`):** Our "Muted Cream." This is the "paper" of our digital book.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning content. Boundaries must be defined solely through background color shifts. 
*   *Example:* A `surface-container-low` section sitting on a `surface` background creates a natural, soft edge that feels architectural rather than mechanical.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine deckle-edge paper. 
*   **Base:** `surface`
*   **Sectioning:** `surface-container-low`
*   **Interactive Cards:** `surface-container-highest`
Each inner container should use a slightly higher or lower tier to define importance, avoiding the "flatness" of standard web design.

### Signature Textures & The "Glass" Rule
To add professional polish, utilize **Glassmorphism** for floating elements (like a navigation bar or a recipe "quick-view" modal). Use semi-transparent surface colors with a `backdrop-blur` effect (e.g., 12px–20px). 
For main CTAs, apply a subtle linear gradient transitioning from `primary` to `primary_container`. This adds a "visual soul" and a slight 3D curvature that flat fills lack.

---

## 3. Typography: Editorial Authority
We pair the intellectual, vintage charm of **Newsreader** with the functional clarity of **Manrope**.

*   **Display & Headlines (Newsreader):** These are your "voice." Use `display-lg` for recipe titles to evoke the feeling of a printed title page. The serif’s slight irregularities provide the "nostalgic" warmth requested.
*   **Body & Labels (Manrope):** These are your "instruction." The clean, modern sans-serif ensures that even complex cooking steps are legible at a glance on a flour-dusted tablet screen.

**Typographic Intent:** Always lean into high-contrast scales. A massive `display-md` title next to a quiet `body-sm` metadata tag creates an editorial rhythm that feels high-end.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often too "digital." In this system, we convey depth through **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a "lift" through color value rather than structural lines.
*   **Ambient Shadows:** If an element must float (e.g., a "Save Recipe" FAB), use an extra-diffused shadow. 
    *   *Spec:* `0px 12px 32px rgba(84, 67, 61, 0.08)`. The shadow color is a tint of our `on-surface-variant`, mimicking natural light in a kitchen.
*   **The "Ghost Border":** If accessibility requires a border, it must be the `outline-variant` token at **15% opacity**. Never use 100% opaque borders.
*   **Glassmorphism:** Use semi-transparent surfaces (e.g., `surface` at 80% opacity) with backdrop blurs to make floating panels feel integrated into the environment.

---

## 5. Components: The Primitive Set

### Buttons
*   **Primary:** Rounded `lg` (1rem). Background: `primary` gradient to `primary_container`. Text: `on_primary`. 
*   **Secondary:** Ghost style. No background, no border. Use `secondary` text with a `label-md` weight.
*   **Interaction:** On hover, shift the background to `primary_fixed_dim`.

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Cards:** Use `surface-container-high` with a `xl` (1.5rem) corner radius. Separate items using vertical white space from our spacing scale (e.g., 24px or 32px gaps).
*   **Lists:** Use a subtle background hover state (`surface-variant`) instead of an underline or border to indicate selection.

### Chips
*   **Visual:** Use `secondary_container` with `on_secondary_container` text. These should feel like small, organic "tags" pinned to a page. Radius: `full`.

### Input Fields
*   **Styling:** Use the "Ghost Border" fallback. Soft, `md` rounded corners. The background should be `surface_container_lowest` to invite the user to type into a clean space.

### Signature Component: The "Recipe Scrapbook" Card
An asymmetrical card where the image overlaps the container edge by 16px, using the `xl` roundedness. This breaks the "box" feel and contributes to the curated, personal vibe.

---

## 6. Do's and Don'ts

### Do
*   **Do** embrace negative space. If a layout feels "empty," add more space, not more lines.
*   **Do** use `Newsreader` for any text that carries emotional weight (quotes, titles, family names).
*   **Do** use `surface-tint` sparingly to highlight active navigation states.

### Don't
*   **Don't** use pure black (`#000000`). Use `on_background` (`#1c1c16`) for all dark text to maintain the "warm wood" softness.
*   **Don't** use standard Material Design drop shadows. They are too aggressive for this "elevated cozy" aesthetic.
*   **Don't** align everything to a rigid center. Experiment with left-aligned headlines and right-aligned body copy for a modern editorial feel.

### Accessibility Note
While we prioritize aesthetics, legibility is paramount. Ensure all text on `primary` or `secondary` backgrounds meets WCAG AA standards using the provided `on_` color tokens. The `surface` and `on_surface` contrast ratio is specifically tuned for long-form reading of recipe instructions.