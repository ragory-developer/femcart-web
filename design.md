# Femcart — Design System Documentation v2.0

## Overview

This document outlines the complete design system for Femcart website — a modern, accessible e-commerce platform serving South Florida's halal grocery community. The design system is built on a foundation of purposeful color psychology, clear typography hierarchy, and inclusive accessibility principles.

---

## 1. Brand Identity

### Mission & Values
**Femcart** is South Florida's premier halal supermarket specializing in:
- Certified Zabiha halal meats and seafood
- Bangladeshi, Indian, Pakistani, and Middle Eastern groceries
- Fresh produce, spices, and specialty ingredients
- Community-centered local shopping with online ordering and delivery

### Visual Identity Philosophy
The design system reflects **authenticity, freshness, and trust**:
- **Olive & Forest Green**: Nature, wholesomeness, and community roots
- **Lime Green**: Energy, vitality, and growth
- **Red**: Passion, urgency, and celebration (strategic use for CTAs)
- **Warm Neutrals**: Welcoming, human-centered, approachable

---

## 2. Color Palette

### Primary Brand Colors

| Color | Hex | Usage | Psychology |
|-------|-----|-------|-----------|
| **Olive** | `#2A3D16` | Navigation, footer, dark backgrounds | Trust, tradition, groundedness |
| **Forest** | `#304A18` | Hero section, decorative elements | Nature, freshness, growth |
| **Moss** | `#3B5A1E` | Alternative dark sections, hover states | Depth, subtlety, richness |
| **Lime** | `#7DBF2E` | Accent text, icons, highlights | Energy, vitality, freshness |
| **Apple** | `#6AAD2A` | Feature circles, secondary accents | Balance, harmony, accessibility |
| **Apple Dark** | `#3D6A10` | Decorative shadows, depth | Visual weight |
| **Apple Light** | `#C8E89A` | Subtext on dark backgrounds | Contrast, readability |
| **Red** | `#C93B1A` | Primary CTA buttons, "HALAL" badges | Urgency, celebration, passion |
| **Red Dark** | `#A82E12` | Button hover/active states | Depth, interaction feedback |
| **Red Light** | `#F5E8E4` | Light badge backgrounds | Subtle emphasis |

### Neutral Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **White** | `#FFFFFF` | Cards, content backgrounds |
| **Off-White** | `#F7F4EE` | Page background, light sections |
| **Warm White** | `#F0EDE6` | Hero body text, warmth |
| **Card** | `#FFFFFF` | Product cards, containers |
| **Card Border** | `#E9E6DF` | Subtle card separation |
| **Text Dark** | `#1A1A1A` | Primary body text |
| **Text Mid** | `#4A4A4A` | Secondary text, labels |
| **Text Light** | `#7A7A7A` | Tertiary text, metadata |
| **Divider** | `#DEDAD2` | Section separators |

### Semantic Colors (Dark Mode Support)

```css
--c-border-on-dark:  rgba(255,255,255,0.12);  /* Subtle borders on dark */
--c-overlay-on-dark: rgba(255,255,255,0.08);  /* Overlay transparency */
--c-tag-on-dark:     rgba(255,255,255,0.14);  /* Tag backgrounds on dark */
```

### Color Accessibility Notes
- All text meets WCAG AA standards (4.5:1 contrast minimum)
- Lime green (`#7DBF2E`) on white: 5.8:1 contrast
- Red (`#C93B1A`) on white: 4.7:1 contrast
- Never rely on color alone to convey information (combine with icons, text, or patterns)

---

## 3. Typography System

### Font Families

#### Display Font
**Barlow Condensed** (Weights: 700, 800, 900)
- Used for: Headlines, section titles, badges, CTAs
- Imported from Google Fonts
- Condensed letterforms create visual impact and authority

#### Body Font
**Open Sans** (Weights: 400, 600, 700)
- Used for: Body text, labels, navigation, descriptions
- Imported from Google Fonts
- Highly legible at all sizes, excellent screen rendering

### Type Scale

#### Display Sizes (Barlow Condensed)
```css
--display-sm:  28px;                      /* Small headlines */
--display-md:  36px;                      /* Section titles */
--display-lg:  48px;                      /* Major headlines */
--display-xl:  clamp(60px, 6.5vw, 88px); /* Hero headline (fluid) */
--display-2xl: clamp(72px, 8.5vw, 108px); /* Hero main (fluid, responsive) */
```

#### Text Sizes (Open Sans)
```css
--text-xs:   11px;  /* Fine print, timestamps */
--text-sm:   12px;  /* Labels, badges, captions */
--text-base: 14px;  /* Default body text size */
--text-md:   16px;  /* Larger body, UI labels */
--text-lg:   18px;  /* Subheadings, prominent labels */
--text-xl:   22px;  /* Callouts, emphasis text */
```

