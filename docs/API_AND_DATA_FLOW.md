# API and Data Flow: Femcart Frontend

This document outlines how the `femcart-web` frontend communicates with the backend `femcart-api`.

## Configuration
The base API URL is managed in `src/lib/config.ts`:
```typescript
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
```

## Data Fetching Strategies

### 1. Client-Side Fetching (Zustand & Native Fetch)
Many interactions rely on native browser `fetch` calls. The global Zustand stores (`authStore`, `cartStore`) manually manage JWT headers and local storage syncs.
- Tokens are retrieved directly from `localStorage` (`femcart_access_token` or `token`).
- Requests manually append `Authorization: Bearer <token>`.

### 2. Axios (Third-party & Complex Requests)
While `fetch` is used in stores, `axios` is listed as a dependency in `package.json`. It is typically used for more complex forms, interceptors, or legacy data-fetching logic inside components.

### 3. Next.js Server Components
Since the project uses the App Router (`src/app/`), top-level pages likely perform server-side fetching before pushing data down to client components.
- e.g., The Page Builder fetches the JSON document via `getBuilderPublicPage` natively using `cache: 'no-store'` or standard Next.js revalidation rules.

## Authentication Flow
1. **Login**: User logs in, backend returns JWT tokens.
2. **Storage**: Tokens are saved to `localStorage`.
3. **Hydration**: On mount, `AuthContext` triggers `authStore.fetchUser()`. It reads local storage and optionally calls `/api/users/profile` to get the latest DB state.
4. **Logout**: Local storage keys are destroyed, and `user` state is wiped.

## Error Handling
Errors during data syncing (like `fetchBackendCart` failing) are currently logged to the console using a custom `Logger` (`src/lib/logger.ts`) or `console.error`. They gracefully degrade without breaking the application state.
