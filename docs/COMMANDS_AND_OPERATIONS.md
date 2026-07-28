# Commands and Operations Guide

This document catalogs all actionable commands for the `femcart-web` frontend project.

## Standard Scripts

| Command | Purpose | When To Use | Environment | Expected Result | Notes |
|---------|---------|-------------|-------------|-----------------|-------|
| `npm install` | Install dependencies | Initial setup or after package.json changes | Local/CI | Dependencies installed in `node_modules/` | Run this first. |
| `npm run dev` | Start development server | Local development | Local | Starts Next.js dev server on port 3000 | Enables hot-module reloading. |
| `npm run build` | Build production bundle | Before deployment | Server/CI | Generates optimized `.next/` folder | Must run before `start`. |
| `npm run start` | Start production server | Production | Server | Application runs optimized | Requires `npm run build` first. |
| `npm run lint` | Run ESLint | Development/CI | Local/CI | Checks for syntax/style issues | Good to run before pushing code. |
| `npm run test` | Run Vitest suite | Development/CI | Local/CI | Executes all `.test.tsx` files | - |

## Troubleshooting

| Problem | Symptoms | Root Cause | Fix Command | Additional Steps |
|---------|----------|------------|-------------|------------------|
| Build Failed | `npm run build` throws errors | TypeScript or ESLint errors | `npm run lint` | Fix the specific TS/Lint errors in the files. |
| Dev Server Crashes | `npm run dev` exits immediately | Port 3000 in use | `npx kill-port 3000` | Restart the dev server. |
| Module Not Found | `Cannot find module X` | Missing package | `npm install` | - |
| Stale Cache | Next.js not reflecting changes | Corrupt `.next` cache | `rm -rf .next` | Restart the dev server or run build again. |