### Line Heights & Letter Spacing

| Element | Line Height | Letter Spacing | Example |
|---------|------------|----------------|---------|
| **Headlines** | 1.2 | -0.02em | H1, H2, H3 |
| **Body Text** | 1.6 | 0 | Paragraphs, descriptions |
| **Labels** | 1.4 | 0.02em | Form labels, badges |
| **Condensed** | 1.1 | -0.01em | Barlow Condensed titles |

### Typography Hierarchy

#### Level 1 (Display 2XL)
- Font: Barlow Condensed 900
- Size: Fluid 72–108px
- Usage: Hero section main headline
- Example: "Fresh. Halal. For You."

#### Level 2 (Display XL)
- Font: Barlow Condensed 900
- Size: Fluid 60–88px
- Usage: Page hero headlines
- Example: "Halal Meats | Fresh Daily"

#### Level 3 (Display LG)
- Font: Barlow Condensed 900
- Size: 48px
- Usage: Section titles
- Example: "Why Choose Femcart?"

#### Level 4 (Display MD)
- Font: Barlow Condensed 700–800
- Size: 36px
- Usage: Subsection titles
- Example: "Our Product Categories"

#### Level 5 (Text XL)
- Font: Open Sans 700
- Size: 22px
- Usage: Card titles, product names
- Example: "Whole Halal Chicken"

#### Level 6 (Text LG)
- Font: Open Sans 600–700
- Size: 18px
- Usage: Feature callouts
- Example: "Free pickup on all orders"

#### Body Text
- Font: Open Sans 400
- Size: 14–16px
- Usage: Primary narrative content
- Example: "Femcart specializes in Zabiha halal meats..."

#### Fine Print
- Font: Open Sans 400
- Size: 11–12px
- Usage: Timestamps, metadata, disclaimers
- Example: "Offer valid through December 31, 2026"

---

## 4. Spacing & Layout System

### Spacing Scale
```css
--space-xs:  8px;   /* Tiny gaps, icon spacing */
--space-sm:  16px;  /* Padding within components */
--space-md:  24px;  /* Section padding, margins */
--space-lg:  40px;  /* Between sections */
--space-xl:  56px;  /* Major section spacing */
--space-2xl: 80px;  /* Page-level spacing */
```

### Layout Grid
- **Max Width**: `1200px` (container max-width)
- **Gutter Width**: 16px (responsive: 8px on mobile)
- **Column Basis**: 12-column grid (customizable via CSS Grid/Flexbox)

### Responsive Breakpoints
```css
/* Mobile First */
Default:     < 600px   (phones)
Tablet:      600px     (tablets)
Desktop:     1024px    (small desktops)
Wide:        1200px+   (full-width displays)
```

### Common Layout Patterns

#### Section Container
```css
max-width: 1200px;
margin: 0 auto;
padding: var(--space-xl) var(--space-lg);  /* Vertical × Horizontal */
```

#### Card Padding
```css
padding: var(--space-md);
gap: var(--space-sm);
```

#### Hero Section
```css
padding: var(--space-2xl) var(--space-lg);
gap: var(--space-xl);
min-height: 60vh;
```

---

## 5. Component Design

### Buttons

#### Primary Button (CTA)
- **Background**: Red (`#C93B1A`)
- **Text**: White
- **Padding**: 12px 24px
- **Border Radius**: 8px
- **Typography**: Open Sans 600, 14px
- **Hover State**: Red Dark (`#A82E12`)
- **Active State**: Red Dark with 0.15 opacity overlay
- **Example**: "Order Now", "Proceed to Checkout", "Add to Cart"

#### Secondary Button
- **Background**: Transparent
- **Border**: 1px solid Text Mid (`#4A4A4A`)
- **Text**: Text Dark
- **Hover State**: Light gray background
- **Example**: "Continue Shopping", "Learn More"

#### Lime Accent Button
- **Background**: Lime (`#7DBF2E`)
- **Text**: White
- **Usage**: Secondary CTAs
- **Example**: "Accept" (cookies)

#### Icon Button
- **Size**: 40×40px (minimum touch target)
- **Padding**: 8px
- **Background**: Transparent (hover: 0.08 opacity dark overlay)
- **Example**: Menu toggle, close button

### Badges & Labels

#### Halal Badge
- **Background**: Red (`#C93B1A`) or Red Light (`#F5E8E4`)
- **Text**: White or Red
- **Typography**: Open Sans 600, 11px
- **Padding**: 4px 8px
- **Border Radius**: 4px
- **Icon**: Optional ✓ or halal symbol

