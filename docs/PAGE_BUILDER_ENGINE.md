# Page Builder Engine: Femcart Frontend

The Femcart frontend features a sophisticated dynamic **Page Builder** engine located in `src/page-builder/`. This engine allows admins to build and configure pages (such as the Homepage or custom landing pages) via a JSON document, which the frontend then parses and renders dynamically.

## Core Concepts

### 1. The Registry (`src/page-builder/registry.tsx`)
The registry is the heart of the engine. It maps a string identifier (e.g., `HeroBanner`) to its actual React component, its Editor UI, and its default properties.
- **`type`**: The unique identifier for the section.
- **`variants`**: A single component can have multiple visual variants (e.g., `default`, `minimal`). Each variant points to a specific `Renderer` component.
- **`resolveProps`**: A function that can inject dynamic data into the section before it renders (e.g., injecting the active product context, or fetching random products for a cross-sell section).
- **`Editor`**: The React component used in the admin panel to configure the properties of this section.

### 2. The Document JSON & Relational Storage
While the frontend deals with a reconstructed JSON document at runtime, the backend database strictly stores sections in a **relational schema** (`BuilderSection` and `BuilderSectionStyle` tables). The backend reconstructs the required layout format on-the-fly.
The frontend receives this structure:
```json
{
  "sections": [
    {
      "id": "cmr7d6y1702mxq",
      "sectionId": "herobanner_123",
      "type": "HeroBanner",
      "variant": "default",
      "props": { "title": "Fresh Groceries", "autoPlay": true },
      "styles": {
        "theme": "brand",
        "alignment": "center",
        "spacing": "medium"
      }
    }
  ]
}
```

> **Design Rule:** The styling of a section (`styles`) is restricted to specific layout tokens (e.g., `theme`, `alignment`, `spacing`). Arbitrary fields like `customBgColor` or `paddingX` have been completely removed to preserve design system integrity.

### 3. Rendering Pipeline
When a user visits a dynamic page (e.g., `/` or `/builder/[key]`):
1. The frontend fetches the JSON document via `getBuilderPublicPage(key)` in `api.ts`.
2. `BuilderPageRenderer.tsx` iterates over the `sections` array.
3. For each section, it looks up the definition in the registry.
4. It calls `resolveProps` to merge stored static props with any dynamic context (like products or categories).
5. It passes the resolved props into `BuilderSectionRenderer.tsx`, which mounts the exact `Renderer` component for that variant.

### 4. Admin Editor
When an admin edits a page:
- `PageBuilder.tsx` provides a drag-and-drop interface (likely using `@dnd-kit/react`).
- Selecting a block opens the corresponding `Editor` defined in the registry, allowing real-time prop modification.
- Changes update the JSON state (managed by `pageBuilderStore.ts`) and are synced to the backend via `/api/builder/pages/[key]`.

## Important Rules for Development
- **Adding new sections**: To create a new draggable block, you must create the React component, an Editor component for it, and then register it inside `sectionRegistry` in `registry.tsx`.
- **Deprecations**: The registry supports deprecating old section types and auto-migrating them to new types (e.g., migrating specific seasonal banners to a generic `SpecialOffersBanner` with a variant).
