# Environment Setup Guide

Follow this guide to set up the `femcart-web` frontend.

## Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd femcart-web
   ```

2. **Install Node.js**: Ensure you are running Node.js 18+ (or 20+, as recommended by recent Next.js versions).

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Environment Variables**:
   Create a `.env.local` file in the root directory.
   ```env
   # API Backend URL (adjust port if backend runs elsewhere)
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Access the frontend at `http://localhost:3000`.

## Production Setup

For deploying to production (e.g., Vercel or a VPS):

1. **Environment Variables**:
   Set `NEXT_PUBLIC_API_URL` to your production backend URL (e.g., `https://api.femcart.com`).

2. **Build**:
   ```bash
   npm run build
   ```

3. **Start**:
   ```bash
   npm run start
   ```
