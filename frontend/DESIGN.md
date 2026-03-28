# Design System Specification: High-End Financial Intelligence

## 1. Overview & Creative North Star
**Creative North Star: The Architectural Ledger**
This design system moves beyond the standard "fintech" template to embrace an editorial, high-density aesthetic that feels like a premium Swiss-engineered instrument. We reject the cluttered "dashboard-in-a-box" look in favor of **The Architectural Ledger**: a layout strategy defined by expansive whitespace, intentional asymmetry, and tonal layering. 

The goal is to communicate absolute reliability through "quiet" luxury. By utilizing a high-contrast typography scale (Manrope for high-impact figures and Inter for dense data), we create a rhythmic reading experience that guides the eye through complex financial narratives without overwhelming the user.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep navies and slate grays, providing a stable foundation for high-performance data visualization.

### Surface Hierarchy & The "No-Line" Rule
To achieve a sophisticated, modern feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through background color shifts or tonal transitions.
- **Base Layer:** Use `surface` (#f8f9ff) for the primary application background.
- **Sectioning:** Use `surface_container_low` (#eff4ff) to define large functional areas (e.g., a sidebar or a secondary content well).
- **Nesting:** To highlight specific data units, place a `surface_container_lowest` (#ffffff) card atop a `surface_container_low` section. This creates a natural "lift" through color value rather than structural lines.

### Signature Textures & Glassmorphism
- **The Glass Rule:** Floating elements (modals, dropdowns, or hovering detail cards) must use a semi-transparent `surface_container_highest` with a `backdrop-blur` of 12px–20px. This ensures the dashboard feels integrated and deep, rather than flat.
- **Soulful Gradients:** For primary CTAs or high-growth "Total Balance" hero sections, use a subtle linear gradient transitioning from `primary_container` (#131b2e) to `primary` (#000000) at a 135-degree angle. This adds a "high-tech" luster that flat fills lack.

---

## 3. Typography
The system employs a dual-typeface strategy to balance analytical precision with sophisticated branding.

*   **Display & Headlines (Manrope):** Used for large-scale data points and section titles. The geometric nature of Manrope provides a "high-tech" architectural feel. 
    *   *Display-LG (3.5rem):* Reserved for hero currency values.
    *   *Headline-SM (1.5rem):* Used for primary card titles.
*   **Body & Labels (Inter):** Chosen for its exceptional legibility at small sizes and its neutral, "reliable" character.
    *   *Body-MD (0.875rem):* The workhorse for data tables and descriptions.
    *   *Label-SM (0.6875rem):* Used for micro-metadata and overline titles. Always set in Uppercase with +5% letter spacing for an editorial touch.

---

## 4. Elevation & Depth
Depth is a functional tool for hierarchy, not a decorative flourish.

- **The Layering Principle:** Stack `surface_container` tiers to create hierarchy. A `surface_container_high` element on a `surface` background indicates high interactivity or urgency.
- **Ambient Shadows:** Standard drop shadows are banned. Use "Ambient Clouds": large blur (24px–40px) at 4%–6% opacity, using the `on_surface` color (#0b1c30) as the shadow tint. This mimics natural light in a high-end office environment.
- **The "Ghost Border" Fallback:** If a divider is functionally required for accessibility, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Cards & Data Containers
*   **Structure:** No borders. Use `surface_container_lowest` for the background.
*   **Spacing:** Use `spacing-6` (1.3rem) for internal padding to allow the data to "breathe."
*   **Rule:** Forbid the use of horizontal divider lines between list items in a card. Use vertical whitespace (`spacing-3`) or alternating `surface_container_low` backgrounds to separate rows.

### Buttons
*   **Primary:** High-contrast `primary` (#000000) fill with `on_primary` (#ffffff) text. Use `roundedness-md` (0.375rem).
*   **Secondary:** `secondary_container` (#39b8fd) with `on_secondary_container` (#004666). This provides the "precise blue" highlight requested for data-driven actions.
*   **Tertiary:** Transparent background with `secondary` (#006591) text. No border; only a subtle `surface_container_highest` background shift on hover.

### Input Fields
*   **Visual Style:** Ghost-style inputs. Use a `surface_container_low` fill with a bottom-only `outline_variant` (20% opacity). 
*   **Focus State:** Transition the bottom border to `secondary` (#006591) and increase opacity to 100%.

### Data Chips & Indicators
*   **Growth/Positive:** Use `tertiary_fixed_dim` (#4edea3) with `on_tertiary_fixed` (#002113) text.
*   **High-Highlight:** Use `secondary_fixed` (#c9e6ff) for neutral data tags to maintain the "Slate/Navy" professional atmosphere.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetric Grids:** Align large "Display" numbers to the left and descriptive "Label" text to the far right within a card to create an editorial tension.
*   **Prioritize Value:** In financial cards, the numerical value (`Display-MD`) should be 2x the size of the supporting label.
*   **Embrace Whitespace:** Use `spacing-16` (3.5rem) between major dashboard modules to prevent cognitive overload.

### Don't:
*   **Don't Use Pure Black Shadows:** Never use `#000000` for shadows; always use a tinted `on_surface` to maintain color harmony.
*   **Don't Use Borders:** Avoid 1px solid borders around cards or between table rows. Let the tonal shifts of the `surface` tokens do the work.
*   **Don't Over-Color:** Limit the use of `tertiary` (emerald) to actual financial growth indicators. Using it for "success" messages or buttons dilutes its analytical meaning.