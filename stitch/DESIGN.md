---
name: Aurelian Finance
colors:
  surface: '#161308'
  surface-dim: '#161308'
  surface-bright: '#3d392c'
  surface-container-lowest: '#110e05'
  surface-container-low: '#1f1b10'
  surface-container: '#231f14'
  surface-container-high: '#2e2a1e'
  surface-container-highest: '#393528'
  on-surface: '#eae2cf'
  on-surface-variant: '#d0c6ab'
  inverse-surface: '#eae2cf'
  inverse-on-surface: '#343024'
  outline: '#999077'
  outline-variant: '#4d4732'
  surface-tint: '#e9c400'
  primary: '#fff6df'
  on-primary: '#3a3000'
  primary-container: '#ffd700'
  on-primary-container: '#705e00'
  inverse-primary: '#705d00'
  secondary: '#c6c6cc'
  on-secondary: '#2f3035'
  secondary-container: '#47494e'
  on-secondary-container: '#b7b8be'
  tertiary: '#f3f6ff'
  on-tertiary: '#2c3138'
  tertiary-container: '#d6dae4'
  on-tertiary-container: '#5a5f68'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe16d'
  primary-fixed-dim: '#e9c400'
  on-primary-fixed: '#221b00'
  on-primary-fixed-variant: '#544600'
  secondary-fixed: '#e2e2e8'
  secondary-fixed-dim: '#c6c6cc'
  on-secondary-fixed: '#1a1c20'
  on-secondary-fixed-variant: '#45474b'
  tertiary-fixed: '#dee2ec'
  tertiary-fixed-dim: '#c2c7d0'
  on-tertiary-fixed: '#171c23'
  on-tertiary-fixed-variant: '#42474f'
  background: '#161308'
  on-background: '#eae2cf'
  surface-variant: '#393528'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-md:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  data-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 280px
  container-padding: 32px
  gutter: 24px
  card-gap: 16px
  section-margin: 48px
---

## Brand & Style

The design system is engineered for the high-stakes world of premium fintech, where precision meets prestige. It targets institutional investors and high-net-worth individuals who demand the clarity of professional tools paired with the aesthetic refinement of luxury brands.

The visual narrative is built on **Glassmorphism** and **Modern Minimalist** principles. It utilizes a deep, nocturnal foundation to make data appear as if it is illuminating from within the screen. The emotional response is one of absolute control, exclusivity, and technological superiority. Every interaction should feel weighty yet fluid, mimicking the tactile response of high-end physical hardware.

## Colors

This design system utilizes a "Deep Navy & Gold" palette to establish its premium positioning.

- **Primary (Gold):** Used exclusively for high-priority calls to action, active states, and critical data highlights. It should feel like a physical glow.
- **Base (Nocturnal):** The background uses a pure black (#000000) for deep contrast, while the sidebar and secondary surfaces use a dark navy (#0A0C10) to provide depth.
- **Data Accents:** A curated set of high-chroma colors (Emerald for growth, Rose for risk) are used for charts, ensuring legibility against the dark backdrop.
- **Glass Surfaces:** Semi-transparent layers use `rgba(22, 27, 34, 0.7)` with a high backdrop-blur (20px) to create the signature glass effect.

## Typography

The typography strategy focuses on high-contrast hierarchy. 

**Geist** is employed for headlines and primary data points to provide a technical, sharp edge. **Inter** handles all body copy for maximum readability during long-form data analysis. **JetBrains Mono** is used sparingly for micro-labels and metadata to reinforce the system's "engineered" feel.

Strict attention must be paid to letter spacing in the larger display roles; tighter tracking is required to achieve the "Linear-style" editorial look.

## Layout & Spacing

This design system adopts a **Fixed Sidebar / Fluid Dashboard** grid model.

- **Sidebar:** A fixed-width navigation anchor on the left. It maintains a slightly different background-hex than the main content area to create a clear functional split.
- **Dashboard Grid:** Content is organized in a modular bento-box grid. Cards should span columns based on data density (e.g., 4 columns for metrics, 8 columns for primary charts).
- **Rhythm:** A strict 8px base unit controls all padding and margins. 
- **Responsive Behavior:** On tablet, the sidebar collapses into an icon-only rail. On mobile, the sidebar moves to a bottom navigation bar or a full-screen overlay, and all grid cards stack vertically into a single column.

## Elevation & Depth

Hierarchy is achieved through "Luminous Layering" rather than traditional heavy shadows.

1.  **Level 0 (Base):** Pure black #000000.
2.  **Level 1 (Sidebar/Secondary):** #0A0C10.
3.  **Level 2 (Cards):** Glassmorphic surfaces with a 1px inner border of `rgba(255,255,255,0.08)`.
4.  **Interaction Glow:** When a card is hovered or active, a subtle outer glow using the Primary Gold color at 10% opacity is applied.

All glass layers must utilize `backdrop-filter: blur(20px)` to ensure content behind them is obscured elegantly without losing the sense of depth.

## Shapes

The shape language is refined and modern. A consistent `0.5rem (8px)` radius is applied to standard UI elements like buttons and inputs. Larger containers and dashboard cards utilize a `1rem (16px)` radius to appear more sophisticated and approachable. All "active" state indicators (like the selection bar in the sidebar) should use a fully pill-shaped radius for a distinct visual difference from the content containers.

## Components

### Buttons
- **Primary:** Solid Gold background with black text. No border. High-gloss finish.
- **Secondary:** Ghost style with the `glass_stroke` border and white text.
- **Tertiary:** Text-only with a subtle hover state that reveals a gold underline or icon shift.

### Cards
Cards are the core of the dashboard. They feature a 1px border that is slightly brighter at the top-left to simulate a light source. The background is a dark navy glass. Inner padding is generous (24px).

### Sidebar Navigation
Items use a low-opacity white for inactive states. The active state features the Primary Gold color for the icon and a subtle left-aligned vertical "accent bar."

### Input Fields
Inputs are dark-themed with a subtle 1px border. On focus, the border transitions to Primary Gold with a soft 4px outer glow.

### Charts
Charts should never use solid fills. Instead, use vertical gradients that fade from the accent color (Gold/Emerald/Rose) at the top to 0% opacity at the bottom. Grid lines should be kept at a minimal `rgba(255,255,255,0.03)`.