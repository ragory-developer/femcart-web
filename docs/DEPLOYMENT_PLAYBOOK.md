# Deployment Playbook

This document details the standard deployment steps for the `femcart-web` Next.js frontend.

## Fresh Deployment (VPS / Docker)

1. Pull the latest code to the server.
2. Install dependencies: `npm install --omit=dev` (or `npm install` if builder needs dev dependencies, Next.js build typically needs them).
3. Set your production `.env.local` containing `NEXT_PUBLIC_API_URL`.
4. Build the application: `npm run build`.
5. Start the server using PM2 or Docker:
   ```bash
   pm2 start npm --name "femcart-web" -- start
   ```

## Standard Update Deployment

1. Pull the latest branch (`git pull origin main`).
2. Install any new dependencies (`npm install`).
3. Build the new optimized bundle:
   ```bash
   npm run build
   ```
4. Restart the PM2 process or container:
   ```bash
   pm2 restart femcart-web
   ```

## Rollback Procedure

If a deployment causes critical UI breaks or build failures:
1. Revert to the last stable commit:
   ```bash
   git checkout <previous_commit_hash>
   ```
2. Re-install dependencies to match the old commit: `npm install`
3. Rebuild the application: `npm run build`
4. Restart the service: `pm2 restart femcart-web`

## Cache Clearing
Next.js caches heavily (Data Cache, Full Route Cache). If you update the Page Builder layout in the backend but it doesn't reflect on the frontend:
- Ensure the backend API routes hit the `revalidatePath` or `revalidateTag` endpoints if configured.
- Alternatively, force a hard restart and clear the `.next` cache directory before rebuilding during a manual intervention.