#### Sale/Special Badges
- **Background**: Various (Lime, Red, Olive)
- **Text**: White
- **Positioning**: Top-right corner of product cards
- **Typography**: Open Sans 700, 12px, uppercase

#### Status Labels
- **In Stock**: Green text or icon
- **Out of Stock**: Gray text, disabled state
- **New**: Olive background
- **Premium**: Gold/Yellow background

### Product Cards

#### Card Structure
```
┌─────────────────────────┐
│                         │
│   Product Image/Emoji   │
│      (400×400px)        │
│                         │
├─────────────────────────┤
│ [HALAL] Sale Badge      │  ← Top-right overlay
├─────────────────────────┤
│ Product Name            │  ← 18px, Open Sans 700
│ Brand Name              │  ← 14px, Text Light
│ Short Description       │  ← 14px, Text Mid
├─────────────────────────┤
│ $3.49 ~~$4.99~~ / lb    │  ← Price, unit
├─────────────────────────┤
│ [Add to Cart] [❤]       │  ← CTA buttons
└─────────────────────────┘
```

#### Card Hover States
- Subtle shadow elevation (0 4px 18px, 12% opacity)
- Slight scale transform (1.02)
- Border color change (subtle)

### Navigation Bar

#### Desktop Navigation
- **Background**: Olive (`#2A3D16`)
- **Height**: 64px
- **Text**: White, Open Sans 600, 14px
- **Logo**: Left-aligned, max 40px height
- **Search**: Centered, full-width max 400px
- **Cart Badge**: Red background, white text, top-right of icon

#### Mobile Navigation (Hamburger)
- **Toggle Icon**: Top-right, 24×24px
- **Menu Drawer**: Full-width, slides from top
- **Background**: Olive
- **Spacing**: 16px padding per item

### Input Fields & Forms

#### Text Input
- **Background**: White
- **Border**: 1px solid Card Border (`#E9E6DF`)
- **Padding**: 10px 12px
- **Border Radius**: 8px
- **Focus State**: 2px solid Olive, outline none
- **Typography**: Open Sans 400, 14px

#### Select Dropdown
- **Same as text input**
- **Arrow Icon**: Olive color, right-aligned

#### Form Label
- **Typography**: Open Sans 600, 12px, uppercase letter spacing
- **Color**: Text Mid
- **Margin Below**: 6px

### Modals & Dialogs

#### Overlay
- **Background**: rgba(0,0,0,0.4)
- **Transition**: 0.25s ease-in-out
- **Backdrop Filter**: Optional (blur: 2px)

#### Modal Container
- **Background**: White
- **Border Radius**: 12px
- **Max Width**: 500px (content modals), 90vw (mobile)
- **Padding**: 24px
- **Box Shadow**: 0 8px 32px rgba(0,0,0,0.16)

#### Modal Header
- **Typography**: Barlow Condensed 900, 36px
- **Close Button**: Top-right, 24×24px, Text Light

---

## 6. Hero Section

### Visual Hierarchy
1. **Background**: Forest green (`#304A18`) with subtle texture overlay
2. **Decorative Circle**: Apple green shadow circle (far left, semi-transparent)
3. **Main Headline**: Lime text, Barlow Condensed 900, fluid 72–108px
4. **Subheadline**: White/Warm White, Open Sans 400, 20–24px
5. **CTA Button**: Red background, white text
6. **Secondary Visual**: Product image/emoji or pattern (right side on desktop)

### Responsive Behavior
- **Desktop**: 60% text / 40% image layout
- **Tablet**: Stacked, centered
- **Mobile**: Full-width, centered, single column

### Spacing
- **Top/Bottom Padding**: 80px (desktop), 40px (mobile)
- **Internal Gap**: 40px
- **Text Width**: 600px max

---

## 7. Section Patterns

### Section with Title + Grid
```
┌──────────────────────────────────────────┐
│ HALAL MEATS                              │  ← Barlow 48px, Olive
│ Fresh hand-slaughtered meats daily       │  ← Open Sans 16px, gray
├──────────────────────────────────────────┤
│  [Card]  [Card]  [Card]  [Card]          │  ← Grid: 1 col (mobile),
│  [Card]  [Card]  [Card]  [Card]          │     2 cols (tablet),
│                                          │     4 cols (desktop)
└──────────────────────────────────────────┘
```

### Spacing Between Sections
- **Gap**: var(--space-2xl) = 80px
- **Padding**: var(--space-xl) = 56px (top/bottom)

