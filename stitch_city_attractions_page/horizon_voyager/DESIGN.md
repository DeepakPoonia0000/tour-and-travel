# Design System Document: The Editorial Explorer

## 1. Overview & Creative North Star
**Creative North Star: "The Curated Odyssey"**

This design system moves away from the "template-heavy" look of standard travel agencies. Instead, it adopts a high-end editorial approach—think luxury travel journals and immersive digital storytelling. We achieve "Adventure" through intentional asymmetry and large-scale imagery, and "Trust" through sophisticated typography and a rock-solid color foundation. 

The system breaks the rigid grid by allowing high-quality photography to bleed across containers and using overlapping elements to create a sense of three-dimensional space. We are not just building a website; we are crafting a digital concierge experience that feels both modern and timeless.

## 2. Colors
Our palette balances the depth of the ocean with the kinetic energy of a sunset, grounded by expansive, clean neutrals.

### The Palette
*   **Primary (Deep Ocean Blue):** `#00327d`. Use this to anchor the brand. It represents the reliability of a seasoned guide.
*   **Secondary (Sunset Orange):** `#9b4500`. Use sparingly for high-intent actions. It provides the "vibrant" spark that represents discovery.
*   **Tertiary (Deep Teal):** `#003f37`. Used for subtle environmental accents or secondary interactive elements.
*   **Surface Hierarchy:** 
    *   `surface` (`#faf8ff`): Your canvas.
    *   `surface_container_low` (`#f3f3fc`): For subtle sectioning.
    *   `surface_container_lowest` (`#ffffff`): For high-contrast cards.

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. Definition must be achieved through:
1.  **Background Shifts:** Place a `surface_container_lowest` card on a `surface_container_low` background.
2.  **Negative Space:** Use the Spacing Scale (specifically `8` to `12`) to separate ideas.
3.  **Tonal Transitions:** Use a soft gradient transition from `primary` to `primary_container` for hero sections to create depth without lines.

### Glass & Gradient Rule
For floating navigation bars or destination weather widgets, use **Glassmorphism**. Apply a semi-transparent `surface` color with a `backdrop-filter: blur(12px)`. This ensures the vibrant landscape photography remains the hero of the experience while maintaining legibility.

## 3. Typography
We use a high-contrast pairing: a stately serif for storytelling and a contemporary sans-serif for utility.

*   **Display & Headline (Noto Serif):** These are your "Editorial" voices. 
    *   `display-lg` (3.5rem): Reserved for hero statements. 
    *   `headline-md` (1.75rem): For destination names and narrative sections.
*   **Title & Body (Plus Jakarta Sans):** These are your "Functional" voices. 
    *   `title-lg` (1.375rem): For card titles and navigation.
    *   `body-lg` (1rem): For storytelling copy. Ensure a line-height of 1.6 for maximum readability.
*   **Labels (Plus Jakarta Sans):** 
    *   `label-md` (0.75rem): Use all-caps with 0.05em tracking for eyebrow headers (e.g., "7-DAY ITINERARY").

## 4. Elevation & Depth
In "The Curated Odyssey," we do not use heavy shadows. We use light.

### The Layering Principle
Hierarchy is achieved by stacking surface-container tiers. 
*   **Level 0:** `surface` (Main background)
*   **Level 1:** `surface_container_low` (In-page sections/sections within a scroll)
*   **Level 2:** `surface_container_lowest` (Interactive cards or floating modules)

### Ambient Shadows
When a physical "lift" is required (e.g., a hovered destination card), use an extra-diffused shadow:
*   **Blur:** 24px - 40px
*   **Opacity:** 4-6% 
*   **Color:** Use a tinted shadow based on `on_surface` (`#191b22`) rather than pure black.

### Ghost Borders
If an element (like an input field) requires a boundary for accessibility, use the **Ghost Border**: `outline_variant` (`#c3c6d5`) at 20% opacity. Never use a 100% opaque border.

## 5. Components

### Buttons
*   **Primary CTA:** Uses `primary` background with `on_primary` text. Style with `rounded-md` (0.75rem). For hero buttons, use a subtle gradient from `primary` to `primary_container`.
*   **Secondary CTA:** Uses `secondary_fixed` background. This is your "Sunset" accent, perfect for "Book Now" actions.
*   **States:** On hover, increase the elevation through a subtle `primary_container` shift rather than a color change.

### Cards (Destination & Experience)
*   **Style:** `surface_container_lowest` background, `rounded-lg` (1rem) corners.
*   **No Dividers:** Prohibit the use of lines between the image and the text. Use `spacing-4` (1.4rem) of internal padding to let the content breathe.
*   **Image Treatment:** Use a slight zoom effect (1.05x) on hover to create a sense of "stepping into" the destination.

### Interactive Chips
*   **Style:** For travel filters (e.g., "Mountains," "Beach"), use `surface_container_high` with `label-md` typography. When selected, transition to `secondary_container` to provide that "vibrant" adventurous feedback.

### Input Fields
*   **Style:** Minimalist. Use `surface_container_low` for the fill. No bottom line; only use a Ghost Border if the field sits on a white background.

### Suggested Custom Component: The "Perspective Hero"
A hero section where the background image moves slightly slower than the foreground text (parallax), with a `surface_container_lowest` card overlapping the bottom edge of the hero image to lead the user's eye down the page.

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts. Let a photo take up 60% of the width while the text takes 40% with a large offset.
*   **Do** use `primary_fixed` for light-blue backgrounds in information-heavy sections to reduce eye strain.
*   **Do** prioritize "Breathing Room." If in doubt, add more space using the `12` (4rem) or `16` (5.5rem) spacing tokens.

### Don't:
*   **Don't** use pure black (#000000) for text. Always use `on_surface` to keep the editorial feel soft and premium.
*   **Don't** use standard "Drop Shadows" from a UI kit. They look cheap. Stick to the Ambient Shadow values.
*   **Don't** use dividers or lines to separate list items. Use tonal shifts or vertical spacing.
*   **Don't** clutter the screen. If a page feels busy, remove an element rather than shrinking it.