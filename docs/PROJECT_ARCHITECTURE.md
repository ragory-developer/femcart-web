# Project Architecture: Femcart Frontend

This document outlines the architecture for the `femcart-web` frontend (Femcart).

## Next.js App Router
The project uses the Next.js App Router (`src/app/`).
- `src/app/admin`: Admin dashboard routes.
- `src/app/(store)`: Public storefront routes (Home, Product, Cart, Checkout).

## Component Structure
The UI is divided into feature-specific directories under `src/components`:
- `admin/`: Admin UI components.
- `builder/`: Components used by the page builder.
- `checkout/`, `product/`, `home/`, `layout/`: Storefront UI.
- `ui/`: Shared, reusable base components (often headless or Radix-based).