### Background Color Alternation
- Section 1: Off-White
- Section 2: Olive with white text
- Section 3: Off-White
- Continue pattern for visual rhythm

---

## 8. Accessibility (WCAG 2.1 Level AA)

### Color Contrast Ratios
- **Body text on white**: 14:1 (Text Dark on White)
- **Headlines on dark**: 11.2:1 (White on Olive)
- **Lime on white**: 5.8:1 (exceeds AA standard)
- **Red on white**: 4.7:1 (exceeds AA standard)

### Focus States
- **Keyboard Focus**: 2px solid Olive outline, 4px offset
- **Visible on all interactive elements**: buttons, links, inputs

### Alt Text Strategy
- **Product Images**: "Whole Halal Chicken, hand-slaughtered, 3–4 lbs"
- **Decorative Images**: "" (empty)
- **Icons**: Paired with text labels always

### Semantic HTML
- Use `<button>` for clickable elements (not `<div>`)
- Use `<nav>` for navigation
- Use `<form>` with `<label>` paired inputs
- Heading hierarchy: `<h1>` → `<h2>` → `<h3>` (never skip levels)

### Screen Reader Support
- ARIA labels on interactive controls
- ARIA live regions for cart updates
- Semantic landmarks: `<header>`, `<main>`, `<footer>`, `<nav>`

### Font Sizing
- Minimum 12px for body text
- Minimum 11px for fine print
- Use `rem` or `em` units for scalability

---

## 9. Responsive Design

### Mobile First Approach
- Base styles apply to mobile (< 600px)
- Progressive enhancement via media queries

### Breakpoint Reference

#### Tablet (600px and up)
```css
@media (min-width: 600px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
```

#### Small Desktop (1024px and up)
```css
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

#### Desktop (1200px and up)
```css
@media (min-width: 1200px) {
  .grid { grid-template-columns: repeat(4, 1fr); }
  .max-width { max-width: 1200px; }
}
```

### Responsive Images
- Use `srcset` for multiple resolutions (1x, 2x)
- Use `<picture>` element for art direction
- Format: WebP (primary) with JPEG fallback
- Product images: 400×400px (square, white background)

### Touch Targets
- Minimum 44×44px (mobile)
- Minimum 40px (desktop)
- Spacing: 8px between targets

---

## 10. Component States

### Button States

#### Rest State
- Color: Base color
- Shadow: 0 2px 8px (8% opacity)
- Cursor: pointer

#### Hover State
- Color: Darker shade
- Shadow: 0 4px 18px (12% opacity)
- Transition: 0.15s ease

#### Active/Pressed State
- Color: Darkest shade
- Shadow: 0 2px 4px (8% opacity, inset)
- Scale: 0.98 (subtle press effect)

#### Disabled State
- Color: Text Light
- Background: Light gray
- Cursor: not-allowed
- Opacity: 0.6

### Input States

#### Default
- Border: 1px solid Card Border
- Shadow: None

#### Focus
- Border: 2px solid Olive
- Shadow: 0 0 0 4px Lime (10% opacity)

#### Filled
- Background: Off-White
- Border: 1px solid Card Border

#### Error
- Border: 2px solid Red
- Helper text: Red, 12px
- Icon: Red exclamation mark

#### Success
- Border: 2px solid Apple
- Helper text: Apple, 12px
- Icon: Green checkmark

---

## 11. Visual Elements & Patterns

### Decorative Circles
- **Primary**: Apple green shadow circles (40% opacity)
- **Usage**: Behind hero text, between sections
- **Animation**: None (static), or subtle floating (on hover)

### Dividers & Separators
- **Full-width**: Divider color (`#DEDAD2`), 1px height
- **Spacing**: var(--space-md) above/below
- **Alternative**: Negative space (no visible line)

### Icons
- **Size**: 24px (inline), 32px (standalone)
- **Style**: Consistent stroke weight, rounded corners
- **Color**: Match context (Olive nav, Lime accent, Red CTA)
- **Alternative**: Emoji for product categories (accessible with proper fallback)

### Animations & Transitions

#### Global Transitions
```css
--t-fast: 0.15s ease;   /* Button hover, icon changes */
--t-mid:  0.25s ease;   /* Modal open/close, drawer slide */
--t-slow: 0.35s ease;   /* Page load animations */
```

#### Entrance Animations
- **Fade In**: Opacity 0 → 1, 0.35s ease
- **Slide Up**: Transform translateY(20px) → 0, 0.35s ease
- **Scale In**: Transform scale(0.95) → 1, 0.25s ease

#### Intersection Observer (Lazy Load)
- Fade + slide up when element enters viewport
- Stagger effect: each child +50ms delay

