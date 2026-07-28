# State Management: Femcart Frontend

The Femcart frontend uses **Zustand** as its primary global state management library, chosen for its simplicity and unopinionated nature.

## Zustand Stores

Located in `src/store/`:

### 1. `authStore.ts`
Manages the authentication state of the user.
- **State**: `user` (User object or null), `isAuthenticated` (boolean), `loading` (boolean).
- **Persistence**: Relies on `localStorage` (`femcart_access_token`, `femcart_user`). It checks these keys during `fetchUser()` to hydrate the store on initial load.
- **Backend Sync**: Attempts to hit `/api/users/profile` to get the latest user data and refresh local storage.

### 2. `cartStore.ts`
Manages the user's shopping cart and side-drawer state.
- **State**: `items` (array of `CartItem`), `isOpen` (boolean for cart drawer).
- **Persistence**: Uses Zustand's `persist` middleware to automatically save the cart to `localStorage` under the key `femcart-storage`.
- **Backend Sync**: 
  - `syncLocalCartToBackend()`: Pushes the current local items to the backend via `/api/cart/sync` if the user is logged in.
  - `fetchBackendCart()`: Pulls the latest backend cart and overwrites the local state (only if backend has items).

### 3. `navigationStore.ts` (Assumed)
Likely manages the mobile sidebar, header state, or active category navigation.

### 4. `pageBuilderStore.ts` (Assumed)
Manages the state of the dynamic page builder editor (e.g., currently selected section, drag-and-drop state, template JSON).

### 5. `settingsStore.ts` (Assumed)
Manages global store settings fetched from the backend (e.g., currency, stock limits, site logo).

## Context Providers
Located in `src/context/` and `src/components/providers/`:
- **`AuthContext.tsx`**: Likely wraps the app to trigger `authStore.fetchUser()` on mount.
- **`SettingsProvider.tsx`**: Loads global settings on initial app load.
- **`NavigationProvider.tsx`**: Handles complex routing logic or category caching.