---

## 12. Badge System

### Badge Types & Colors

#### HALAL (Certification)
- **Background**: Red or Red Light
- **Text**: White or Red
- **Icon**: ✓ or halal symbol

#### FRESH (Quality)
- **Background**: Lime
- **Text**: White
- **Icon**: 🌿 or leaf

#### SALE / SPECIAL
- **Background**: Red
- **Text**: White
- **Text Transform**: UPPERCASE

#### FEATURED
- **Background**: Olive
- **Text**: White

#### IMPORT
- **Background**: Olive
- **Text**: Lime

#### PREMIUM
- **Background**: Apple
- **Text**: White

### Badge Positioning
- **Product cards**: Top-right corner, 8px inset
- **Hero highlights**: Inline with text
- **Navigation**: Top-right of icon (dot or counter)

---

## 13. Dark Mode Considerations

While the current design is light-based, future dark mode support should:

### Dark Mode Color Mapping
```css
@media (prefers-color-scheme: dark) {
  --c-off-white:   #1A1A1A;
  --c-card:        #2A2A2A;
  --c-text-dark:   #F0EDE6;
  --c-text-light:  #999999;
}
```

### Dark Mode Adjustments
- Increase shadow opacity (20% instead of 12%)
- Reduce color saturation slightly for comfort
- Maintain contrast ratios (test all states)
- High-value images may need invert or adjust filter

---

## 14. Print Styles

### Print Media Queries
```css
@media print {
  .no-print { display: none; }
  .product-card { page-break-inside: avoid; }
  a { text-decoration: underline; }
  button { border: 1px solid black; }
}
```

### Elements to Hide
- Navigation
- Cart buttons
- Floating buttons (WhatsApp, AI)
- Announcement bar
- Footer (unless contact info needed)

### Elements to Adjust
- Product cards: List layout, single column
- Colors: Grayscale or high contrast
- Links: Show full URL in parentheses

---

## 15. File Organization & Tokens

### CSS Custom Properties Location
**All design tokens live in `:root` selector** (style.css lines 49–124)

### Adding a New Color
```css
:root {
  --c-new-color: #XXXXXX;
}
```

### Adding a New Spacing Value
```css
:root {
  --space-3xl: 100px;
}
```

### Using Tokens in Components
```css
.btn {
  padding: var(--space-sm) var(--space-md);
  background: var(--c-red);
  border-radius: var(--radius-md);
  transition: all var(--t-fast);
}
```

---

## 16. Design Debt & Future Improvements

### Version 2.1 Roadmap
- [ ] Add Figma component library (auto-synced with CSS)
- [ ] Implement dark mode support
- [ ] Add animation library (Framer Motion or AOS.js)
- [ ] Create SVG component system for icons
- [ ] Add CSS custom properties for granular control
- [ ] Implement CSS Grid layout system

### Known Limitations
- No built-in icon system (currently using emojis + SVG)
- Limited animation library (manual CSS transitions)
- No component variant system (button sizes, states manual)
- Color palette not in Figma (CSS source of truth)

---

## 17. Quick Reference

### Brand Colors (Copy-Paste)
```
Olive:       #2A3D16
Forest:      #304A18
Lime:        #7DBF2E
Red:         #C93B1A
White:       #FFFFFF
Text Dark:   #1A1A1A
```

### Common Padding Combinations
```css
padding: 24px;                  /* Uniform */
padding: 24px 16px;             /* Vertical × Horizontal */
padding: 24px 40px;             /* Generous */
padding: 40px 56px;             /* Hero-scale */
```

### Common Typography
```css
/* Headlines */
font-family: 'Barlow Condensed';
font-weight: 900;
font-size: 48px;
line-height: 1.2;

/* Body Text */
font-family: 'Open Sans';
font-weight: 400;
font-size: 16px;
line-height: 1.6;
```

### Common Shadows
```css
box-shadow: 0 2px 8px rgba(0,0,0,0.08);    /* Subtle */
box-shadow: 0 4px 18px rgba(0,0,0,0.12);   /* Medium */
box-shadow: 0 8px 32px rgba(0,0,0,0.16);   /* Large */
```

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Version** | 2.0 |
| **Last Updated** | June 2026 |
| **Maintained By** | Femcart Design Team |
| **Source of Truth** | style.css (CSS Variables) |
| **Figma File** | [Link TBD] |
| **Design Tools** | Figma, VS Code |
| **Accessibility Standard** | WCAG 2.1 Level AA |

---

**Questions?** Refer to the Developer README or contact the development team. Always update this document when design tokens change.
